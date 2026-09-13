'use client';

import {LockKeyhole, LogIn} from 'lucide-react';
import {useState} from 'react';
import {Button} from './ui/button';
import {Card, CardContent} from './ui/card';
import {Input} from './ui/input';

export function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin/login', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({username, password})});
    const payload = await response.json() as {error?: string};
    if (response.ok) window.location.reload();
    else setError(payload.error ?? '登录失败');
    setLoading(false);
  }

  return <main className="grid min-h-screen place-items-center p-5"><Card className="w-full max-w-sm shadow-xl"><CardContent className="grid gap-6 p-7"><div className="grid gap-3"><span className="grid size-11 place-items-center rounded-md bg-foreground text-background"><LockKeyhole size={20} /></span><div><h1 className="font-serif text-2xl font-semibold">员工配置中心</h1><p className="mt-1 text-xs text-muted-foreground">原型管理入口</p></div></div><form className="grid gap-4" onSubmit={submit}><label className="grid gap-2 text-xs font-medium">账号<Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label><label className="grid gap-2 text-xs font-medium">密码<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{error && <p className="text-xs text-destructive">{error}</p>}<Button disabled={loading}><LogIn size={15} />{loading ? '登录中' : '进入管理页'}</Button></form></CardContent></Card></main>;
}
