import {cookies} from 'next/headers';

export const adminCookieName = 'mvp_admin_session';
const adminCookieValue = 'admin-demo-session';

export function validAdminCredentials(username: string, password: string) {
  return username === 'admin' && password === 'admin';
}

export async function isAdminAuthenticated() {
  return (await cookies()).get(adminCookieName)?.value === adminCookieValue;
}

export function adminSessionCookie() {
  return {name: adminCookieName, value: adminCookieValue, httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 8};
}
