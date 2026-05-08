import { LoginHeader } from "@/components/login-header"
import { BackButton } from "@/components/back-button"
import Footer from "@/components/landingpagefooter"

const lastUpdated = "April 30, 2026"

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <LoginHeader />

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-16 space-y-10">
        <section className="space-y-4">
          <BackButton label="Return" />
          <h1 className="text-4xl md:text-5xl font-bold">Refund Policy</h1>
          <p className="text-white/70 text-sm">Last updated: {lastUpdated}</p>
          <p className="text-white/75 leading-relaxed">
            We want payment terms to be completely transparent before work starts. Because planning and construction services involve the immediate allocation of professional resources, local authority fees, and consultant time, our refund policy operates on a milestone-based structure.
          </p>
        </section>

        <section className="rounded-3xl border border-[#78A7FF]/30 bg-[#0A1630] p-6 md:p-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#78A7FF]">
            Quick Summary
          </p>
          <p className="text-white/80 leading-relaxed">
            If work hasn&apos;t started, you can likely get a refund (minus processing fees). Once consultants are allocated, site visits occur, or applications are submitted to local authorities, those specific stages are non-refundable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Pre-Work Cancellations</h2>
          <ul className="list-disc pl-6 text-white/75 space-y-2">
            <li>
              If you believe you were charged incorrectly or made a duplicate payment, contact us promptly so we can investigate and correct it.
            </li>
            <li>
              If a cancellation request is made before meaningful work has begun (e.g., before a consultant is assigned or initial site research is started), we will approve a refund after deducting any non-recoverable payment-processing or administrative costs.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Milestone-Based Non-Refundable Stages</h2>
          <p className="text-white/75 leading-relaxed">
            Once a project moves into active execution, resources are committed that cannot be recovered by AI4Planning. The following stages are non-refundable once initiated:
          </p>
          <ul className="list-disc pl-6 text-white/75 space-y-2">
            <li>
              <strong className="text-white/90">Consultant Allocation & Site Surveys:</strong> Once a structural engineer, architect, or surveyor is assigned and has commenced work or visited the site, the fee for that stage is non-refundable.
            </li>
            <li>
              <strong className="text-white/90">Drafting & Design:</strong> Once architectural drawings, feasibility reports, or planning statements have been started, the amount paid for that stage is non-refundable.
            </li>
            <li>
              <strong className="text-white/90">Local Authority Submissions:</strong> Once a planning application, building notice, or prior approval has been submitted to the local council on your behalf, fees associated with that submission and AI4Planning&apos;s coordination are entirely non-refundable, regardless of the council&apos;s final decision.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Service Failure by AI4Planning</h2>
          <p className="text-white/75 leading-relaxed">
            If AI4Planning cannot provide a paid service for reasons within our control (e.g., failure to submit an application after payment for submission), we will offer an appropriate partial refund, full refund, or service credit, depending on the stage of the project.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Processing Refunds</h2>
          <p className="text-white/75 leading-relaxed">
            Approved refunds are returned through the original payment method where possible. Please allow up to 14 days for the funds to appear in your account after approval, depending on your payment provider&apos;s processing times.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Requesting a Refund</h2>
          <p className="text-white/75 leading-relaxed">
            To request a refund or cancellation, please contact us at{" "}
            <a
              href="mailto:info@ai4planning.com"
              className="text-[#78A7FF] hover:text-white"
            >
              info@ai4planning.com
            </a>
            . Please include your name, project reference, and payment details so we can review the request quickly. For full legal terms regarding platform usage, please review our{" "}
            <a href="/terms" className="text-[#78A7FF] hover:text-white underline underline-offset-2">
              Terms and Conditions
            </a>.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  )
}