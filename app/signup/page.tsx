import { LoginHeader } from "@/components/login-header"
import { BlueprintBackground } from "@/components/blueprint-background"
import { SignupLeftSection } from "@/components/signup-left-section"
import { SignupForm } from "@/components/signup-form"
import { LoginFooter } from "@/components/login-footer"
// import { FloatingToolbar } from "@/components/floating-toolbar"

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col blueprint-grid selection:bg-primary selection:text-white">
      {/* Navigation Header */}
      <LoginHeader />

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center p-6">
        {/* Blueprint Background Elements */}
        <BlueprintBackground />

        {/* Signup Container */}
        <div className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Left Section */}
          <SignupLeftSection />

          {/* Right Section - Signup Form */}
          <SignupForm />
        </div>

        {/* Floating Toolbar */}
        {/* <FloatingToolbar /> */}
      </main>

      {/* Footer */}
      <LoginFooter />
    </div>
  )
}
