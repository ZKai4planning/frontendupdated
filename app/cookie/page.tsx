import { LoginHeader } from "@/components/login-header"
import Footer from "@/components/landingpagefooter"

const lastUpdated = "March 9, 2026"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <LoginHeader />

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-16 space-y-10">
        <section className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Cookie Policy</h1>
          <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          <p className="text-white/75 leading-relaxed">
            This page explains how AI4Planning uses cookies and similar
            technologies to keep the platform secure, improve performance, and
            remember your preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">What cookies we use</h2>
          <ul className="list-disc pl-6 text-white/75 space-y-2">
            <li>
              Strictly necessary cookies for login, security, and basic
              platform operation.
            </li>
            <li>
              Analytics cookies to understand usage patterns and improve user
              flows.
            </li>
            <li>
              Marketing cookies to show relevant updates, campaigns, and
              personalized content.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How long cookies remain</h2>
          <p className="text-white/75 leading-relaxed">
            Some cookies only last for your browser session. Others remain for
            longer periods so your preferences can be remembered when you return
            to AI4Planning.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Managing cookie choices</h2>
          <p className="text-white/75 leading-relaxed">
            You can accept or reject optional cookies in our consent banner.
            You can also clear or block cookies directly in your browser
            settings at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-white/75 leading-relaxed">
            Questions about this policy can be sent to
            {" "}
            <a
              href="mailto:info@ai4planning.com"
              className="text-[#78A7FF] hover:text-white"
            >
              info@ai4planning.com
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
