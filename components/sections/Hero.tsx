"use client";

import { useEffect, useRef, useState } from "react";
import { initLanyard } from "@/lib/lanyardPhysics";
import type { PortfolioData } from "@/lib/dataStore";

export default function Hero() {
    const simulationRef = useRef<HTMLDivElement>(null);
    const [profile, setProfile] = useState<PortfolioData['profile']>({
        name: "Syamil Cholid Atsani",
        role: "Student Developer",
        location: "Lampung, ID",
        status: "Open for project & internship",
        focus: "Laravel - Next.js - TypeScript",
        bioSubtitle: "student developer - lampung",
        bioQuote: "nulis kode, deploy server,\nkadang debug sampai subuh.",
        aboutParagraphs: [],
        email: "syamilcholidatsan@gmail.com",
        github: "https://github.com/MilQ28",
        linkedin: "https://linkedin.com/in/syamilca",
    });

    useEffect(() => {
        fetch("/api/admin/data")
            .then((res) => res.json())
            .then((data) => {
                if (data?.profile) setProfile(data.profile);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (simulationRef.current) {
            simulationRef.current.classList.add("visible");
        }

        let cleanupLanyard: (() => void) | undefined;
        if (simulationRef.current) {
            cleanupLanyard = initLanyard(simulationRef.current);
        }
        return () => cleanupLanyard?.();
    }, []);

    const bgTextStyle: React.CSSProperties = {
        fontWeight: 900,
        fontSize: "clamp(3.5rem, 15vw, 15rem)",
        letterSpacing: "-0.06em",
        color: "transparent",
        WebkitTextStroke: "1px rgba(17,17,16,0.06)",
        textTransform: "uppercase",
        lineHeight: 0.82,
        display: "block",
    };

    return (
        <section className="hero" id="home">
            {/* Watermark nama */}
            <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 overflow-hidden">
                {/* SYAMIL — kiri atas */}
                <div className="absolute top-[clamp(2.5rem,6vh,4.5rem)] left-0 flex flex-col items-start pl-[clamp(1rem,4vw,5rem)]">
                    <span style={bgTextStyle}>SYA</span>
                    <span style={bgTextStyle}>MIL</span>
                </div>
                {/* CHOLID — kanan bawah */}
                <div className="absolute bottom-[clamp(3.5rem,8vh,6rem)] right-0 flex flex-col items-end pr-[clamp(1rem,4vw,5rem)]">
                    <span style={bgTextStyle}>CHO</span>
                    <span style={bgTextStyle}>LID</span>
                </div>
            </div>

            {/* FG Layer: Lanyard ID Pass */}
            <div className="hero-card-layer">
                <div className="lanyard-wrap lanyardComponent">
                    <div ref={simulationRef} className="lanyard-simulation">
                        <div className="lanyard-hanger"></div>
                        <div className="lanyard-strap"></div>
                        <div className="lanyard-memberCard card">
                            <div className="card-hole card-clip-slot"></div>

                            {/* Clean Photo Container */}
                            <div className="card-photo" style={{ position: "relative", overflow: "hidden", padding: 0, gap: 0 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/syamil.jpg"
                                    alt="Syamil Cholid Atsani"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        objectPosition: "center 20%",
                                    }}
                                />
                            </div>

                            {/* Clean Name & Info */}
                            <div className="pt-3 pb-1 border-b border-line">
                                <h1 className="font-mono text-xs font-bold tracking-wide uppercase text-foreground leading-tight">
                                    {profile.name}
                                </h1>
                                <p className="font-mono text-[0.65rem] text-foreground/60 mt-0.5">
                                    {profile.role}
                                </p>
                            </div>

                            {/* Card Metadata */}
                            <div className="card-meta-grid pt-2.5">
                                <div>
                                    <span className="card-meta-label">LOCATION</span>
                                    <span className="card-meta-val">{profile.location}</span>
                                </div>
                                <div>
                                    <span className="card-meta-label">FOCUS</span>
                                    <span className="card-meta-val">{profile.focus}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom-left caption */}
            <div className="hero-caption">
                <p className="hero-caption-role">{profile.bioSubtitle || 'student developer - lampung'}</p>
                <p className="hero-caption-bio whitespace-pre-line">
                    {profile.bioQuote || 'nulis kode, deploy server,\nkadang debug sampai subuh.'}
                </p>
                <div className="hero-caption-links">
                    <a href="/#about" className="hero-link">about</a>
                    <span className="hero-link-sep">/</span>
                    <a href="/#projects" className="hero-link">projects</a>
                    <span className="hero-link-sep">/</span>
                    <a
                        href="/#contact"
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent("open-chat"));
                        }}
                        className="hero-link"
                    >
                        talk
                    </a>
                    <span className="hero-link-sep">/</span>
                    <a
                        href="/cv.pdf"
                        download="Syamil_Cholid_Atsani_CV.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-link font-bold text-primary"
                    >
                        cv ↗
                    </a>
                </div>
            </div>

            {/* Bottom scrolling ticker */}
            <div className="hero-ticker" aria-hidden="true">
                <div className="hero-ticker-track">
                    {["Next.js", "Laravel", "React", "TypeScript", "PostgreSQL", "Python", "Tailwind"].map((t, i) => (
                        <span key={i} className="hero-ticker-item">{t}</span>
                    ))}
                    {["Next.js", "Laravel", "React", "TypeScript", "PostgreSQL", "Python", "Tailwind"].map((t, i) => (
                        <span key={`b${i}`} className="hero-ticker-item">{t}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}