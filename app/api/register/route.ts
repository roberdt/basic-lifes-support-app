import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

    const res = await fetch(`${apiBase}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy POST /api/register:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
