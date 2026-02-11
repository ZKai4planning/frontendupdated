import { LoginHeader } from "@/components/login-header"
import { BlueprintBackground } from "@/components/blueprint-background"
import { LoginFooter } from "@/components/login-footer"
import { FloatingToolbarPassword } from "@/components/floating-toolbar"
import { ForgotPasswordForm } from "@/components/forgot-password-form"


export const metadata = {
  title: "Forgot Password - Blueprint AI",
  description: "Recover your account access",
}

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col blueprint-grid selection:bg-primary selection:text-white">
      <LoginHeader />

      <main className="relative flex flex-1 items-center justify-center p-6">
        <BlueprintBackground />
        <ForgotPasswordForm />
        <FloatingToolbarPassword />
      </main>

      <LoginFooter />
    </div>
  )
}
