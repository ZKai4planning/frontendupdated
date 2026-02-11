import { BlueprintBackground } from "@/components/blueprint-background";
import { BlueprintLeftSection } from "@/components/blueprint-left-section";
import { FloatingToolbar } from "@/components/floating-toolbar";
import { LoginFooter } from "@/components/login-footer";
import { LoginForm } from "@/components/login-form";
import { LoginHeader } from "@/components/login-header";


export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col blueprint-grid selection:bg-primary selection:text-white">
      {/* Navigation Header */}
      <LoginHeader />

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center p-6">
        {/* Blueprint Background Elements */}
        <BlueprintBackground />

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Left Section */}
           {/* <div className="hidden lg:block lg:col-span-5">
            <BlueprintLeftSection />
          </div> */}
          <BlueprintLeftSection />

          {/* Right Section - Login Form */}
          <LoginForm />
        </div>

        {/* Floating Toolbar */}
        <FloatingToolbar />
      </main>

      {/* Footer */}
      <LoginFooter />
    </div>
  )
}
