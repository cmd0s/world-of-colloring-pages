import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function POST() {
  const id = randomUUID()

  // In production, you should store this reference in a database
  // to verify it later in /api/confirm-payment
  console.log("[Payment] Initiated payment with reference:", id)

  return NextResponse.json({ id })
}
