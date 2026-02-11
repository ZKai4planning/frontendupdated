"use client";

import Image from "next/image";
import { Card, CardContent } from "../../../components/ui/card";
import { label } from "framer-motion/client";


export default function ContactDetails() {
  const details = [
    { label: "Name :", value: "Zafer Khan" },
    { label: "Email:", value: "zaferkhan@gmail.com" },
    { label: "Phone:", value: "+1 234 567 890" },
    { label: "First line of Adress:", value: "221B Baker Street"},
    { label: "Second line of Adress:", value: "Marylebone"},
    { label: "Town:", value: "Westminster"},
    { label: "City:", value: "London"},
    { label: "Postcode:", value: "NW1 6XE"},
    { label: "Council:", value: "NY City Council" },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl rounded-2xl shadow-md">
        <CardContent className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 relative mb-3">
              <Image
                src="zafer.png"
                alt="Avatar"
                fill
                unoptimized
                className="rounded-full object-cover"
              />


            </div>

            <h1 className="text-xl font-semibold">Zafer Khan</h1>
            <p className="text-sm text-gray-500">@zaferkhan</p>
          </div>

          {/* Details */}
          <div className="border-t pt-4 space-y-4">
            {details.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="grid grid-cols-2 gap-4 w-full">
                  <span className="text-gray-600 font-medium">
                    {item.label}
                  </span>
                  <span className="text-gray-900">{item.value}</span>
                </div>

          
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
