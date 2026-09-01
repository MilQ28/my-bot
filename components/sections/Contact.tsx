"use client";

import { useState } from "react";
import Container from "../Container";

export default function Contact() {
    const [copied, setCopied] = useState(false);
    const email = "syamilcholidatsani@gmail.com";

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Container
            id="contact"
            as="section"
            className="bg-background text-foreground px-4 sm:px-8 lg:px-16 py-20 sm:py-28 border-t border-line transition-colors duration-500 min-h-0"
        >
            <div className="max-w-6xl mx-auto">
                {/* ── Section Header — Section Title & Status Pill ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-10 sm:pb-14 border-b border-line mb-10 sm:mb-14">
                    <div>
                        <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-foreground text-wrap-balance">
                            Let&apos;s build something together
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-foreground/70 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Open for project &amp; internship</span>
                    </div>
                </div>

                {/* ── Main Contact Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column — Message */}
                    <div className="lg:col-span-6 space-y-4">
                        <p className="text-lg sm:text-xl font-sans font-semibold text-foreground leading-snug">
                            Ada ide proyek, membutuhkan web developer, atau sekadar ingin berdiskusi?
                        </p>
                        <p className="text-sm sm:text-base text-foreground/70 font-sans leading-relaxed">
                            Terbuka untuk pekerjaan freelance, magang, kolaborasi open-source, atau konsultasi seputar tech stack (Laravel, Next.js, TypeScript).
                        </p>
                        <p className="font-mono text-xs text-foreground/50 pt-2">
                            Biasanya membalas pesan dalam 24 jam - Lampung, WIB (UTC+7)
                        </p>
                    </div>

                    {/* Right Column — Direct Contact Box (Tactile Panel) */}
                    <div
                        className="lg:col-span-6 bg-panel p-6 sm:p-8 border border-line flex flex-col justify-between gap-6"
                        style={{ borderRadius: "var(--r-card)" }}
                    >
                        <div className="space-y-3">
                            <span className="font-mono text-[0.65rem] tracking-wider uppercase text-foreground/50 block">
                                Direct Email
                            </span>
                            <p className="font-mono text-sm sm:text-base font-bold text-foreground break-all select-all">
                                {email}
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                onClick={handleCopy}
                                className="flex-1 sm:flex-none py-2.5 px-5 border border-foreground/20 hover:border-foreground bg-background hover:bg-foreground hover:text-background transition-all duration-200 font-mono text-[0.68rem] tracking-wider uppercase text-foreground font-bold cursor-pointer text-center"
                                style={{ borderRadius: "var(--r-btn)" }}
                            >
                                {copied ? "✓ Copied to clipboard" : "Copy email address"}
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
                                className="flex-1 sm:flex-none py-2.5 px-5 bg-primary text-foreground hover:opacity-85 transition-opacity duration-200 font-mono text-[0.68rem] tracking-wider uppercase font-bold cursor-pointer text-center"
                                style={{ borderRadius: "var(--r-btn)" }}
                            >
                                Chat AI assistant
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}
