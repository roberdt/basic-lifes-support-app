import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { approval } = await request.json();

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('[Proxy PUT /api/companies/[id]/approval] Incoming Authorization:', authHeader ? `${authHeader.substring(0, 25)}...` : 'NULL');
    const targetUrl = `${apiBase}/api/companies/${id}/approval`;
    console.log('[Proxy PUT /api/companies/[id]/approval] Forwarding PUT to backend:', targetUrl, 'body:', { approval });

    const res = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ approval }),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    console.log('[Proxy PUT /api/companies/[id]/approval] Backend response status:', res.status, 'body:', typeof data === 'object' ? JSON.stringify(data).substring(0, 150) : String(data).substring(0, 150));

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy PUT /api/companies/[id]/approval:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
