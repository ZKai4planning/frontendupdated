import { LoginHeader } from "@/components/login-header"
import Footer from "@/components/landingpagefooter"

const lastUpdated = "March 9, 2026"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <LoginHeader />

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-16 space-y-10">
        <section className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          <p className="text-white/75 leading-relaxed">
            AI4Planning respects your privacy. This policy explains what data we
            collect, why we collect it, and how we protect it across our
            planning services and dashboards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Data we collect</h2>
          <ul className="list-disc pl-6 text-white/75 space-y-2">
            <li>Account details such as name, email, and contact data.</li>
            <li>
              Project information you provide for planning, quotes, and service
              delivery.
            </li>
            <li>
              Technical and usage data, including device and interaction events.
            </li>
            <li>Payment and subscription information handled securely.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How we use your data</h2>
          <ul className="list-disc pl-6 text-white/75 space-y-2">
            <li>To deliver requested services and support.</li>
            <li>To generate estimates, reports, and workflow updates.</li>
            <li>To improve platform performance and service quality.</li>
            <li>To communicate account, billing, and product updates.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Sharing and retention</h2>
          <p className="text-white/75 leading-relaxed">
            We only share data with trusted providers needed to operate
            AI4Planning, such as hosting, analytics, communication, and payment
            services. We retain personal data only for as long as needed for
            service delivery, legal obligations, and legitimate business
            purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Your choices</h2>
          <p className="text-white/75 leading-relaxed">
            You can request access, correction, or deletion of personal data by
            contacting us. You can also update cookie preferences through the
            cookie controls shown on the site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-white/75 leading-relaxed">
            Privacy requests can be sent to
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
