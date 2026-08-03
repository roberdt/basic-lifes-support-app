import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const LOG_FILE_PATH = 'C:\\Users\\rober\\.gemini\\antigravity\\brain\\7173b3e1-ec8b-43db-b6f9-decac3c271d8\\scratch\\proxy_dates_log.txt';

function appendToLog(action: string, details: any) {
  try {
    const dir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const logEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      ...details
    }, null, 2) + '\n\n';
    fs.appendFileSync(LOG_FILE_PATH, logEntry, 'utf8');
  } catch (err) {
    console.error('Failed to write to proxy log file:', err);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any = null;
  const authHeader = request.headers.get('authorization');

  try {
    body = await request.json();

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('[Proxy POST /api/companies/[id]/dates] Forwarding POST to backend:', `${apiBase}/api/companies/${id}/dates`);

    const res = await fetch(`${apiBase}/api/companies/${id}/dates`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    appendToLog('POST_SUCCESS', {
      companyId: id,
      targetUrl: `${apiBase}/api/companies/${id}/dates`,
      requestHeaders: {
        authorization: authHeader ? `${authHeader.substring(0, 15)}... (len: ${authHeader.length})` : 'MISSING',
      },
      requestBody: body,
      responseStatus: res.status,
      responseContentType: contentType,
      responseBody: data,
    });

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy POST /api/companies/[id]/dates:', error);
    appendToLog('POST_ERROR', {
      companyId: id,
      requestHeaders: {
        authorization: authHeader ? `${authHeader.substring(0, 15)}... (len: ${authHeader.length})` : 'MISSING',
      },
      requestBody: body,
      errorMessage: error?.message,
      errorStack: error?.stack,
    });
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('authorization');

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('[Proxy GET /api/companies/[id]/dates] Forwarding GET to backend:', `${apiBase}/api/companies/${id}/dates`);

    const res = await fetch(`${apiBase}/api/companies/${id}/dates`, {
      method: 'GET',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    appendToLog('GET_SUCCESS', {
      companyId: id,
      targetUrl: `${apiBase}/api/companies/${id}/dates`,
      requestHeaders: {
        authorization: authHeader ? `${authHeader.substring(0, 15)}... (len: ${authHeader.length})` : 'MISSING',
      },
      responseStatus: res.status,
      responseContentType: contentType,
      responseBody: data,
    });

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy GET /api/companies/[id]/dates:', error);
    appendToLog('GET_ERROR', {
      companyId: id,
      requestHeaders: {
        authorization: authHeader ? `${authHeader.substring(0, 15)}... (len: ${authHeader.length})` : 'MISSING',
      },
      errorMessage: error?.message,
      errorStack: error?.stack,
    });
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
