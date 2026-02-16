import { NextResponse } from 'next/server';

export async function GET() {
  const hasCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  return NextResponse.json({
    env_exists: hasCredentials,
    env_length: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
    message: hasCredentials ? '✅ Credentials found' : '❌ Credentials missing'
  });
}