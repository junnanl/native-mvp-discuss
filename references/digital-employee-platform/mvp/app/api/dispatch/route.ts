import {NextResponse} from 'next/server';
import {z} from 'zod';
import {readEmployees} from '@/lib/employee-store';
import {extractStructuredJson, runInternalEmployee} from '@/lib/internal-employee-run';

const inputSchema = z.object({task: z.string().trim().min(2).max(2000)});
const recommendationSchema = z.object({
  primaryEmployeeId: z.string().min(1),
  candidateEmployeeIds: z.array(z.string().min(1)).max(3),
  reason: z.string().trim().min(1).max(300),
});

export async function POST(request: Request) {
  try {
    const {task} = inputSchema.parse(await request.json());
    const employees = (await readEmployees()).filter((employee) => employee.status === 'enabled');
    const candidates = employees.map(({id, title, category, description, tags, maturity, version, capabilities}) => ({
      id, title, category, description, tags, maturity, version, capabilities: capabilities.map(({name, kind}) => ({name, kind})),
    }));
    const run = await runInternalEmployee('manager', JSON.stringify({task, candidates}), 20_000);
    const recommendation = recommendationSchema.parse(extractStructuredJson(run.content));
    const enabledIds = new Set(employees.map((employee) => employee.id));
    if (!enabledIds.has(recommendation.primaryEmployeeId)) throw new Error('任务经理返回了不可用员工');
    const candidateEmployeeIds = [...new Set([recommendation.primaryEmployeeId, ...recommendation.candidateEmployeeIds])].filter((id) => enabledIds.has(id)).slice(0, 3);
    return NextResponse.json({recommendation: {...recommendation, candidateEmployeeIds}, trace: {requestId: run.requestId, durationMs: run.durationMs, phases: run.phases, tools: run.tools}});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : '暂时无法自动推荐'}, {status: 503});
  }
}
