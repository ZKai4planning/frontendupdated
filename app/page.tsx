"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import axiosInstance from "@/lib/axiosinstance"; // Import the instance
import { Service, ApiServiceData, ApiResponse } from "@/types"; // Import types

import ServiceExpandPanel from "@/components/service-expand-panel";
import { LoginHeader } from "@/components/login-header";
import Footer from "@/components/landingpagefooter";
import { PremiumTestimonials } from "@/components/premium-testimonials";
import { OurTeams } from "@/components/ourteams";
import WhatsAppButton from "@/components/whatsppp-button";
import { CookieConsent } from "@/components/cookie-consent";
import PricingCardsLanding from "@/components/pricingcards-landing";

/* ================= HERO TEXT ================= */
const heroText =
  "Your partner in planning, whether you’re an individual, homeowner, small business, or a planning consultant. We streamline the path from concept to completion.";

/* ================= MAPPER FUNCTION ================= */
const mapApiServiceToService = (apiService: ApiServiceData): Service => {
  return {
    id: apiService.serviceId,
    title: apiService.title,
    shortTitle: apiService.title, // Using title as shortTitle fallback
    subtitle: apiService.title,
    image: apiService.images?.[0] || "/Service-01.png", // Fallback image
    description: apiService.description,
    features: apiService.subServices.map((sub) => ({
      title: sub.title,
      header: sub.title,
      description: sub.description,
    })),
    cta: "Select & Apply",
    label: apiService.serviceName || "Service Category",
    status: apiService.status,
  };
};

/* ================= COMPONENT ================= */
export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const expandedContainerRef = useRef<HTMLDivElement>(null);
  const servicesSectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);

  // Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Using axiosInstance with query params
        const response = await axiosInstance.get<ApiResponse>('/services', {
         
        });

        if (response.data.success && response.data.data) {
          const mappedServices = response.data.data.map(mapApiServiceToService);
          setServices(mappedServices);
        } else {
          setError("Failed to fetch services data.");
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("An error occurred while fetching services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  /* close expanded panel on outside click */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        expandedContainerRef.current &&
        !expandedContainerRef.current.contains(event.target as Node)
      ) {
        setExpandedServiceId(null);
      }
    }

    if (expandedServiceId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [expandedServiceId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const laptopQuery = window.matchMedia("(min-width: 1024px) and (max-width: 1600px)");
    const handleChange = () => {
      setIsMobile(mobileQuery.matches);
      setIsLaptop(laptopQuery.matches);
    };

    handleChange();
    window.addEventListener("resize", handleChange);

    if (mobileQuery.addEventListener && laptopQuery.addEventListener) {
      mobileQuery.addEventListener("change", handleChange);
      laptopQuery.addEventListener("change", handleChange);
      return () => {
        window.removeEventListener("resize", handleChange);
        mobileQuery.removeEventListener("change", handleChange);
        laptopQuery.removeEventListener("change", handleChange);
      };
    }

    mobileQuery.addListener(handleChange);
    laptopQuery.addListener(handleChange);
    return () => {
      window.removeEventListener("resize", handleChange);
      mobileQuery.removeListener(handleChange);
      laptopQuery.removeListener(handleChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setExpandedServiceId(null);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!expandedServiceId) return;
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    if (!mediaQuery.matches) return;

    requestAnimationFrame(() => {
      servicesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [expandedServiceId]);

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
      <section
        id="services"
        ref={servicesSectionRef}
        className="bg-[#050B18] text-white pt-24 sm:pt-28 md:pt-36 pb-16 lg:pb-0 lg:h-225 relative"
      >
        {!expandedServiceId && (
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl lg:text-8xl font-bold mb-4">
              Our Services
            </h2>
          </div>
        )}

        <div className="max-w-435 mx-auto px-5 sm:px-6 md:px-10">
          {loading ? (
            <div className="text-center text-white/60 py-10">Loading services...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-10">{error}</div>
          ) : isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl transition-all flex flex-col"
                >
                  <div>
                    <p className={`${isLaptop ? "text-[11px]" : "text-xs"} font-bold text-blue-400 mb-2`}>{service.label}</p>
                    <h3 className={`${isLaptop ? "text-base" : "text-lg"} font-bold mb-3 leading-snug`}>{service.subtitle}</h3>
                    <p className={`${isLaptop ? "text-xs" : "text-sm"} text-white/60 leading-relaxed italic`}>
                      &quot;{service.description.substring(0, 80)}...&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : expandedServiceId ? (
            <div
              ref={expandedContainerRef}
              className={`flex gap-2 flex-col lg:flex-row ${isLaptop ? "h-140" : "h-162.5"}`}
            >
              {services.map((service, index) => (
                <ServiceExpandPanel
                  key={service.id}
                  index={index}
                  service={service}
                  isLaptop={isLaptop}
                  isExpanded={expandedServiceId === service.id}
                  onExpand={() => setExpandedServiceId(service.id)}
                  onClose={() => setExpandedServiceId(null)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setExpandedServiceId(service.id)}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl cursor-pointer transition-all hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/20 flex flex-col"
                >
                  <div>
                    <p className={`${isLaptop ? "text-[11px]" : "text-xs"} font-bold text-blue-400 mb-2`}>{service.label}</p>
                    <h3 className={`${isLaptop ? "text-[13px]" : "text-lg"} font-bold mb-3 leading-snug`}>{service.subtitle}</h3>
                    <p className={`${isLaptop ? "text-xs" : "text-sm"} text-white/60 leading-relaxed italic`}>
                      &quot;{service.description.substring(0, 80)}...&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

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
