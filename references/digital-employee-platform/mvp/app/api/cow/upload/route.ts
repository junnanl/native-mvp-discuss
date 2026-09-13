import {NextResponse} from 'next/server';
import {cowFetch, errorMessage} from '@/lib/cowagent';
import {classificationSchema} from '@/lib/security-review';

export async function POST(request: Request) {
  try {
    const input = await request.formData();
    const employeeId = String(input.get('employeeId') ?? '');
    const file = input.get('file');
    const classification = classificationSchema.safeParse(input.get('classification'));
    if (!(file instanceof File)) return NextResponse.json({error: '请选择附件'}, {status: 400});
    if (!employeeId) return NextResponse.json({error: '缺少员工标识'}, {status: 400});
    if (!classification.success) return NextResponse.json({error: '请选择公开、受控或内部'}, {status: 400});
    if (file.size > 50 * 1024 * 1024) return NextResponse.json({error: '单个附件不能超过 50 MB'}, {status: 400});

    const form = new FormData();
    form.set('file', file);
    form.set('session_id', String(input.get('sessionId') ?? 'mvp'));
    const response = await cowFetch('/upload', {method: 'POST', body: form}, employeeId);
    const payload = await response.json() as {status?: string; message?: string; file_path?: string; file_name?: string; file_type?: string; preview_url?: string};
    if (!response.ok || payload.status !== 'success' || !payload.file_path) return NextResponse.json({error: payload.message ?? '附件上传失败'}, {status: 502});
    return NextResponse.json({attachment: {...payload, classification: classification.data, employeeId}});
  } catch (error) {
    return NextResponse.json({error: errorMessage(error)}, {status: 503});
  }
}
