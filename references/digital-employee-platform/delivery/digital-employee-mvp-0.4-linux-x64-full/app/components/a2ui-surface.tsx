'use client';

import {A2UIViewer, type A2UIActionEvent, type ComponentInstance} from '@a2ui/react';
import {z} from 'zod';
import type {Employee} from '../lib/agents';
import type {OutputAttachment, ReviewResult} from '../lib/chat-types';

const actionSchema = z.object({
  name: z.enum(['prefill_prompt', 'submit_prompt', 'confirm_and_continue', 'cancel_run', 'classify_artifact']),
  context: z.array(z.object({key: z.string(), value: z.object({literalString: z.string()})})).max(8).optional(),
});
const componentSchema = z.object({id: z.string(), component: z.record(z.unknown())});
const surfaceSchema = z.object({root: z.string(), components: z.array(componentSchema).min(1).max(24)});

export type A2uiSurface = z.infer<typeof surfaceSchema>;

function text(id: string, value: string, usageHint: 'h2' | 'body' | 'caption' = 'body') {
  return {id, component: {Text: {text: {literalString: value}, usageHint}}};
}

type ActionName = z.infer<typeof actionSchema>['name'];

function action(name: ActionName, context: Record<string, string>) {
  return {name, context: Object.entries(context).map(([key, value]) => ({key, value: {literalString: value}}))};
}

export function staticEmployeeSurface(employee: Employee): A2uiSurface {
  const questionIds = employee.quickQuestions.map((_, index) => `mvp-question-${index}`);
  return {
    root: 'mvp-root',
    components: [
      {id: 'mvp-root', component: {Card: {child: 'mvp-content'}}},
      {id: 'mvp-content', component: {Column: {children: {explicitList: ['mvp-eyebrow', 'mvp-title', 'mvp-copy', ...questionIds]}, alignment: 'stretch'}}},
      text('mvp-eyebrow', '开始一轮短任务', 'caption'),
      text('mvp-title', `先给${employee.title}一个具体问题`, 'h2'),
      text('mvp-copy', '快捷问题会填入输入框，你仍然可以在发送前修改。', 'body'),
      ...employee.quickQuestions.map((prompt, index) => ({
        id: questionIds[index],
        component: {Button: {child: `mvp-question-label-${index}`, action: action('prefill_prompt', {prompt})}},
      })),
      ...employee.quickQuestions.map((prompt, index) => text(`mvp-question-label-${index}`, prompt, 'body')),
    ],
  };
}

export function securityConfirmationSurface(review: ReviewResult): A2uiSurface {
  return decisionSurface({
    prefix: 'security',
    eyebrow: '安全审查 / 需要确认',
    title: '确认后继续执行',
    copy: review.summary,
    detail: review.categories.length ? `风险提示：${review.categories.join('、')}` : '请确认本次任务的内容和影响范围。',
    actions: [
      {name: 'cancel_run', label: '取消任务'},
      {name: 'confirm_and_continue', label: '确认继续'},
    ],
  });
}

export function artifactClassificationSurface(attachment: OutputAttachment): A2uiSurface {
  return decisionSurface({
    prefix: `artifact-${attachment.id.replace(/[^a-zA-Z0-9-]/g, '-')}`,
    eyebrow: '文件交付 / 密级标注',
    title: attachment.name,
    copy: '选择密级后，这个文件才会显示预览和下载入口。',
    detail: attachment.size ? `文件大小：${formatSize(attachment.size)}` : '请选择最符合使用范围的密级。',
    actions: [
      {name: 'classify_artifact', label: '公开', context: {artifactId: attachment.id, classification: 'public'}},
      {name: 'classify_artifact', label: '受控', context: {artifactId: attachment.id, classification: 'controlled'}},
      {name: 'classify_artifact', label: '内部', context: {artifactId: attachment.id, classification: 'internal'}},
    ],
  });
}

function decisionSurface(input: {prefix: string; eyebrow: string; title: string; copy: string; detail: string; actions: Array<{name: ActionName; label: string; context?: Record<string, string>}>}): A2uiSurface {
  const ids = input.actions.map((_, index) => `${input.prefix}-action-${index}`);
  return {
    root: `${input.prefix}-root`,
    components: [
      {id: `${input.prefix}-root`, component: {Card: {child: `${input.prefix}-content`}}},
      {id: `${input.prefix}-content`, component: {Column: {children: {explicitList: [`${input.prefix}-eyebrow`, `${input.prefix}-title`, `${input.prefix}-copy`, `${input.prefix}-detail`, ...ids]}, alignment: 'stretch'}}},
      text(`${input.prefix}-eyebrow`, input.eyebrow, 'caption'),
      text(`${input.prefix}-title`, input.title, 'h2'),
      text(`${input.prefix}-copy`, input.copy, 'body'),
      text(`${input.prefix}-detail`, input.detail, 'caption'),
      ...input.actions.map((item, index) => ({id: ids[index], component: {Button: {child: `${ids[index]}-label`, action: action(item.name, item.context ?? {})}}})),
      ...input.actions.map((item, index) => text(`${ids[index]}-label`, item.label, 'body')),
    ],
  };
}

export function parseA2uiSurface(value: unknown): A2uiSurface | null {
  const parsed = surfaceSchema.safeParse(value);
  if (!parsed.success) return null;

  const allowed = parsed.data.components.every((item) => {
    const keys = Object.keys(item.component);
    if (keys.length !== 1 || !['Card', 'Column', 'Text', 'Button'].includes(keys[0])) return false;
    if (keys[0] === 'Button') return actionSchema.safeParse((item.component.Button as {action?: unknown}).action).success;
    return true;
  });
  return allowed ? parsed.data : null;
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function A2uiSurfaceView({surface, onPrompt, onAction}: {surface: A2uiSurface; onPrompt?: (prompt: string, submit: boolean) => void; onAction?: (name: ActionName, context: Record<string, unknown>) => void}) {
  return (
    <div className="a2ui-wrap">
      <A2UIViewer
        root={surface.root}
        components={surface.components as ComponentInstance[]}
        onAction={(event) => {
          const parsed = actionSchema.shape.name.safeParse(event.actionName);
          if (!parsed.success) return;
          const prompt = event.context.prompt;
          if ((parsed.data === 'prefill_prompt' || parsed.data === 'submit_prompt') && typeof prompt === 'string') onPrompt?.(prompt, parsed.data === 'submit_prompt');
          onAction?.(parsed.data, event.context);
        }}
      />
    </div>
  );
}
