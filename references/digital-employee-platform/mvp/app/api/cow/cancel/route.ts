import {NextResponse} from 'next/server';
import {z} from 'zod';
import {cowFetch, errorMessage} from '../../../../lib/cowagent';

const cancelSchema = z.object({requestId: z.string().min(1).max(120), employeeId: z.string().min(1)});

export async function POST(request: Request) {
  try {
    const {requestId, employeeId} = cancelSchema.parse(await request.json());
    const response = await cowFetch('/cancel', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({request_id: requestId}),
    }, employeeId);
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, {status: response.ok ? 200 : 502});
  } catch (error) {
    return NextResponse.json({error: errorMessage(error)}, {status: 503});
  }
}
