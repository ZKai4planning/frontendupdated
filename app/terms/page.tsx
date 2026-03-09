import { LoginHeader } from "@/components/login-header"
import Footer from "@/components/landingpagefooter"

const lastUpdated = "March 9, 2026"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <LoginHeader />

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-16 space-y-10">
        <section className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Terms of Use</h1>
          <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          <p className="text-white/75 leading-relaxed">
            These terms govern your use of AI4Planning services, website pages,
            and dashboards. By using the platform, you agree to these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Service scope</h2>
          <p className="text-white/75 leading-relaxed">
            AI4Planning provides planning support, digital workflows, and
            project guidance for homeowners, businesses, and consultants.
            Specific deliverables may vary by service type and subscription.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Account responsibilities</h2>
          <ul className="list-disc pl-6 text-white/75 space-y-2">
            <li>Provide accurate and complete information.</li>
            <li>Keep your login credentials confidential.</li>
            <li>
              Do not misuse the platform, interfere with systems, or upload
              harmful content.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Payments and refunds</h2>
          <p className="text-white/75 leading-relaxed">
            Paid services, quotes, and subscriptions are billed based on the
            selected plan or agreed scope. Refund handling depends on service
            stage and contractual commitments.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Intellectual property</h2>
          <p className="text-white/75 leading-relaxed">
            AI4Planning retains ownership of the platform, design, and system
            content. You retain ownership of data and materials you submit,
            while granting us limited rights to process them for service
            delivery.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Limitations</h2>
          <p className="text-white/75 leading-relaxed">
            Platform outputs are informational and operational in nature.
            Independent professional review may still be required for legal,
            planning, engineering, tax, or regulatory decisions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-white/75 leading-relaxed">
            Questions about these terms can be sent to
            {" "}
            <a
              href="mailto:zafer.khan@ai4planning.com"
              className="text-[#78A7FF] hover:text-white"
            >
              zafer.khan@ai4planning.com
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
