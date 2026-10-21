import Image from "next/image"

import { LoginForm } from "../_components/login-form"
import { Separator } from "@/components/ui/separator"
import logo from "@/assets/svg/logo.svg"

export default function LoginV1() {
  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* Brand panel (desktop only) */}
      <aside className="hidden bg-muted/40 lg:flex lg:w-1/3 lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="flex max-w-xs flex-col items-center gap-6 text-center">
          <Image
            src={logo}
            alt="Constela"
            width={220}
            height={220}
            priority
            className="h-auto w-40 xl:w-48"
          />
          <p className="text-sm text-muted-foreground">
            Admin dashboard for the Constela dating platform.
          </p>
        </div>
      </aside>

      <Separator orientation="vertical" className="hidden lg:block" />

      <main className="flex min-w-0 flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-16 lg:py-24">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center lg:hidden">
            <Image
              src={logo}
              alt="Constela"
              width={180}
              height={180}
              priority
              className="h-auto w-24"
            />
          </div>

          <header className="space-y-2 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Admin portal
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Sign in to manage users, moderation, and subscriptions.
            </p>
          </header>

          <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Authorized staff only. Activity is logged.
          </p>
        </div>
      </main>
    </div>
  )
}
