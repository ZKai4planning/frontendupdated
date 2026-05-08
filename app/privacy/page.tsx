import { LoginHeader } from "@/components/login-header"
import { BackButton } from "@/components/back-button"
import Footer from "@/components/landingpagefooter"

const lastUpdated = "May 08, 2026"

const privacySections = [
  {
    title: "Data we collect",
    bullets: [
      "Identity and contact data (name, email, phone number, address).",
      "Property and project data, including site addresses, boundary plans, and existing structural details you provide for planning and construction services.",
      "Uploaded files such as architectural drawings, survey reports, and ownership documents.",
      "Technical and usage data, including device information, IP address, and interaction events within the platform.",
      "Payment and billing information processed securely through our third-party payment providers.",
    ],
  },
  {
    title: "How we use your data",
    bullets: [
      "To deliver planning support, coordinate consultants, and manage your construction workflows.",
      "To generate project estimates, feasibility reports, and regulatory submission documents.",
      "To facilitate communication between you, AI4Planning, and assigned third-party professionals (e.g., architects, structural engineers).",
      "To improve platform performance, ensure site security, and provide customer support.",
    ],
  },
  {
    title: "Sharing and retention",
    body: "We share your project data strictly on a need-to-know basis with trusted providers required to operate AI4Planning. This includes hosting services, assigned planning consultants, local authority submission portals (where applicable), and payment processors. We retain personal and project data only for as long as needed for service delivery, regulatory compliance, and legitimate business purposes, including statutory retention periods required for construction and planning records.",
  },
  {
    title: "Cookie Policy",
    bullets: [
      "Strictly necessary cookies: Required for platform login, security, and core dashboard functionality. These cannot be disabled.",
      "Analytics cookies: Help us understand how users interact with the platform so we can improve project workflows and tool performance.",
      "Functionality cookies: Remember your preferences (e.g., measurement units, dashboard layouts) for a seamless experience.",
    ],
    body: "Some cookies last only for your browser session, while others remain for set periods to remember your preferences upon return. You can accept or reject optional cookies via our consent banner, or clear/block cookies directly in your browser settings at any time.",
  },
  {
    title: "Your rights",
    body: "You have the right to request access, correction, or deletion of your personal data. You may also update your cookie preferences through the controls provided on the site. Please note that deleting certain project data may impact our ability to deliver ongoing planning or construction services.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <LoginHeader />

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-16 space-y-10">
        <section className="space-y-4">
          <BackButton label="Return" />
          <h1 className="text-4xl md:text-5xl font-bold">Privacy & Cookie Policy</h1>
          <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          <p className="text-white/75 leading-relaxed">
            AI4Planning respects your privacy. This policy explains what data we
            collect, why we collect it, how we use cookies, and how we protect
            your information across our planning and construction services.
          </p>
        </section>

        {privacySections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-2xl font-semibold">{section.title}</h2>

            {"body" in section && (
              <p className="text-white/75 leading-relaxed">
                {section.body}
              </p>
            )}

            {section.bullets && (
              <ul className="list-disc pl-6 text-white/75 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-white/75 leading-relaxed">
            Privacy requests or questions about this policy can be sent to{" "}
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