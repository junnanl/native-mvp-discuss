import {NextResponse} from 'next/server';
import {cowFetch, errorMessage} from '../../../../lib/cowagent';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const employeeId = url.searchParams.get('employeeId') ?? '';
  if (!path || path.length > 1000 || !employeeId) return NextResponse.json({error: '缺少文件路径或员工标识'}, {status: 400});

  try {
    const response = await cowFetch(`/api/file?path=${encodeURIComponent(path)}`, {}, employeeId);
    if (!response.ok || !response.body) {
      return NextResponse.json({error: `文件读取失败（HTTP ${response.status}）`}, {status: 502});
    }
    const headers = new Headers();
    const contentType = response.headers.get('content-type');
    const disposition = response.headers.get('content-disposition');
    if (contentType) headers.set('content-type', contentType);
    if (disposition) headers.set('content-disposition', disposition);
    return new NextResponse(response.body, {status: response.status, headers});
  } catch (error) {
    return NextResponse.json({error: errorMessage(error)}, {status: 503});
  }
}
