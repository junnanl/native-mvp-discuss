import {z} from 'zod';
import {extractStructuredJson, runInternalEmployee, type InternalRunTrace} from './internal-employee-run';

export const classificationSchema = z.enum(['public', 'controlled', 'internal']);
export type Classification = z.infer<typeof classificationSchema>;

export const attachmentInputSchema = z.object({
  file_path: z.string().min(1).max(1000),
  file_name: z.string().min(1).max(240),
  file_type: z.string().min(1).max(40),
  classification: classificationSchema,
});

export const reviewResultSchema = z.object({
  decision: z.enum(['allow', 'deny', 'confirm']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  categories: z.array(z.string().min(1).max(60)).max(8),
  summary: z.string().min(1).max(500),
});

export type ReviewResult = z.infer<typeof reviewResultSchema> & {source: 'employee' | 'fallback'; trace?: InternalRunTrace};
export type ReviewAttachment = z.infer<typeof attachmentInputSchema>;

export async function reviewTask(message: string, attachments: ReviewAttachment[]): Promise<ReviewResult> {
  const task = JSON.stringify({
    userTask: message,
    attachments: attachments.map(({file_name, file_type, classification}) => ({name: file_name, type: file_type, classification})),
  });

  try {
    const run = await runInternalEmployee('security-reviewer', task);
    const result = reviewResultSchema.parse(extractStructuredJson(run.content));
    return {...result, source: 'employee', trace: {requestId: run.requestId, durationMs: run.durationMs, phases: run.phases, tools: run.tools}};
  } catch (error) {
    console.warn('[security-reviewer] internal run unavailable', error);
    return {
      decision: 'confirm',
      riskLevel: 'medium',
      categories: ['安全审查需要人工确认'],
      summary: error instanceof Error ? `${error.message}，请确认是否继续。` : '安全审查暂时不可用，请确认是否继续。',
      source: 'fallback',
    };
  }
}
