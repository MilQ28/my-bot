"use client";

import { useState, useEffect } from "react";
import Container from "../Container";
import type { PortfolioData } from "@/lib/dataStore";

const DEFAULT_STACK = [
    {
        category: "Frameworks & Backend",
        items: [
            { name: "Laravel (PHP)", desc: "Web backend, REST API, web applications" },
            { name: "Node.js & Express", desc: "REST API & server utilities" },
            { name: "Python", desc: "Scripting, automation, data handling" },
        ],
    },
    {
        category: "Frontend & Interface",
        items: [
            { name: "Next.js & React", desc: "Full-stack web apps, dynamic routing" },
            { name: "TypeScript", desc: "Type-safe code, fewer runtime surprises" },
            { name: "Tailwind CSS", desc: "Responsive styling, component UI" },
        ],
    },
    {
        category: "Database & Tools",
        items: [
            { name: "PostgreSQL & MySQL", desc: "Relational databases, schema design" },
            { name: "Linux & Docker", desc: "Dev environment, deployment" },
            { name: "Git & GitHub", desc: "Version control, code management" },
        ],
    },
];

export default function About() {
    const [data, setData] = useState<PortfolioData | null>(null);

    useEffect(() => {
        fetch("/api/admin/data")
            .then((res) => res.json())
            .then((resData) => {
                if (resData?.profile) setData(resData);
            })
            .catch(() => {});
    }, []);

    const name = data?.profile?.name || "Syamil Cholid Atsani";
    const role = data?.profile?.role || "Student Developer";
    const location = data?.profile?.location || "Lampung, Indonesia (WIB)";
    const status = data?.profile?.status || "Open to projects / internship";
    const focus = data?.profile?.focus || "Web Development & Full-stack";
    const aboutParagraphs = data?.profile?.aboutParagraphs && data.profile.aboutParagraphs.length > 0
        ? data.profile.aboutParagraphs
        : [
            "Halo! Gua student developer asal Lampung yang fokus ngebangun aplikasi web modern dan interaktif.",
            "Gua paling sering ngoding pakai Next.js, React, dan Laravel buat kebutuhan aplikasi web full-stack yang responsif dan user-friendly.",
            "Prinsip gua cukup simpel: bikin aplikasi yang kodenya rapi, gampang di-maintain, dan beneran ngebantu orang yang make."
        ];
    const techStack = data?.skills && data.skills.length > 0 ? data.skills : DEFAULT_STACK;
    return (
        <Container
            id="about"
            as="section"
            className="bg-background text-foreground px-4 sm:px-8 lg:px-16 py-20 sm:py-28 border-t border-line transition-colors duration-500"
        >
            <div className="max-w-6xl mx-auto">
                {/* ── Section Header — no eyebrow, just the name ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-10 sm:pb-14 border-b border-line mb-10 sm:mb-14">
                    <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-foreground text-wrap-balance">
                        {name}
                    </h2>
                    <div className="font-mono text-xs text-foreground/60 space-y-1">
                        <p>{role}</p>
                        <p>{location}</p>
                    </div>
                </div>

                {/* ── Bio & Quick Card ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 mb-16 sm:mb-20">
                    {/* Bio Text */}
                    <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-foreground/80 font-sans leading-relaxed">
                        {aboutParagraphs.map((para, i) => (
                            <p key={i} className={i === 0 ? "text-lg sm:text-xl font-semibold text-foreground leading-snug" : ""}>
                                {para}
                            </p>
                        ))}
                    </div>

                    {/* Quick Info Card — tighter radius, no eyebrow */}
                    <div
                        className="lg:col-span-5 bg-panel p-6 sm:p-8 border border-line flex flex-col justify-between gap-6"
                        style={{ borderRadius: "var(--r-card)" }}
                    >
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex items-center justify-between pb-2.5 border-b border-line">
                                <span className="text-foreground/55">Status</span>
                                <span className="font-bold text-foreground">{status}</span>
                            </div>
                            <div className="flex items-center justify-between pb-2.5 border-b border-line">
                                <span className="text-foreground/55">Focus</span>
                                <span className="font-bold text-foreground">{focus}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-foreground/55">Based in</span>
                                <span className="font-bold text-foreground">{location}</span>
                            </div>
                        </div>

                        <a
                            href={data?.cvUrl || "/api/cv"}
                            download="Syamil_Cholid_Atsani_CV.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 bg-background hover:bg-foreground hover:text-background border border-line hover:border-foreground transition-all duration-200 font-mono text-[0.68rem] tracking-wider uppercase font-bold text-center flex items-center justify-center gap-2 cursor-pointer"
                            style={{ borderRadius: "var(--r-btn)" }}
                        >
                            <span>Download CV / Resume</span>
                            <span aria-hidden="true">↓</span>
                        </a>
                    </div>
                </div>

                {/* ── Tech Stack — flat 2-col list, no cards ── */}
                <div className="divide-y divide-line">
                    {techStack.map((cat, idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-8"
                        >
                            {/* Category label — left column */}
                            <div className="md:col-span-3">
                                <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
                                    {cat.category}
                                </span>
                            </div>

                            {/* Items — right columns, horizontal on desktop */}
                            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {cat.items.map((item, sIdx) => (
                                    <div key={sIdx}>
                                        <span className="font-mono text-xs font-bold text-foreground block mb-0.5">
                                            {item.name}
                                        </span>
                                        <span className="text-[0.7rem] text-foreground/60 font-sans leading-snug block">
                                            {item.desc}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}
