import {promises as fs} from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {isAdminAuthenticated} from '@/lib/admin-auth';

const extensions: Record<string, string> = {'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp'};

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({error: '请先登录'}, {status: 401});
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({error: '请选择头像文件'}, {status: 400});
    const extension = extensions[file.type];
    if (!extension || file.size > 5 * 1024 * 1024) return NextResponse.json({error: '头像仅支持 PNG、JPG、WebP，且不能超过 5 MB'}, {status: 400});
    const name = `employee-${randomUUID().slice(0, 12)}${extension}`;
    const directory = path.join(process.cwd(), 'public', 'avatars');
    await fs.mkdir(directory, {recursive: true});
    await fs.writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({avatar: `/avatars/${name}`});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : '头像上传失败'}, {status: 500});
  }
}
