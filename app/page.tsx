"use client";

import { LoginHeader } from "@/components/login-header";
import HomeHero from "@/components/home-hero";
import LandingServicesSection from "@/components/Services-section1";
import PricingCardsLanding from "@/components/pricingcards-landing";
import { OurTeams } from "@/components/ourteams";
import { PremiumTestimonials } from "@/components/premium-testimonials";
import WhatsAppButton from "@/components/whatsppp-button";
import { CookieConsent } from "@/components/cookie-consent";
import Footer from "@/components/landingpagefooter";


export default function Home() {
  return (
    <>

      <LoginHeader />
      <HomeHero />
      <LandingServicesSection />
      <PricingCardsLanding />
      <OurTeams />
      <PremiumTestimonials />
      <WhatsAppButton />
      <CookieConsent />
      <Footer />

    </>
  );
}
