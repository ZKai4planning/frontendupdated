"use client"

import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-8xl mx-auto px-16 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/footerlogo.png"
                alt="AI4Planning Logo"
                width={90}
                height={36}
                className="rounded-sm h-auto"
                priority
              />
              <h3 className="text-xl font-semibold tracking-tight">
                AI4Planning
              </h3>
            </div>

            <p className="text-sm text-white/60 leading-relaxed">
              Planning-first consultancy combining AI, human expertise, and
              execution across property, construction, business, and personal
              projects.
            </p>
          </div>

          {/* Services */}
          <div id="services">
            <h4 className="font-medium mb-4">Services</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link id="services" href="#services" className="hover:text-white">
                  Home Owner Planning
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white">
                  Construction & Build
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white">
                  Business & AI Planning
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white">
                  Personal Concierge
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white">
                  Planning Professionals
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white">
                  Tailored Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white">
                  How It Works
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <a href="mailto:info@ai4planning.com" className="hover:text-white transition-colors duration-150">
                  info@ai4planning.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <a href="tel:+447777788885" className="hover:text-white transition-colors duration-150">
                  +44 7777788885
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <span>
                  United Kingdom
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-white/10" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/60">
          <p>
            &copy; {new Date().getFullYear()} AI4Planning. All rights reserved.
          </p>
          <p>
            Company Number <span className="font-semibold text-white/80">17123034</span>
          </p>

          <div className="flex items-center gap-6">
            <Link href="/cookie" className="hover:text-white">
              Cookies Policy
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/refund" className="hover:text-white">
              Refund Policy
            </Link>
            <Link href="/contact" className="hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
