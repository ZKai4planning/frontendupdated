import { LoginHeader } from "@/components/login-header"
import Footer from "@/components/landingpagefooter"

const lastUpdated = "April 30, 2026"

const termsSections = [
  {
    title: "Service scope",
    body:
      "AI4Planning provides planning support, digital workflows, research, coordination, and consultant-led services for homeowners, businesses, and professionals. The exact deliverables, timelines, and fees for any paid engagement are defined by the relevant quote, invoice, proposal, or agreed scope of work.",
  },
  {
    title: "Using the platform",
    bullets: [
      "Provide accurate, complete, and up-to-date information for your account and project.",
      "Keep your login details secure and do not allow unauthorized access to your dashboard.",
      "Do not upload unlawful, misleading, harmful, or infringing content.",
      "Use the platform only for legitimate enquiry, planning, and project-delivery purposes.",
    ],
  },
  {
    title: "Quotes, fees, and payment terms",
    bullets: [
      "Fees are confirmed in the applicable quote, invoice, or checkout flow before payment is made.",
      "Payments may be required before a service stage begins, including consultant allocation, research, drafting, or submission support.",
      "If a payment is declined, reversed, or disputed, we may pause access to the related service until the matter is resolved.",
      "Third-party payment providers may apply their own verification and processing requirements.",
    ],
  },
  {
    title: "Project delivery and client responsibilities",
    bullets: [
      "You are responsible for reviewing documents, approvals, and project information supplied through the website or dashboard.",
      "Delays caused by missing information, third-party consultants, authorities, or external dependencies may affect delivery timelines.",
      "Where approvals, planning outcomes, or third-party decisions are involved, AI4Planning cannot guarantee a specific result.",
    ],
  },
  {
    title: "Intellectual property",
    body:
      "AI4Planning retains ownership of the platform, branding, templates, and internal systems. You retain ownership of the information and files you provide, while granting us a limited right to use them to deliver the requested services.",
  },
  {
    title: "Limitations of liability",
    body:
      "Website content, dashboards, and project outputs are provided for operational and informational use. Independent legal, planning, engineering, financial, or regulatory advice may still be required. To the maximum extent permitted by law, AI4Planning is not liable for indirect or consequential losses arising from use of the website or reliance on third-party decisions.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <LoginHeader />

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-16 space-y-10">
        <section className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Terms and Conditions</h1>
          <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          <p className="text-white/75 leading-relaxed">
            These terms govern your use of AI4Planning services, website pages,
            dashboards, quotations, and payment flows. By accessing the
            platform or making a payment, you agree to these terms and the
            refund policy set out below.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#78A7FF]">
            Payment Gateway Ready Summary
          </p>
          <p className="text-white/80 leading-relaxed">
            All services are subject to the specific scope and pricing shown at
            checkout or in an agreed quote. Refund requests are reviewed against
            the service stage reached, time already allocated, and any
            non-recoverable third-party processing costs.
          </p>
        </section>

        {termsSections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            {"body" in section ? (
              <p className="text-white/75 leading-relaxed">{section.body}</p>
            ) : (
              <ul className="list-disc pl-6 text-white/75 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section
          id="refund-policy"
          className="rounded-3xl border border-[#78A7FF]/30 bg-[#0A1630] p-6 md:p-8 space-y-4 scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold">Refund Policy</h2>
          <p className="text-white/80 leading-relaxed">
            We want the payment terms to be clear before work starts. The refund
            position depends on whether AI4Planning has already started a paid
            service stage or committed time and resources to your project.
          </p>
          <ul className="list-disc pl-6 text-white/75 space-y-2">
            <li>
              If you believe you were charged incorrectly or made a duplicate
              payment, contact us promptly so we can investigate and correct it.
            </li>
            <li>
              If a cancellation request is made before meaningful work has begun,
              we may approve a refund after deducting any non-recoverable
              payment-processing or administrative costs.
            </li>
            <li>
              Once a bespoke service stage has started, consultant time has been
              allocated, or project work has been prepared or delivered, the
              amount paid for that stage is normally non-refundable.
            </li>
            <li>
              If AI4Planning cannot provide the paid service for reasons within
              our control, we may offer an appropriate partial refund, full
              refund, or service credit.
            </li>
            <li>
              Approved refunds are returned through the original payment method
              where possible.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact and policy queries</h2>
          <p className="text-white/75 leading-relaxed">
            Questions about these terms, payments, or refund requests can be
            sent to{" "}
            <a
              href="mailto:info@ai4planning.com"
              className="text-[#78A7FF] hover:text-white"
            >
              info@ai4planning.com
            </a>
            . Please include your name, project reference, and payment details
            so we can review the request quickly.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  )
}
