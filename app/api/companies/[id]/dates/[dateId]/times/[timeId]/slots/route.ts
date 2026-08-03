import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const LOG_FILE_PATH = 'C:\\Users\\rober\\.gemini\\antigravity\\brain\\21c00471-65ae-49ab-8343-80244827c5dd\\scratch\\proxy_slots_log.txt';

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; dateId: string; timeId: string }> }
) {
  const { id, dateId, timeId } = await params;
  const authHeader = request.headers.get('authorization');
  let body: any = null;

  try {
    body = await request.json();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const targetUrl = `${apiBase}/api/companies/${id}/dates/${dateId}/times/${timeId}/slots`;
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    appendToLog('SLOTS_POST_SUCCESS', {
      url: targetUrl,
      requestBody: body,
      responseStatus: res.status,
      responseBody: data
    });

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in proxy POST /api/companies/[id]/dates/[dateId]/times/[timeId]/slots:', error);
    appendToLog('SLOTS_POST_ERROR', {
      url: `/api/companies/${id}/dates/${dateId}/times/${timeId}/slots`,
      requestBody: body,
      errorMessage: error?.message
    });
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
