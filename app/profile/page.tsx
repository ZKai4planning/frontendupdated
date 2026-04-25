"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

const TOTAL_DURATION = 5000; // 5 seconds

const TASKS = [
  "Scanning identity records",
  "Fetching permissions layer",
  "Syncing preferences module",
  "Compiling activity logs",
  "Finalizing environment",
];

const STATUS_MAP: Record<string, string> = {
  "Scanning identity records": "Scanning identity records",
  "Fetching permissions layer": "Fetching permissions layer",
  "Syncing preferences module": "Fetching permissions layer",
  "Compiling activity logs": "Compiling activity logs",
  "Finalizing environment": "Finalizing environment",
};

export default function ProfileAutomationPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const redirectedRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);

  /* ---------------- MASTER TIMER (5s) ---------------- */
  useEffect(() => {
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const clamped = Math.min(elapsed, TOTAL_DURATION);

      setProgress(Math.round((clamped / TOTAL_DURATION) * 100));

      const stepDuration = TOTAL_DURATION / TASKS.length;
      setTaskIndex(
        Math.min(
          Math.floor(clamped / stepDuration),
          TASKS.length - 1
        )
      );

      if (elapsed < TOTAL_DURATION) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, []);

  /* ---------------- AUTO REDIRECT AT 100% ---------------- */
  useEffect(() => {
    if (progress === 100 && !redirectedRef.current) {
      redirectedRef.current = true;

      setTimeout(() => {
        // router.push("/dashboard?stage=payment");
        router.push("/dashboard");
      }, 700);
    }
  }, [progress, router]);

  /* ---------------- VIDEO CONTROL ---------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        await video.play();
      } catch {
        setTimeout(() => {
          video.play().catch(() => {});
        }, 350);
      }
    };

    const onLoaded = () => {
      video.playbackRate = video.duration / 5;
      tryPlay();
    };

    video.addEventListener("loadedmetadata", onLoaded);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tryPlay();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white flex items-center justify-center">
      {/* BACKGROUND VIDEO */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/profilebgvideo.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/video-poster.jpg"
      />

      <div className="absolute inset-0 bg-[#05080d]/40 z-[1]" />

      <div className="relative z-10 flex flex-col bg-black/70 p-12 rounded-2xl items-center text-center max-w-xl">
        {/* AI CORE */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-56 h-56 rounded-full border border-dashed border-white animate-spin-5s-reverse" />
          <div className="absolute w-48 h-48 rounded-full border border-white animate-spin-5s" />
          <div className="absolute w-40 h-40 rounded-full blur-3xl bg-blue-500/30 animate-pulse" />

          <div className="relative w-40 h-40 rounded-full border border-blue-500/40 bg-zinc-900 overflow-hidden z-10">
            <Image
              src="/profile-1.jpg"
              alt="AI Agent"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        <h1 className="mt-12 text-2xl font-semibold tracking-wide">
          Drafting Your Profile
        </h1>

        <p className="mt-3 text-sm text-gray-300">
          Autonomous system assembling your digital identity
        </p>

        <div className="mt-8 w-full bg-zinc-900/80 border border-blue-500/20 rounded-xl p-5 text-left">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">
              {TASKS[taskIndex]}…
            </p>
            <span className="text-blue-400 font-semibold">
              {progress}%
            </span>
          </div>

          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={TASKS[taskIndex]}
            className="mt-6 text-xs tracking-wide font-mono"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {STATUS_MAP[TASKS[taskIndex]]}…
          </motion.p>
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes spin5 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-5s {
          animation: spin5 5s linear forwards;
        }
        .animate-spin-5s-reverse {
          animation: spin5 5s linear reverse forwards;
        }
      `}</style>
    </div>
  );
}
