"use client"

import { useEffect, type ReactNode } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    MiniKit.install()
  }, [])

  return <>{children}</>
}
