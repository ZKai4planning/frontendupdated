"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Roadmap from "@/components/roadmap"

export default function Table({
  onView,
  setroadmap,
  showdetailsform
}: {
  onView: () => void;
  setroadmap: (value: boolean) => void;
  showdetailsform: (value: boolean) => void
}) {
  const router = useRouter();
  return (
    <div className="w-full rounded-2xl border bg-white p-6 shadow-sm">
      {/* <button
        onClick={() => router.push("/services")}
        className="rounded-lg border px-4 py-1.5 text-sm
      hover:bg-gray-600 bg-gray-500 text-white font-medium transition mb-4"
      >
        <Plus className="inline w-4 h-4 mr-1" />
        Add New Service
      </button> */}
      <div className="overflow-x-auto">
        <p className="text-xl text-black font-bold mt-2">
          My Services
        </p>
        <table className="w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-50">
              {[
                "#",
                "Date",
                "Service",
                "Sub-service",
                "Service Number",
                "Status",
                "Action",
              ].map(head => (
                <th
                  key={head}
                  className="border-b px-4 py-3 text-left font-semibold text-slate-600"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr className="hover:bg-slate-50">
              <td className="border-b px-4 py-3">1</td>
              <td className="border-b px-4 py-3">01-01-2022</td>
              <td className="border-b px-4 py-3">
                <span

                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                  onClick={() => {
                    setroadmap(true);
                    showdetailsform(false);
                  }}


                >
                  Homeowners, landlords 
                </span>
              </td>
              <td className="border-b px-4 py-3 text-blue-600">House Holder planning consent</td>
              <td className="border-b px-4 py-3">HSPC000-07</td>
              <td className="border-b px-4 py-3">
                <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-semibold text-black">
                  In-Progress
                </span>
              </td>
              <td className="border-b px-4 py-3">
                <button
                  onClick={onView}
                  className="rounded-lg border px-4 py-1.5 text-sm hover:bg-blue-600 bg-blue-500 text-white font-medium transition"
                >
                  Eligibility check
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
