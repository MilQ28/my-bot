import fs from 'fs';
import path from 'path';

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  status: string;
  isFeatured: boolean;
}

export interface SkillCategory {
  category: string;
  items: Array<{ name: string; desc: string }>;
}

export interface PortfolioData {
  profile: {
    name: string;
    role: string;
    location: string;
    status: string;
    focus: string;
    bioSubtitle: string;
    bioQuote: string;
    aboutParagraphs: string[];
    email: string;
    github: string;
    linkedin: string;
  };
  projects: ProjectItem[];
  skills: SkillCategory[];
  botConfig: {
    quickPrompts: string[];
    customNote: string;
  };
}

const DATA_PATH = path.join(process.cwd(), 'data', 'portfolio-data.json');

export function getPortfolioData(): PortfolioData {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return getDefaultData();
    }
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    console.error('[DATA_STORE_READ_ERROR]', err);
    return getDefaultData();
  }
}

export function savePortfolioData(data: PortfolioData): boolean {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DATA_STORE_WRITE_ERROR]', err);
    return false;
  }
}

function getDefaultData(): PortfolioData {
  return {
    profile: {
      name: "Syamil Cholid Atsani",
      role: "Student Developer",
      location: "Lampung, Indonesia",
      status: "Open for project & internship",
      focus: "Laravel - Next.js - TypeScript",
      bioSubtitle: "student developer - lampung",
      bioQuote: "nulis kode, deploy server,\nkadang debug sampai subuh.",
      aboutParagraphs: [
        "Halo! Gua student developer asal Lampung yang fokus ngebangun aplikasi web modern dan interaktif.",
        "Gua paling sering ngoding pakai Next.js, React, dan Laravel buat kebutuhan aplikasi web full-stack yang responsif dan user-friendly.",
        "Prinsip gua cukup simpel: bikin aplikasi yang kodenya rapi, gampang di-maintain, dan beneran ngebantu orang yang make."
      ],
      email: "syamilcholidatsan@gmail.com",
      github: "https://github.com/MilQ28",
      linkedin: "https://linkedin.com/in/syamilca"
    },
    projects: [
      {
        id: "stellazone",
        title: "Stellazone",
        subtitle: "School Organization Web Platform",
        description: "Web platform terpadu untuk organisasi sekolah MPK-OSIS.",
        technologies: ["Next.js", "React", "Laravel", "MySQL", "Tailwind CSS"],
        githubUrl: "https://github.com/MilQ28/Stellazone",
        liveUrl: "",
        status: "In Active Development",
        isFeatured: true
      }
    ],
    skills: [
      {
        category: "Frameworks & Backend",
        items: [
          { name: "Laravel (PHP)", desc: "Web backend, REST API, web applications" },
          { name: "Node.js & Express", desc: "REST API & server utilities" },
          { name: "Python", desc: "Scripting, automation, data handling" }
        ]
      },
      {
        category: "Frontend & Interface",
        items: [
          { name: "Next.js & React", desc: "Full-stack web apps, dynamic routing" },
          { name: "TypeScript", desc: "Type-safe code, fewer runtime surprises" },
          { name: "Tailwind CSS", desc: "Responsive styling, component UI" }
        ]
      }
    ],
    botConfig: {
      quickPrompts: [
        "Ceritakan tentang Syamil",
        "Apa saja skill Syamil?",
        "Lihat proyek terbaru",
        "Boleh minta CV / Resume Syamil?"
      ],
      customNote: ""
    }
  };
}
