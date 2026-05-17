import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const url = process.env.DATABASE_URL
  const masked = url
    ? url.replace(/:([^@]+)@/, ':***@')
    : 'NOT SET'

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, url: masked })
  } catch (error) {
    return NextResponse.json(
      { ok: false, url: masked, error: String(error) },
      { status: 500 }
    )
  }
}
