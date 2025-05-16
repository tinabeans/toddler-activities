import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is a write request to our API
  if (request.nextUrl.pathname.startsWith('/api/activities') && 
      (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')) {
    
    // Check if we are in production mode and if writes are allowed
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
    
    // Be more flexible with the environment variable format
    const allowValue = process.env.ALLOW_PRODUCTION_WRITES;
    const allowProductionWrites = 
      allowValue === 'true' || 
      allowValue === 'TRUE' || 
      allowValue === '1' || 
      allowValue === 'yes' ||
      allowValue === 'YES';
    
    // Debug logging
    console.log('Middleware environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      ALLOW_PRODUCTION_WRITES: process.env.ALLOW_PRODUCTION_WRITES,
      isProduction,
      allowProductionWrites,
      method: request.method,
      pathname: request.nextUrl.pathname
    });
    
    // If in production and writes are not allowed, return an error
    if (isProduction && !allowProductionWrites) {
      return NextResponse.json(
        { 
          error: "Writing activities is only allowed in development mode",
          hint: "Set ALLOW_PRODUCTION_WRITES=true in your environment variables to enable writes in production.",
          debug: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV,
            ALLOW_PRODUCTION_WRITES: process.env.ALLOW_PRODUCTION_WRITES,
            allowProductionWrites
          }
        },
        { status: 403 }
      );
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

// Specify the paths this middleware should run on
export const config = {
  matcher: ['/api/activities/:path*'],
}; 