'use client';

import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Contact from '@/components/sections/Contact';
import SectionObserver from '@/components/SectionObserver';

export default function Home() {
  return (
    <main>
      <SectionObserver />
      <Hero />
      <About />
      <Projects />
      <Contact />
    </main>
  );
}