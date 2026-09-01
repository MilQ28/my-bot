'use client';

import { useEffect } from 'react';

export default function SectionObserver() {
    useEffect(() => {
        const sectionIds = ['home', 'about', 'projects', 'contact'];
        
        // Wait for DOM layout
        const timer = setTimeout(() => {
            const sections = sectionIds
                .map((id) => document.getElementById(id))
                .filter((el): el is HTMLElement => el !== null);

            if (sections.length === 0) return;

            let currentHash = window.location.hash;

            const observer = new IntersectionObserver(
                (entries) => {
                    const visibleEntries = entries.filter((entry) => entry.isIntersecting);
                    if (visibleEntries.length === 0) return;

                    // Pick section with highest visibility ratio
                    visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    const mostVisible = visibleEntries[0];
                    const targetId = mostVisible.target.id;
                    const newHash = targetId === 'home' ? '#' : `#${targetId}`;

                    if (window.location.hash !== newHash && newHash !== currentHash) {
                        currentHash = newHash;
                        window.history.replaceState(null, '', newHash === '#' ? window.location.pathname : newHash);
                    }
                },
                {
                    threshold: [0.15, 0.4, 0.7],
                    rootMargin: '-20% 0px -35% 0px',
                }
            );

            sections.forEach((section) => observer.observe(section));

            return () => observer.disconnect();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
