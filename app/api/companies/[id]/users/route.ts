import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`[Proxy GET /api/companies/${id}/users] Forwarding GET to backend...`);
    const targetUrl = `${apiBase}/api/companies/${id}/users`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    console.log(`[Proxy GET /api/companies/${id}/users] Backend response status:`, res.status);
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy GET /api/companies/[id]/users:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`[Proxy POST /api/companies/${id}/users] Forwarding POST to backend...`);
    const targetUrl = `${apiBase}/api/companies/${id}/users`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    console.log(`[Proxy POST /api/companies/${id}/users] Backend response status:`, res.status);
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy POST /api/companies/[id]/users:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
