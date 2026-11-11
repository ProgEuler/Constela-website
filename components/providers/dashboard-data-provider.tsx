"use client"

import type { ReactNode } from "react"
import { SWRConfig } from "swr"

import { api } from "@/lib/api"

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: api.get,
        dedupingInterval: 60_000,
        keepPreviousData: true,
        revalidateOnFocus: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
