// "use client"

// import { useState } from "react"
// import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
// import { ArrowLeft, ArrowRight, X } from "lucide-react"
// import { team } from "@/lib/team"

// export default function MeetOurTeam() {
//   const [index, setIndex] = useState(0)
//   const [active, setActive] = useState<number | null>(null)

//   const next = () => setIndex((prev) => (prev + 1) % team.length)
//   const prev = () => setIndex((prev) => (prev - 1 + team.length) % team.length)

//   return (
//     <LayoutGroup>
//     <section className="relative min-h-screen bg-[#f5efe6] overflow-hidden">

//       {/* ================= EXPANDED PAGE VIEW ================= */}
//       <AnimatePresence>
//           {active !== null && (
//             <motion.div
//               className="fixed inset-0 z-50 bg-[#f5efe6]"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <div className="max-w-7xl mx-auto min-h-screen px-6 py-12 grid grid-rows-[auto_1fr] gap-8">

//                 {/* ========== TOP CONVERGING TEXT STRIP ========== */}
//                <motion.div
//   initial={{ opacity: 0, y: 24 }}
//   animate={{ opacity: 1, y: 0 }}
//   transition={{ duration: 0.45, ease: "easeOut" }}
//   className="text-center"
// >
//   {/* TAGS */}
//   <div className="flex justify-center gap-3 mb-6 flex-wrap">
//     {team[active].tags.map((tag) => (
//       <span
//         key={tag}
//         className="text-xs border rounded-full px-3 py-1 text-neutral-700"
//       >
//         {tag}
//       </span>
//     ))}
//   </div>

//   {/* NAME */}
//   <h1 className="text-4xl lg:text-7xl font-bold mb-6">
//     {team[active].name}
//   </h1>
// </motion.div>



//                 {/* ========== IMAGE + CONTENT (SAME HEIGHT) ========== */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2  h-full">

//                   {/* LEFT IMAGE */}
//                   <div className="h-full flex">
//                     <motion.img
//                       layoutId={`team-image-${active}`}
//                       src={team[active].image}
//                       alt={team[active].name}
//                       transition={{
//                         type: "spring",
//                         stiffness: 80,
//                         damping: 18,
//                       }}
//                       className="
//                         w-full
//                         h-full
//                         object-cover
//                         rounded-sm
//                       "
//                     />
//                   </div>

//                   {/* RIGHT CONTENT */}
//                   <motion.div
//                     initial={{
//                       opacity: 0,
//                       y: 40,
//                       clipPath: "inset(100% 0% 0% 0%)",
//                     }}
//                     animate={{
//                       opacity: 1,
//                       y: 0,
//                       clipPath: "inset(0% 0% 0% 0%)",
//                     }}
//                     transition={{
//                       delay: 0.4,
//                       duration: 0.6,
//                       ease: "easeOut",
//                     }}
//                     className="
//                       h-full
//                       bg-white
//                       shadow-xl
//                       rounded-sm
//                       px-10
//                       py-12
//                       flex
//                       flex-col
//                       justify-center
//                       relative
//                     "
//                   >
//                     <button
//                       onClick={() => setActive(null)}
//                       className="absolute top-6 right-6 p-2"
//                     >
//                       <X />
//                     </button>

//                     <p className="text-neutral-600 max-w-md mb-10 font-bold">
//                       {team[active].description}
//                     </p>

//                     <div className="flex gap-16">
//                       <div>
//                         <p className="text-3xl font-serif">
//                           {team[active].years}
//                         </p>
//                         <p className="text-xs text-neutral-500">
//                           Years in practice
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-3xl font-serif">
//                           {team[active].rating}
//                         </p>
//                         <p className="text-xs text-neutral-500">
//                           Average rating
//                         </p>
//                       </div>
//                     </div>
//                   </motion.div>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//       {/* ================= SLIDER VIEW ================= */}
//       {active === null && (
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="max-w-[1900px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 px-5">

//             {/* LEFT TEXT */}
//             <div>
//               <h1 className="text-6xl lg:text-9xl font-bold mb-10">
//                 MEET <br />
//                 <span className="text-neutral-400 italic">OUR</span> <br />
//                 TEAM
//               </h1>

