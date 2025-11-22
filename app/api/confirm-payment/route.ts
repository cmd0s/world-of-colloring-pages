import { NextRequest, NextResponse } from "next/server"
import type { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js"

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as MiniAppPaymentSuccessPayload

    console.log("[Payment] Confirming payment:", {
      reference: payload.reference,
      transaction_id: payload.transaction_id,
      status: payload.status,
    })

    // In production, you should:
    // 1. Verify the reference matches one you created in /api/initiate-payment
    // 2. Call the Developer Portal API to verify the transaction:
    //    GET https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${APP_ID}
    //    Headers: Authorization: Bearer ${DEV_PORTAL_API_KEY}

    // For now, we optimistically accept the payment if status is success
    if (payload.status === "success") {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false })
  } catch (error) {
    console.error("[Payment] Error confirming payment:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
