import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const body = await request.json();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`[Proxy PUT /api/companies/${id}/users/${userId}] Forwarding PUT to backend...`);
    const targetUrl = `${apiBase}/api/companies/${id}/users/${userId}`;

    const res = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    console.log(`[Proxy PUT /api/companies/${id}/users/${userId}] Backend response status:`, res.status);
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy PUT /api/companies/[id]/users/[userId]:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`[Proxy DELETE /api/companies/${id}/users/${userId}] Forwarding DELETE to backend...`);
    const targetUrl = `${apiBase}/api/companies/${id}/users/${userId}`;

    const res = await fetch(targetUrl, {
      method: 'DELETE',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    console.log(`[Proxy DELETE /api/companies/${id}/users/${userId}] Backend response status:`, res.status);
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy DELETE /api/companies/[id]/users/[userId]:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
