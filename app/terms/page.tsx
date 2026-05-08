import { LoginHeader } from "@/components/login-header"
import { BackButton } from "@/components/back-button"
import Footer from "@/components/landingpagefooter"

const lastUpdated = "April 30, 2026"

const termsSections = [
  {
    title: "Service scope",
    body:
      "AI4Planning provides planning support, digital workflows, research, coordination, and consultant-led services for homeowners, businesses, and professionals within the planning and construction sector. The exact deliverables, timelines, and fees for any paid engagement are defined by the relevant quote, invoice, proposal, or agreed scope of work.",
  },
  {
    title: "Using the platform",
    bullets: [
      "Provide accurate, complete, and up-to-date information for your account and project, including correct property details and site boundaries.",
      "Keep your login details secure and do not allow unauthorized access to your dashboard.",
      "Do not upload unlawful, misleading, harmful, or infringing content, including architectural plans you do not have rights to use.",
      "Use the platform only for legitimate planning, construction coordination, and project-delivery purposes.",
    ],
  },
  {
    title: "Planning & construction specific terms",
    bullets: [
      "You confirm you have the legal right to pursue planning and construction works on the property specified.",
      "AI4Planning facilitates connections with consultants and manages workflows but does not directly guarantee local authority planning approvals or building control sign-offs.",
      "Information provided on the platform regarding planning feasibility, building regulations, and zoning is for guidance only and does not constitute legally binding structural or architectural advice.",
      "Delays caused by missing site information, third-party consultant availability, local authority backlogs, or external statutory dependencies may affect delivery timelines.",
    ],
  },
  {
    title: "Quotes, fees, and payment terms",
    bullets: [
      "Fees are confirmed in the applicable quote, invoice, or checkout flow before payment is made.",
      "Payments may be required before a service stage begins, including consultant allocation, site research, drafting, or submission support.",
      "If a payment is declined, reversed, or disputed, we may pause access to the related service and withhold project deliverables until the matter is resolved.",
      "Third-party payment providers may apply their own verification and processing requirements.",
    ],
  },
  {
    title: "Intellectual property",
    body:
      "AI4Planning retains ownership of the platform, branding, digital templates, and internal workflow systems. You retain ownership of the property information, site data, and files you provide, while granting us a limited, non-exclusive right to use them solely to deliver the requested services and coordinate assigned consultants.",
  },
  {
    title: "Limitations of liability",
    body:
      "Platform content, dashboards, and project outputs are provided for operational and informational use. Independent legal, structural engineering, financial, or regulatory advice must be sought where necessary. To the maximum extent permitted by law, AI4Planning is not liable for indirect or consequential losses, including but not limited to denied planning applications, construction delays, or reliance on third-party professional judgments made outside our direct control.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <LoginHeader />

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-16 space-y-10">
        <section className="space-y-4">
          <BackButton label="Return" />
          <h1 className="text-4xl md:text-5xl font-bold">Terms and Conditions</h1>
          <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          <p className="text-white/75 leading-relaxed">
            These terms govern your use of AI4Planning services, website pages,
            dashboards, and quotations. By accessing the platform or making a payment, you agree to these terms and our{" "}
            <a href="/refund" className="text-[#78A7FF] hover:text-white underline underline-offset-2">
              Refund Policy
            </a>.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#78A7FF]">
            Payment Gateway Ready Summary
          </p>
          <p className="text-white/80 leading-relaxed">
            All services are subject to the specific scope and pricing shown at checkout or in an agreed quote. Because planning and construction services involve immediate allocation of professional resources, refunds are evaluated based on the project milestone reached at the time of cancellation.
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

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact and policy queries</h2>
          <p className="text-white/75 leading-relaxed">
            Questions about these terms can be sent to{" "}
            <a
              href="mailto:info@ai4planning.com"
              className="text-[#78A7FF] hover:text-white"
            >
              info@ai4planning.com
            </a>
            . For payment and cancellation inquiries, please review our{" "}
            <a href="/refund" className="text-[#78A7FF] hover:text-white underline underline-offset-2">
              Refund Policy
            </a>.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  )
}