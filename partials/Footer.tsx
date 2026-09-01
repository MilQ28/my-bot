"use client";

export default function Footer() {
    return (
        <footer className="bg-background text-foreground border-t border-line transition-colors duration-500 py-10 px-4 sm:px-8 lg:px-16">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-foreground/60">
                <div className="flex items-center gap-6">
                    <a
                        href="https://github.com/MilQ28"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://www.linkedin.com/in/syamilca/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        LinkedIn
                    </a>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                        Back to top
                    </button>
                </div>

                <div className="text-center md:text-right space-y-1 text-[0.7rem]">
                    <p>© {new Date().getFullYear()} Syamil Cholid Atsani</p>
                    <p className="text-foreground/40 font-mono">Lampung, Indonesia - WIB (UTC+7)</p>
                </div>
            </div>
        </footer>
    );
}