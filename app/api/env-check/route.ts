import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    allowWrites: process.env.ALLOW_PRODUCTION_WRITES === 'true',
    rawValue: process.env.ALLOW_PRODUCTION_WRITES,
    time: new Date().toISOString()
  });
} 