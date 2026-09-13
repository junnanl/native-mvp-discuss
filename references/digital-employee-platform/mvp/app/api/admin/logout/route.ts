import {NextResponse} from 'next/server';
import {adminCookieName} from '@/lib/admin-auth';

export async function POST() {
  const response = NextResponse.json({authenticated: false});
  response.cookies.set({name: adminCookieName, value: '', path: '/', maxAge: 0});
  return response;
}
