"use client";

import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import ServiceExpandPanel from "@/components/service-expand-panel";
import { ApiResponse, ApiServiceData, Service } from "@/types";

const DESKTOP_ACCORDION_BREAKPOINT = 1280;
const LAPTOP_BREAKPOINT = 1600;

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
      subServiceId: sub.subServiceId,
      status: sub.status,
    })),
    cta: "Select & Apply",
    label: apiService.serviceName || "Service Category",
    status: apiService.status,
  };
};

const getServicePreview = (description: string, maxLength = 110) => {
  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength).trimEnd()}...`;
};

export default function LandingServicesSection({
  applyAction = "login",
}: {
  applyAction?: "login" | "next-step";
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const expandedContainerRef = useRef<HTMLDivElement>(null);
  const servicesSectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktopAccordion, setIsDesktopAccordion] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse>("/services", {
          params: { includeDeleted: true },
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

    const handleChange = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsDesktopAccordion(width >= DESKTOP_ACCORDION_BREAKPOINT);
      setIsLaptop(
        width >= DESKTOP_ACCORDION_BREAKPOINT && width < LAPTOP_BREAKPOINT
      );
    };

    handleChange();
    window.addEventListener("resize", handleChange);
    return () => window.removeEventListener("resize", handleChange);
  }, []);

  useEffect(() => {
    if (!expandedServiceId) return;
    if (typeof window === "undefined") return;

    if (window.innerWidth >= DESKTOP_ACCORDION_BREAKPOINT) return;

    requestAnimationFrame(() => {
      servicesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [expandedServiceId]);

  const selectedService = expandedServiceId
    ? services.find((service) => service.id === expandedServiceId) ?? null
    : null;

  const renderServiceCard = (service: Service) => {
    const isActive = service.status !== false;

    return (
      <button
        key={service.id}
        type="button"
        disabled={!isActive}
        aria-pressed={expandedServiceId === service.id}
        onClick={() => {
          if (isActive) {
            setExpandedServiceId(service.id);
          }
        }}
        className={`group flex min-h-[18rem] flex-col rounded-3xl border p-5 text-left transition-all sm:min-h-[19rem] sm:p-6 ${
          isActive
            ? "cursor-pointer border-white/10 bg-white/5 backdrop-blur-xl hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/15"
            : "cursor-not-allowed border-white/10 bg-white/5 opacity-65 blur-[3px]"
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-400 sm:text-xs">
            {service.label}
          </p>
          {service.status === false ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
              Inactive
            </span>
          ) : null}
        </div>
        <h3 className="mb-4 text-lg font-bold leading-snug text-white xl:text-[1.05rem] 2xl:text-lg">
          {service.subtitle}
        </h3>
        <p className="text-sm leading-relaxed text-white/65 italic sm:text-[0.95rem]">
          &quot;{getServicePreview(service.description)}&quot;
        </p>
        <span
          className={`relative mt-auto inline-flex items-center gap-1 self-start pt-6 text-sm font-semibold ${
            isActive ? "text-blue-400" : "text-white/40"
          }`}
        >
          {isActive ? "Get Started" : "Currently Unavailable"}
          {isActive ? (
            <>
              <span className="transition-transform duration-300 group-hover:translate-x-2">
                -&gt;
              </span>
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-400 transition-all duration-300 group-hover:w-full" />
            </>
          ) : null}
        </span>
      </button>
    );
  };

  const renderServicesGrid = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-6">
      {services.map(renderServiceCard)}
    </div>
  );

  return (
    <section
      id="services"
      ref={servicesSectionRef}
      className="relative bg-[#050B18] pb-16 pt-20 text-white sm:pt-24 lg:pb-20 lg:pt-28"
    >
      {!expandedServiceId && (
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="mb-4 text-3xl font-bold sm:text-5xl xl:text-7xl 2xl:text-8xl">
            Our Services
          </h2>
        </div>
      )}

      <div className="mx-auto max-w-[110rem] px-4 sm:px-6 lg:px-8 xl:px-10">
        {loading ? (
          <div className="text-center text-white/60 py-10">Loading services...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-10">{error}</div>
        ) : expandedServiceId ? (
          isDesktopAccordion ? (
            <div
              ref={expandedContainerRef}
              className="flex flex-col gap-4 xl:min-h-[48rem] xl:flex-row xl:gap-3 2xl:min-h-[52rem]"
            >
              {services.map((service, index) => (
                <ServiceExpandPanel
                  key={`${service.id}-${expandedServiceId === service.id ? "open" : "closed"}`}
                  index={index}
                  service={service}
                  applyAction={applyAction}
                  isLaptop={isLaptop}
                  isExpanded={expandedServiceId === service.id}
                  onExpand={() => setExpandedServiceId(service.id)}
                  onClose={() => setExpandedServiceId(null)}
                />
              ))}
            </div>
          ) : selectedService ? (
            <div ref={expandedContainerRef} className="mx-auto max-w-6xl">
              <ServiceExpandPanel
                key={`${selectedService.id}-single-panel`}
                index={0}
                service={selectedService}
                mobile={isMobile}
                applyAction={applyAction}
                isExpanded
                onExpand={() => setExpandedServiceId(selectedService.id)}
                onClose={() => setExpandedServiceId(null)}
              />
            </div>
          ) : (
            renderServicesGrid()
          )
        ) : (
          renderServicesGrid()
        )}
      </div>
    </section>
  );
}
