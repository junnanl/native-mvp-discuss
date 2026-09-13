import {NextResponse} from 'next/server';
import {z} from 'zod';
import {adminSessionCookie, validAdminCredentials} from '@/lib/admin-auth';

const schema = z.object({username: z.string(), password: z.string()});

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json());
  if (!input.success || !validAdminCredentials(input.data.username, input.data.password)) {
    return NextResponse.json({error: '账号或密码错误'}, {status: 401});
  }
  const response = NextResponse.json({authenticated: true});
  response.cookies.set(adminSessionCookie());
  return response;
}
