"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3Icon, Globe2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

const locations = [
  {
    id: "mexico",
    city: "Mexico",
    label: "CDMX",
    timezone: "America/Mexico_City",
    region: "Mexico",
    flag: "/mx.svg",
  },
  {
    id: "shanghai",
    city: "Shanghai",
    label: "CN",
    timezone: "Asia/Shanghai",
    region: "China",
    flag: "/cn.svg",
  },
  {
    id: "hamburg",
    city: "Hamburgo",
    label: "DE",
    timezone: "Europe/Berlin",
    region: "Alemania",
    flag: "/de.svg",
  },
] as const;

type Location = (typeof locations)[number];
type LocationId = Location["id"];

type HoreProps = {
  className?: string;
};

function formatLocationTime(utcNow: number, location: Location) {
  const date = new Date(utcNow);

  const time = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: location.timezone,
  }).format(date);

  const day = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: location.timezone,
  }).format(date);

  const offset =
    new Intl.DateTimeFormat("en-US", {
      timeZone: location.timezone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "";

  return {
    time,
    day,
    offset,
  };
}

export function Hore({ className }: HoreProps) {
  const [mounted, setMounted] = useState(false);
  const [utcNow, setUtcNow] = useState(() => Date.now());
  const [activeLocation, setActiveLocation] = useState<LocationId>("mexico");
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setMounted(true);
    setUtcNow(Date.now());

    const intervalId = window.setInterval(() => {
      setUtcNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeIndex = locations.findIndex((location) => location.id === activeLocation);
  const activeCity = locations[activeIndex] ?? locations[0];

  const currentTime = useMemo(() => {
    if (!mounted) {
      return null;
    }

    return formatLocationTime(utcNow, activeCity);
  }, [activeCity, mounted, utcNow]);

  const handleLocationChange = (nextLocation: LocationId) => {
    const nextIndex = locations.findIndex((location) => location.id === nextLocation);

    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveLocation(nextLocation);
  };

  return (
    <aside className={cn("w-full max-w-[23rem]", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/78 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
           
          )}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_72%)]" />

        <div className="relative">
          <div className="grid grid-cols-3 rounded-full bg-black/[0.035] p-1 ring-1 ring-black/5">
            {locations.map((location) => {
              const isActive = location.id === activeLocation;

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleLocationChange(location.id)}
                  className="relative z-10 rounded-full px-2 py-2.5 text-[0.7rem] leading-none font-medium text-muted-foreground transition-colors"
                >
                  {isActive ? (
                    <motion.span
                      layoutId="active-world-clock-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <span className={cn("relative", isActive ? "text-foreground" : "")}>
                    {location.region}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-[1.35rem] border border-white/55 bg-white/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={activeCity.id}
                custom={direction}
                initial={{ opacity: 0, x: direction >= 0 ? 18 : -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction >= 0 ? -18 : 18 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-12 shrink-0 items-center justify-center">
                      <Image
                        src={activeCity.flag}
                        alt={`Bandera de ${activeCity.city}`}
                        width={34}
                        height={34}
                        className="h-8.5 w-8.5 object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-medium tracking-[-0.04em] text-foreground">
                        {activeCity.city}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {activeCity.region}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-full bg-black/[0.035] px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground ring-1 ring-black/5">
                    {mounted ? currentTime?.offset : "UTC"}
                  </div>
                </div>

                <div className="space-y-1 pl-0.5">
                  <p className="text-[1.95rem] font-medium tracking-[-0.08em] text-foreground sm:text-[2.2rem]">
                    {mounted ? currentTime?.time : "--:--:--"}
                  </p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {mounted ? currentTime?.day : "Sincronizando reloj..."}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </aside>
  );
}
