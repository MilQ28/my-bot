"use client";

import { useState, useEffect, useRef } from "react";
import { useColorBlind } from "@/contexts/ColorBlindContext";

const NAV_LINKS = [
  { label: "about", href: "/#about" },
  { label: "projects", href: "/#projects" },
  { label: "contact", href: "/#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isFriendlyMode, toggleFriendlyMode } = useColorBlind();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver instead of scroll listener
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Lock scroll when overlay open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Sentinel: sits just below the top of the page, triggers scrolled state */}
      <div ref={sentinelRef} className="absolute top-16 left-0 w-px h-px pointer-events-none" aria-hidden="true" />

      {/* ── Thin floating bar ── */}
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 sm:px-8 transition-all duration-300",
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border/40 shadow-sm"
            : "bg-background/20 backdrop-blur-sm border-b border-transparent",
        ].join(" ")}
      >
        {/* Wordmark */}
        <a
          href="/"
          className="text-foreground no-underline font-mono text-xs tracking-[0.14em] uppercase opacity-70 hover:opacity-100 transition-opacity duration-200"
        >
          syamil atsani
        </a>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-4 sm:gap-5">
          {/* Back to top — only visible after scroll */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className={[
              "font-mono text-[0.65rem] tracking-[0.12em] uppercase text-foreground/40 hover:text-foreground transition-all duration-300 cursor-pointer bg-transparent border-none p-0 flex items-center gap-1",
              scrolled
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 translate-x-2 pointer-events-none",
            ].join(" ")}
          >
            <span>top</span>
          </button>

          {/* Menu trigger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-foreground/50 hover:text-foreground transition-colors duration-200 cursor-pointer bg-transparent border-none p-1 flex items-center gap-1.5"
          >
            <span className="flex flex-col gap-[3px]">
              <span className="block w-4 h-px bg-current" />
              <span className="block w-2.5 h-px bg-current" />
            </span>
            menu
          </button>
        </div>
      </header>

      {/*
        ── Fullscreen nav overlay ──
        Clip-path reveal: mekar tepat dari posisi tombol menu & close (kanan atas: calc(100% - 2.5rem) 1.5rem).
        Tidak memerlukan JS tracking cursor sehingga selalu presisi dan lancar.
      */}
      <div
        className={[
          "fixed inset-0 z-[200] flex flex-col",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        style={{
          background: "#050401",
          clipPath: open
            ? "circle(170% at calc(100% - 2.5rem) 1.5rem)"
            : "circle(0% at calc(100% - 2.5rem) 1.5rem)",
          transition: open
            ? "clip-path 0.65s cubic-bezier(0.76, 0, 0.24, 1)"
            : "clip-path 0.5s cubic-bezier(0.76, 0, 0.24, 1) 0.08s",
        }}
      >
        {/* Close bar */}
        <div
          className="h-14 flex items-center px-4 sm:px-8 border-b border-white/5"
          style={{
            opacity: open ? 1 : 0,
            transition: open ? "opacity 0.3s ease 0.4s" : "opacity 0.12s ease",
          }}
        >
          <a href="/" className="font-mono text-[0.65rem] tracking-[0.14em] uppercase text-white/30">
            syamil atsani
          </a>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto font-mono text-[0.68rem] tracking-[0.12em] uppercase text-white/50 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none p-2"
          >
            close
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col justify-center px-6 sm:px-14 gap-2 sm:gap-4 overflow-y-auto">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="no-underline group flex items-baseline gap-4 sm:gap-6 py-1"
              style={{
                transform: open ? "translateY(0)" : "translateY(24px)",
                opacity: open ? 1 : 0,
                transition: open
                  ? `transform 0.5s cubic-bezier(0.22,1,0.36,1) ${340 + i * 60}ms, opacity 0.4s ease ${320 + i * 60}ms`
                  : "opacity 0.12s ease, transform 0.12s ease",
              }}
            >
              <span className="font-mono text-[0.65rem] text-white/20 w-6 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="text-white font-black uppercase leading-none group-hover:text-primary transition-colors duration-300"
                style={{ fontSize: "clamp(2.5rem, 8vw, 6.5rem)", letterSpacing: "-0.03em" }}
              >
                {link.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Footer of overlay */}
        <div
          className="h-16 flex items-center justify-between px-6 sm:px-14 border-t border-white/5"
          style={{
            opacity: open ? 1 : 0,
            transition: open ? "opacity 0.3s ease 0.5s" : "opacity 0.1s ease",
          }}
        >
          <button
            onClick={() => { toggleFriendlyMode(); setOpen(false); }}
            className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-white/40 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none p-1"
          >
            {isFriendlyMode ? "COLORBLIND: ON" : "COLORBLIND: OFF"}
          </button>
          <span className="font-mono text-[0.6rem] text-white/20">
            LAMPUNG, ID
          </span>
        </div>
      </div>
    </>
  );
}