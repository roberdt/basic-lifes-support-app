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
  { params }: { params: Promise<{ id: string; classId: string }> }
) {
  const { id, classId } = await params;
  const authHeader = request.headers.get('authorization');

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8080';
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const targetUrl = `${apiBase}/api/classes/${classId}/classslots`;
    const res = await fetch(targetUrl, { method: 'GET', headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; classId: string }> }
) {
  const { id, classId } = await params;
  const authHeader = request.headers.get('authorization');
  let body: any = null;

  try {
    try {
      body = await request.json();
    } catch (e) {
      body = null;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8080';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Proxy to standalone classslots endpoint
    const targetUrl = `${apiBase}/api/classes/${classId}/classslots`;
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = text;
    }

    appendToLog('STANDALONE_CLASS_SLOTS_POST_SUCCESS', {
      url: targetUrl,
      requestBody: body,
      responseStatus: res.status,
      responseBody: data
    });

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy POST /api/companies/[id]/classes/[classId]/classslots:', error);
    appendToLog('STANDALONE_CLASS_SLOTS_POST_ERROR', {
      url: `/api/classes/${classId}/classslots`,
      requestBody: body,
      errorMessage: error?.message
    });
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
