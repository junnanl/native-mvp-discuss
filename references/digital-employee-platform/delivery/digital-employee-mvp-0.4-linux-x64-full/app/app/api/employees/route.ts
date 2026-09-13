import {NextResponse} from 'next/server';
import {readEmployees} from '@/lib/employee-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allEmployees = await readEmployees();
    const employees = allEmployees.filter((employee) => employee.status === 'enabled').map(({harnessUrl, harnessPassword, ...employee}) => employee);
    const dispatchQuestions = allEmployees.find((employee) => employee.id === 'manager')?.quickQuestions.slice(0, 2) ?? [];
    return NextResponse.json({employees, dispatchQuestions});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : '员工配置读取失败'}, {status: 500});
  }
}
