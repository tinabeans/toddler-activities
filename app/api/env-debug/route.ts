import { NextResponse } from 'next/server';

export async function GET() {
  const allowValue = process.env.ALLOW_PRODUCTION_WRITES;
  
  return NextResponse.json({
    message: "Environment check endpoint",
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    // Check various possible true values
    allowWritesCheck: {
      equalToTrue: allowValue === 'true',
      equalToTRUE: allowValue === 'TRUE',
      equalTo1: allowValue === '1',
      equalToYes: allowValue === 'yes', 
      allowValueExists: allowValue !== undefined && allowValue !== null && allowValue !== '',
      rawValue: allowValue
    },
    time: new Date().toISOString()
  });
} 