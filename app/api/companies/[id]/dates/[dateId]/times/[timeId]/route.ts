import { NextResponse } from 'next/server';

import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const LOG_FILE_PATH = 'C:\\Users\\rober\\.gemini\\antigravity\\scratch\\proxy_slots_log.txt';

function appendToLog(action: string, details: any) {
  try {
    const dir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; dateId: string; timeId: string }> }
) {
  const { id, dateId, timeId } = await params;
  const authHeader = request.headers.get('authorization');

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const targetUrl = `${apiBase}/api/companies/${id}/dates/${dateId}/times/${timeId}`;
    console.log(`[Proxy GET /api/companies/${id}/dates/${dateId}/times/${timeId}] Forwarding to: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    console.log(`[Proxy GET /api/companies/${id}/dates/${dateId}/times/${timeId}] Backend returned status: ${res.status}`);
    if (res.status === 200) {
      console.log(`[Proxy GET] Backend response body:`, JSON.stringify(data).substring(0, 200) + '...');
    } else if (res.status === 404) {
      console.warn(`[Proxy GET] 404 NOT FOUND from backend at: ${targetUrl}`);
      console.warn(`[Proxy GET] Backend response body:`, data);
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy GET /api/companies/[id]/dates/[dateId]/times/[timeId]:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; dateId: string; timeId: string }> }
) {
  const { id, dateId, timeId } = await params;
  const authHeader = request.headers.get('authorization');

  try {
    const body = await request.json();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const targetUrl = `${apiBase}/api/companies/${id}/dates/${dateId}/times/${timeId}`;
    console.log(`[Proxy PUT /api/companies/${id}/dates/${dateId}/times/${timeId}] Forwarding to: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = text;
    }

    appendToLog('CLASS_UPDATE_PUT_SUCCESS', {
      url: targetUrl,
      requestBody: body,
      responseStatus: res.status,
      responseBody: data
    });

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy PUT /api/companies/[id]/dates/[dateId]/times/[timeId]:`, error);
    appendToLog('CLASS_UPDATE_PUT_ERROR', {
      url: `/api/companies/${id}/dates/${dateId}/times/${timeId}`,
      requestBody: null,
      errorMessage: error?.message
    });
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; dateId: string; timeId: string }> }
) {
  const { id, dateId, timeId } = await params;
  const authHeader = request.headers.get('authorization');

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const targetUrl = `${apiBase}/api/companies/${id}/dates/${dateId}/times/${timeId}`;
    console.log(`[Proxy DELETE /api/companies/${id}/dates/${dateId}/times/${timeId}] Forwarding to: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      method: 'DELETE',
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Error in proxy DELETE /api/companies/[id]/dates/[dateId]/times/[timeId]:`, error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
