import { LoginHeader } from "@/components/login-header"
import { BlueprintBackground } from "@/components/blueprint-background"
import { LoginFooter } from "@/components/login-footer"
import { FloatingToolbarPassword } from "@/components/floating-toolbar"
import { VerifyEmailForm } from "@/components/verify-email-form"


export const metadata = {
  title: "Verify Email - Blueprint AI",
  description: "Verify your email to complete the connection",
}

export default function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-screen flex-col blueprint-grid selection:bg-primary selection:text-white">
      <LoginHeader />

      <main className="relative flex flex-1 items-center justify-center p-6">
        <BlueprintBackground />
        <VerifyEmailForm />
        <FloatingToolbarPassword />
      </main>

      <LoginFooter />
    </div>
  )
}