//               <p className="absolute bottom-10  text-md max-w-lg text-neutral-600">
//                 When you need fast and effective medical services,
//                 you can trust our team at ARX Care Clinic.
//               </p>
//             </div>

//             {/* RIGHT SLIDER */}
//             <div className="relative h-[520px] flex flex-col items-center justify-center">
//   {/* ================= IMAGE STACK ================= */}
//   <div className="relative h-[420px] w-full flex items-center justify-center">
//     <AnimatePresence>
//   {team.map((member, i) => {
//     const position = (i - index + team.length) % team.length
//     if (position > 5) return null

//     return (
//       <motion.div
//         key={member.name}
//         animate={{
//           opacity: 1 - position * 0.25,
//           scale: 1 - position * 0.05,
//           x: position * 90,
//         }}
//         transition={{ duration: 0.5, ease: "easeOut" }}
//         className="
//           absolute
//           w-[260px]
//           sm:w-[300px]
//           md:w-[520px]
//           bg-white
//           shadow-xl
//           rounded-md
//           overflow-hidden
//           cursor-pointer
//         "
//         style={{ zIndex: 10 - position }}
//         onClick={() => setActive(i)}
//       >
//         {/* IMAGE */}
//         <img
//           src={member.image}
//           alt={member.name}
//           className="w-full aspect-[3/4] object-cover"
//         />

//         {/* NAME BELOW IMAGE */}
//         <div className="p-4 text-center">
//           <p
//             className={`text-sm font-medium transition-opacity duration-300 ${
//               position === 0 ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             {member.name}
//           </p>

//         </div>
//       </motion.div>
//     )
//   })}
// </AnimatePresence>


//   </div>

//   {/* ================= NAME ================= */}
//   <div className="text-center">
//     <h3 className="text-xl font-medium">
//       {team[index].name}
//     </h3>
//   </div>

//   {/* ================= TAGS ================= */}
//   <div className="mt-3 flex justify-center gap-2 flex-wrap max-w-md">
//     {team[index].tags.map((tag) => (
//       <span
//         key={tag}
//         className="text-xs border rounded-full px-3 py-1"
//       >
//         {tag}
//       </span>
//     ))}
//   </div>

//   {/* ================= ARROWS ================= */}
//   <div className="absolute -bottom-42 flex gap-14">
//     <button
//       onClick={prev}
//       className="h-10 w-10 rounded-full border flex items-center justify-center"
//     >
//       <ArrowLeft size={96} />
//     </button>
//     <button
//       onClick={next}
//       className="h-10 w-10 rounded-full border flex items-center justify-center"
//     >
//       <ArrowRight size={96} />
//     </button>
//   </div>

//   {/* ================= PAGINATION ================= */}
//   <div className="fixed bottom-10 right-6 text-2xl text-neutral-500 z-50">
//   {index + 1} / {team.length}
// </div>

// </div>

//           </div>
//         </div>
//       )}
//     </section>
//     </LayoutGroup>
//   )
// }

"use client"

import Image from "next/image"

/* ================= TYPES ================= */

interface TeamMember {
  id: string
  first: string
  last: string
  role: string
  email: string
  image: string
}

/* ================= DATA ================= */

