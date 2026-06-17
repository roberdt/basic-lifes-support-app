import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const authHeader = request.headers.get('authorization');

    if (authHeader && authHeader.includes('mock-super-user')) {
      console.warn('WARNING: Client is using a stale mock token. Instructing them to log out and log back in.');
      return NextResponse.json(
        { message: 'Stale local session detected. Please click the Logout button, refresh, and log in again to authenticate with the backend.' },
        { status: 401 }
      );
    }

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('[Proxy GET /api/companies] Incoming Authorization:', authHeader ? `${authHeader.substring(0, 25)}...` : 'NULL');
    const targetUrl = `${apiBase}/api/companies`;
    console.log('[Proxy GET /api/companies] Forwarding to backend:', targetUrl);

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    console.log('[Proxy GET /api/companies] Backend response status:', res.status, 'body:', typeof data === 'object' ? JSON.stringify(data).substring(0, 150) : String(data).substring(0, 150));

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy GET /api/companies:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
