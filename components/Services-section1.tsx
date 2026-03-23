"use client";

import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import ServiceExpandPanel from "@/components/service-expand-panel";
import { ApiResponse, ApiServiceData, Service } from "@/types";

const mapApiServiceToService = (apiService: ApiServiceData): Service => {
  return {
    id: apiService.serviceId,
    title: apiService.title,
    shortTitle: apiService.title,
    subtitle: apiService.title,
    image: apiService.image,
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

export default function LandingServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const expandedContainerRef = useRef<HTMLDivElement>(null);
  const servicesSectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse>("/services");

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
                <span className="mt-auto pt-6 text-sm text-blue-400 font-semibold inline-flex items-center gap-1 relative self-start">
                  Get Started
                  <span className="transition-transform duration-300 group-hover:translate-x-2">-&gt;</span>
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-400 transition-all duration-300 group-hover:w-full" />
                </span>
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
                <span className="mt-auto pt-6 text-sm text-blue-400 font-semibold inline-flex items-center gap-1 relative self-start">
                  Get Started
                  <span className="transition-transform duration-300 group-hover:translate-x-2">-&gt;</span>
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-400 transition-all duration-300 group-hover:w-full" />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
