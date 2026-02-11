import Image from "next/image"
import { cn } from "@/lib/utils"
 
export default function Logo({
  collapsed = false,
}: {
  collapsed?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 transition-all duration-300 overflow-hidden",
        collapsed ? "justify-center" : "justify-start"
      )}
    >
      <Image
        src="/logo.png"
        alt="Ai4Planning Logo"
        width={28}
        height={28}
        priority
        className=""
      />
 
      {!collapsed && (
        <span className="font-bold ml-1 text-lg whitespace-nowrap">
          AI4PLANNING
        </span>
      )}
    </div>
  )
}