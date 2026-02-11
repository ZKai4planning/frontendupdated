import Image from "next/image"

// export function Logo() {
//   return (
//     <div className="w-20 h-12">
//       <Image
//         src="/logo.png"
//         alt="Ai4Planning logo"
//         width={90}
//         height={42}
//         className="object-contain"
//       />
//     </div>
//   )
// }


export function Logo() {
  return (
    <div className="w-30 h-22 overflow-hidden">
      <video
        src="/logovideo.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-contain"
      />
    </div>
  )
}
