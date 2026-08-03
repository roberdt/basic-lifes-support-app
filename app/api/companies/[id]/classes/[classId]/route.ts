import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; classId: string }> }
) {
  try {
    const { id, classId } = await params;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`[Proxy GET /api/companies/${id}/classes/${classId}] Forwarding to backend...`);
    // Note: The backend uses a global /api/classes/${id} but we wrap it in company scope
    const res = await fetch(`${apiBase}/api/classes/${classId}`, {
      method: 'GET',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy GET /api/companies/[id]/classes/[classId]:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; classId: string }> }
) {
  try {
    const { id, classId } = await params;
    const body = await request.json();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`[Proxy PUT /api/companies/${id}/classes/${classId}] Forwarding to backend...`);
    const res = await fetch(`${apiBase}/api/classes/${classId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy PUT /api/companies/[id]/classes/[classId]:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; classId: string }> }
) {
  try {
    const { id, classId } = await params;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`[Proxy DELETE /api/companies/${id}/classes/${classId}] Forwarding to backend...`);
    const res = await fetch(`${apiBase}/api/classes/${classId}`, {
      method: 'DELETE',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy DELETE /api/companies/[id]/classes/[classId]:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