const team: TeamMember[] = [
  {
    id: "willy-portmann",
    first: "Willy",
    last: "Portmann",
    role: "CEO, Architect",
    email: "willy.portmann@portmann.ag",
    image:
      "https://apa-bucket01.fra1.digitaloceanspaces.com/assets/transforms/Team/_large/AugustPortmannAG-Architekturbuero-WP.jpg",
  },
  {
    id: "barbara-matter",
    first: "Barbara",
    last: "Matter",
    role: "Structural Draughtswoman",
    email: "immobilien@portmann.ag",
    image:
      "https://apa-bucket01.fra1.digitaloceanspaces.com/assets/transforms/Team/_large/AugustPortmannAG-Architekturbuero-BM.jpg",
  },
  {
    id: "max-bosshard",
    first: "Max",
    last: "Bosshard",
    role: "Draftsman EFZ",
    email: "immobilien@portmann.ag",
    image:
      "https://apa-bucket01.fra1.digitaloceanspaces.com/assets/transforms/Team/_large/AugustPortmannAG-Architekturbuero-MB.jpg",
  },
  {
    id: "melanie-bachmann",
    first: "Melanie",
    last: "Bachmann",
    role: "Property Manager",
    email: "immobilien@portmann.ag",
    image:
      "https://apa-bucket01.fra1.digitaloceanspaces.com/assets/transforms/Team/_large/AugustPortmannAG-Architekturbuero-MW_2023-06-01-054729_vqom.jpg",
  },
  {
    id: "anna-bachmann",
    first: "Anna",
    last: "Bachmann",
    role: "Property Management Clerk",
    email: "immobilien@portmann.ag",
    image:
      "https://apa-bucket01.fra1.digitaloceanspaces.com/assets/transforms/Team/_large/AugustPortmannAG-Anna-041_web-2.jpg",
  },
  {
    id: "ernst-hurlimann",
    first: "Ernst",
    last: "Hürlimann",
    role: "Facility Manager",
    email: "immobilien@portmann.ag",
    image:
      "https://apa-bucket01.fra1.digitaloceanspaces.com/assets/transforms/Team/_large/AugustPortmannAG-Architekturbuero-EH.jpg",
  },
]

/* ================= COMPONENT ================= */

export default function MeetOurTeam() {
  const marqueeStyle = {
    animation: "marquee 25s linear infinite",
  }

  return (
    <>
      {/* Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `,
        }}
      />

      <main className="bg-neutral-950 text-white min-h-screen overflow-x-hidden">
        {/* ================= HERO ================= */}
        <section className="relative h-[90vh] flex items-center justify-center">
          <Image
            src="https://apa-bucket01.fra1.digitaloceanspaces.com/assets/transforms/Team/_xlarge/AugustPortmannAG-Team_2025_website.jpg"
            alt="Company Team"
            fill
            className="object-cover opacity-40 grayscale"
            priority
          />

          <div className="relative z-10 text-center">
            <p className="text-xs tracking-[0.5em] uppercase text-neutral-400 mb-6">
              August Portmann AG
            </p>
            <h1 className="text-6xl md:text-9xl font-extrabold uppercase tracking-tighter">
              Collective
            </h1>
          </div>
        </section>

        {/* ================= MARQUEE ================= */}
        <div className="border-y border-white/10 bg-white/5 py-4 overflow-hidden">
          <div
            className="whitespace-nowrap flex gap-12 text-xs uppercase tracking-[0.3em] text-neutral-500"
            style={marqueeStyle}
          >
            <span>
              Architecture • Planning • Construction • Management • Design •
              Architecture • Planning • Construction • Management • Design
            </span>
            <span>
              Architecture • Planning • Construction • Management • Design •
              Architecture • Planning • Construction • Management • Design
            </span>
          </div>
        </div>

        {/* ================= TEAM GRID ================= */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
              {team.map((member) => {
                const fullName = `${member.first} ${member.last}`

                return (
                  <div
                    key={member.id}
                    className="group relative h-[600px] overflow-hidden bg-neutral-900"
                  >
                    <Image
                      src={member.image}
                      alt={fullName}
                      fill
                      className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <div className="transition-transform duration-500 group-hover:translate-y-0 translate-y-4">
                        <h3 className="text-3xl font-bold uppercase">
                          {member.first}
                        </h3>
                        <h3 className="text-3xl font-light uppercase text-neutral-300">
                          {member.last}
                        </h3>

                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <p className="text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-2">
                            {member.role}
                          </p>
                          <a
                            href={`mailto:${member.email}`}
                            className="text-sm text-white/80 hover:text-white"
                          >
                            {member.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="py-20 text-center border-t border-white/10">
          <h2 className="text-8xl font-bold text-neutral-900 uppercase">
            APA
          </h2>
        </footer>
      </main>
    </>
  )
}
