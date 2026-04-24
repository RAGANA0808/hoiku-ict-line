import { NextResponse } from 'next/server';

export const runtime = 'edge';

export const GET = () =>
  NextResponse.json({
    status: 'ok',
    service: 'hoiku-ict',
    timestamp: new Date().toISOString(),
  });
