"use client";

import { useEffect, useState } from "react";
import Container from "../Container";
import type { ProjectItem } from "@/lib/dataStore";

interface GithubRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
    fork: boolean;
}

// Fallback jika API GitHub limit atau sedang offline
const FALLBACK_REPOS: GithubRepo[] = [
    {
        id: 1,
        name: "my-bot",
        description: "AI chatbot assistant & interactive conversational web platform.",
        html_url: "https://github.com/MilQ28/my-bot",
        language: "TypeScript",
        stargazers_count: 0,
        forks_count: 0,
        updated_at: "2026-08-27T01:38:13Z",
        fork: false,
    },
    {
        id: 2,
        name: "nextbot",
        description: "Next.js conversational engine & automated workflow bot.",
        html_url: "https://github.com/MilQ28/nextbot",
        language: "TypeScript",
        stargazers_count: 0,
        forks_count: 0,
        updated_at: "2026-08-26T03:03:44Z",
        fork: false,
    },
    {
        id: 3,
        name: "Profile-Next",
        description: "Portfolio and personal space built with Next.js and Tailwind CSS.",
        html_url: "https://github.com/MilQ28/Profile-Next",
        language: "TypeScript",
        stargazers_count: 0,
        forks_count: 0,
        updated_at: "2026-07-28T04:16:21Z",
        fork: false,
    },
    {
        id: 4,
        name: "CRUD-PHP",
        description: "Data management app built on PHP and a relational database.",
        html_url: "https://github.com/MilQ28/CRUD-PHP",
        language: "PHP",
        stargazers_count: 0,
        forks_count: 0,
        updated_at: "2026-07-15T07:23:37Z",
        fork: false,
    },
];

export default function Projects() {
    const [repos, setRepos] = useState<GithubRepo[]>(FALLBACK_REPOS);
    const [customProjects, setCustomProjects] = useState<ProjectItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLive, setIsLive] = useState<boolean>(false);

    useEffect(() => {
        // Fetch Admin Custom Projects
        fetch("/api/admin/data")
            .then((res) => res.json())
            .then((data) => {
                if (data?.projects && Array.isArray(data.projects)) {
                    setCustomProjects(data.projects);
                }
            })
            .catch(() => {});

        async function fetchGithubRepos() {
            try {
                const res = await fetch("https://api.github.com/users/MilQ28/repos?sort=updated&per_page=12");
                if (res.ok) {
                    const data: GithubRepo[] = await res.json();
                    const filtered = data
                        .filter((r) => r.name.toLowerCase() !== "milq28" && !r.fork)
                        .slice(0, 6);
                    if (filtered.length > 0) {
                        setRepos(filtered);
                        setIsLive(true);
                    }
                }
            } catch {
                // Gunakan fallback jika fetch gagal / offline
            } finally {
                setIsLoading(false);
            }
        }

        fetchGithubRepos();
    }, []);

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
            });
        } catch {
            return "Recent";
        }
    };

    return (
        <Container
            id="projects"
            as="section"
            className="bg-background text-foreground px-4 sm:px-8 lg:px-16 py-20 sm:py-28 border-t border-line transition-colors duration-500"
        >
            <div className="max-w-6xl mx-auto">
                {/* ── Header — no eyebrow ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-10 sm:pb-14 border-b border-line mb-10 sm:mb-14">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-foreground text-wrap-balance">
                            Selected projects
                        </h2>
                        {isLive && (
                            <span className="font-mono text-[0.6rem] px-1.5 py-0.5 border border-primary/30 text-primary bg-primary/10 shrink-0 self-end mb-1.5">
                                LIVE
                            </span>
                        )}
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-foreground/60 max-w-sm leading-relaxed">
                        Public repos from <strong>@MilQ28</strong> &amp; featured work.
                    </p>
                </div>

                {/* ── Project List — row layout, not a card grid ── */}
                {isLoading ? (
                    <div className="divide-y divide-line">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="py-7 animate-pulse flex flex-col sm:flex-row gap-4 justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="h-5 bg-foreground/10 rounded w-1/4" />
                                    <div className="h-3 bg-foreground/10 rounded w-2/3" />
                                </div>
                                <div className="h-3 bg-foreground/10 rounded w-20 shrink-0 self-start sm:self-center" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-line">
                        {/* 1. Custom Featured Projects from Admin Panel */}
                        {customProjects.map((proj, idx) => (
                            <div
                                key={proj.id}
                                className="group py-7 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 hover:bg-panel/50 -mx-4 px-4 sm:-mx-8 sm:px-8 transition-colors duration-200"
                            >
                                <span className="font-mono text-[0.65rem] text-primary shrink-0 mt-1 w-6 hidden sm:block font-bold">
                                    {String(idx + 1).padStart(2, "0")}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={proj.githubUrl || proj.liveUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg sm:text-xl font-sans font-bold text-foreground group-hover:text-primary transition-colors no-underline"
                                        >
                                            {proj.title}
                                        </a>
                                        {proj.status && (
                                            <span className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                                                {proj.status}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-foreground/60 font-sans leading-relaxed mt-1 max-w-xl">
                                        {proj.description}
                                    </p>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {proj.technologies.map((t, i) => (
                                                <span key={i} className="font-mono text-[10px] text-foreground/60 bg-panel px-2 py-0.5 border border-line rounded">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="font-mono text-[0.65rem] text-foreground/40 flex sm:flex-col items-start sm:items-end gap-3 sm:gap-1 shrink-0">
                                    <span className="text-primary font-bold">FEATURED</span>
                                </div>
                            </div>
                        ))}

                        {/* 2. GitHub Repositories (filtering out duplicates) */}
                        {repos
                            .filter((r) => !customProjects.some((cp) => cp.title.toLowerCase() === r.name.toLowerCase()))
                            .map((repo, idx) => (
                                <div
                                    key={repo.id}
                                    className="group py-7 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 hover:bg-panel/50 -mx-4 px-4 sm:-mx-8 sm:px-8 transition-colors duration-200"
                                >
                                    {/* Index */}
                                    <span className="font-mono text-[0.65rem] text-foreground/30 shrink-0 mt-1 w-6 hidden sm:block">
                                        {String(customProjects.length + idx + 1).padStart(2, "0")}
                                    </span>

                                    {/* Name & Description */}
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg sm:text-xl font-sans font-bold text-foreground group-hover:text-primary transition-colors no-underline"
                                        >
                                            {repo.name}
                                        </a>
                                        <p className="text-xs sm:text-sm text-foreground/60 font-sans leading-relaxed mt-1 max-w-xl">
                                            {repo.description || "Public repository by Syamil Cholid Atsani."}
                                        </p>
                                    </div>

                                    {/* Meta — language + date, right-aligned */}
                                    <div className="font-mono text-[0.65rem] text-foreground/40 flex sm:flex-col items-start sm:items-end gap-3 sm:gap-1 shrink-0">
                                        {repo.language && (
                                            <span className="text-foreground/60 font-bold">{repo.language}</span>
                                        )}
                                        <span>{formatDate(repo.updated_at)}</span>
                                        {repo.stargazers_count > 0 && (
                                            <span>★ {repo.stargazers_count}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* ── Link to GitHub profile ── */}
                <div className="mt-12 text-left">
                    <a
                        href="https://github.com/MilQ28"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-mono text-xs text-foreground/50 hover:text-foreground transition-colors duration-200 group"
                    >
                        <span>View all repos on GitHub</span>
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                    </a>
                </div>
            </div>
        </Container>
    );
}