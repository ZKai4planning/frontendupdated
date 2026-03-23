"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";

import { LoginHeader } from "@/components/login-header";
import Footer from "@/components/landingpagefooter";
import { PremiumTestimonials } from "@/components/premium-testimonials";
import { OurTeams } from "@/components/ourteams";
import WhatsAppButton from "@/components/whatsppp-button";
import { CookieConsent } from "@/components/cookie-consent";
import PricingCardsLanding from "@/components/pricingcards-landing";
import LandingServicesSection from "@/components/Services-section1";

/* ================= HERO TEXT ================= */
const heroText =
  "Your partner in planning, whether you’re an individual, homeowner, small business, or a planning consultant. We streamline the path from concept to completion.";

/* ================= COMPONENT ================= */
export default function Home() {
  return (
    <main className="w-full">
      <LoginHeader />

      {/* ================= HERO ================= */}
      <section className="relative w-full min-h-screen overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/blueprinttobuilding.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 text-center py-24 sm:py-28 md:py-32 sm:-mt-12">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ scale: 0.25, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 5.6 }}
              className="text-2xl sm:text-5xl lg:text-[200px] font-bold text-white mb-6 origin-center lg:-ml-32"
            >
              Ai4Planning
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 7.3 } },
              }}
              className="text-xl sm:text-2xl lg:text-3xl text-white/90 flex flex-wrap justify-center gap-x-1"
            >
              {heroText.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 8.6 }}
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-1 w-full sm:w-auto px-8 sm:px-10 py-4 font-semibold rounded-sm relative overflow-hidden"
              >
                <span className="relative z-10">Explore Our Services</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://calendly.com/pavank-karyahubsolutions/30min?month=2026-02", "_blank")}
                className="w-full sm:w-auto px-10 sm:px-20 py-4 border-2 border-white text-white bg-white/10 hover:bg-white/20 transition rounded-sm"
              >
                Let&apos;s Talk
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <LandingServicesSection />

      <section className="bg-[#050B18] text-white py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4">Our Plans</h2>
          <p className="text-white/60 text-xl">
            Choose the plan that’s right for you and get started today.
          </p>
        </div>
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
          <PricingCardsLanding />
        </Suspense>
        <div className="mt-8 flex items-center justify-center gap-3 text-center">
          <p className="text-sm text-white/70">Have a Question?</p>
          <button
            type="button"
            onClick={() =>
              window.open(
                "https://wa.me/447777788885?text=Hello%21%20I%20have%20a%20query.",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="text-sm font-semibold text-blue-300 underline underline-offset-4 hover:text-blue-200"
          >
            Connect with us
          </button>
        </div>
      </section>

      <OurTeams />
      <PremiumTestimonials />
      <WhatsAppButton />
      <CookieConsent />
      <Footer />
    </main>
  );
}
