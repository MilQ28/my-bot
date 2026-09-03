import { redis } from "./redis";
import fallbackData from "@/data/portfolio-data.json";

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
  cvUrl?: string;
}

const KV_KEY = "portfolio-data";
const CV_URL_KEY = "cv-url";

export function getDefaultData(): PortfolioData {
  return fallbackData as PortfolioData;
}

export async function getPortfolioData(): Promise<PortfolioData> {
  if (!redis) {
    return getDefaultData();
  }

  try {
    const data = await redis.get<PortfolioData>(KV_KEY);
    return data ?? getDefaultData();
  } catch (err) {
    console.error("[DATA_STORE_READ_ERROR]", err);
    return getDefaultData();
  }
}

export async function savePortfolioData(data: PortfolioData): Promise<boolean> {
  if (!redis) {
    console.warn("[DATA_STORE_WRITE_WARNING] Redis is not configured. Data not persisted to KV.");
    return false;
  }

  try {
    await redis.set(KV_KEY, data);
    return true;
  } catch (err) {
    console.error("[DATA_STORE_WRITE_ERROR]", err);
    return false;
  }
}

export async function getCvUrl(): Promise<string> {
  if (!redis) {
    return "/cv.pdf";
  }

  try {
    const url = await redis.get<string>(CV_URL_KEY);
    return url || "/cv.pdf";
  } catch (err) {
    console.error("[DATA_STORE_CV_READ_ERROR]", err);
    return "/cv.pdf";
  }
}

export async function saveCvUrl(url: string): Promise<boolean> {
  if (!redis) {
    console.warn("[DATA_STORE_CV_WRITE_WARNING] Redis is not configured. CV URL not persisted.");
    return false;
  }

  try {
    await redis.set(CV_URL_KEY, url);
    return true;
  } catch (err) {
    console.error("[DATA_STORE_CV_WRITE_ERROR]", err);
    return false;
  }
}

