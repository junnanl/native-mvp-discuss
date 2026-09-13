import {NextResponse} from 'next/server';
import {cowFetch, errorMessage} from '../../../../lib/cowagent';

const allowedPrefixes = ['/uploads/', '/preview/'];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path') ?? '';
  const employeeId = url.searchParams.get('employeeId') ?? '';
  if (!employeeId || !allowedPrefixes.some((prefix) => path.startsWith(prefix)) || path.includes('..')) {
    return NextResponse.json({error: '不允许访问该资源'}, {status: 400});
  }

  try {
    const response = await cowFetch(path, {}, employeeId);
    if (!response.ok || !response.body) {
      return NextResponse.json({error: `资源读取失败（HTTP ${response.status}）`}, {status: 502});
    }
    const headers = new Headers();
    for (const name of ['content-type', 'content-disposition', 'content-length']) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set('x-content-type-options', 'nosniff');
    if ((response.headers.get('content-type') ?? '').includes('text/html')) {
      headers.set('content-security-policy', "sandbox; default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'");
    }
    return new NextResponse(response.body, {status: response.status, headers});
  } catch (error) {
    return NextResponse.json({error: errorMessage(error)}, {status: 503});
  }
}
