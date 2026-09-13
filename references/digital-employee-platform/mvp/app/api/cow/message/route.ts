import {NextResponse} from 'next/server';
import {z} from 'zod';
import {errorMessage, cowFetch} from '../../../../lib/cowagent';
import {getEmployee} from '../../../../lib/employee-store';
import {attachmentInputSchema, reviewTask} from '../../../../lib/security-review';

const messageSchema = z.object({
  sessionId: z.string().min(1).max(120),
  employeeId: z.string().min(1),
  message: z.string().trim().min(1).max(12000),
  reviewConfirmed: z.boolean().optional(),
  attachments: z.array(attachmentInputSchema).max(8).default([]),
});

export async function POST(request: Request) {
  try {
    const input = messageSchema.parse(await request.json());
    const employee = await getEmployee(input.employeeId);
    if (!employee) return NextResponse.json({error: '找不到该数字员工'}, {status: 404});

    const review = input.reviewConfirmed ? undefined : await reviewTask(input.message, input.attachments);
    if (review && review.decision !== 'allow') return NextResponse.json({status: review.decision, review});

    const prompt = [
      `[数字员工岗位] ${employee.title} / ${employee.category}`,
      employee.systemPrompt,
      '只使用实际可用的工具，并如实报告工具执行状态和结果。',
      input.attachments.length ? `[附件密级]\n${input.attachments.map((attachment) => `- ${attachment.file_name}: ${attachment.classification}`).join('\n')}` : '',
      '',
      `[用户任务]\n${input.message}`,
    ].join('\n');

    const response = await cowFetch('/message', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({session_id: input.sessionId, message: prompt, attachments: input.attachments, stream: true, lang: 'zh'}),
    }, input.employeeId);

    const payload = (await response.json()) as {request_id?: string; message?: string};
    if (!response.ok || !payload.request_id) {
      return NextResponse.json({error: payload.message ?? `Evo-Harness 请求失败（HTTP ${response.status}）`}, {status: 502});
    }

    return NextResponse.json({status: 'running', requestId: payload.request_id, review});
  } catch (error) {
    return NextResponse.json({error: errorMessage(error)}, {status: 503});
  }
}
