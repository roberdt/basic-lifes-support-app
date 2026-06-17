import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    if (authHeader && authHeader.includes('mock-super-user')) {
      return NextResponse.json(
        { message: 'Stale local session detected. Please click the Logout button, refresh, and log in again.' },
        { status: 401 }
      );
    }

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const res = await fetch(`${apiBase}/api/classes`, {
      method: 'GET',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy GET /api/classes:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    if (authHeader && authHeader.includes('mock-super-user')) {
      return NextResponse.json(
        { message: 'Stale local session detected. Please click the Logout button, refresh, and log in again.' },
        { status: 401 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const res = await fetch(`${apiBase}/api/classes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy POST /api/classes:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
