import {NextResponse} from 'next/server';
import {readEmployees, writeEmployees} from '@/lib/employee-store';
import {isAdminAuthenticated} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({error: '请先登录'}, {status: 401});
  try {
    return NextResponse.json({employees: await readEmployees()});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : '员工配置读取失败'}, {status: 500});
  }
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({error: '请先登录'}, {status: 401});
  try {
    const payload = await request.json() as {employees?: unknown};
    return NextResponse.json({employees: await writeEmployees(payload.employees)});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : '员工配置保存失败'}, {status: 400});
  }
}
