import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, message: "Backup is managed via backend services." });
}

export async function POST(req: Request) {
  return NextResponse.json({ success: true, message: "Restore is managed via backend services." });
}
