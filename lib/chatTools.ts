/**
 * Chat Tools for GitHub Integration
 * Defines AI SDK tool schemas for accessing GitHub repository information
 * These tools are called by the LLM when it determines they're needed
 */

import { tool } from "ai";
import { z } from "zod";
import * as github from "./github";

/**
 * Tool: Get repository information (name, language, stars, etc.)
 * Used for: "What is project X?", "What language does X use?", "How many stars does X have?"
 */
export const getRepositoryTool = tool({
  description:
    "Get repository metadata (name, description, language, stars, forks). Extract the repository name from user message (e.g., my-bot, nextbot, Profile-Next, CRUD-PHP, empat, h-1, etc.). Use when user asks about project details or what technologies a project uses.",
  inputSchema: z.object({
    repositoryName: z
      .string()
      .min(1, "Repository name is required")
      .describe("The repository name (e.g. my-bot, nextbot, Profile-Next, CRUD-PHP, empat, h-1)."),
  }),
  execute: async (params: { repositoryName: string }) => {
    try {
      console.log("[TOOL] getRepository called for:", params.repositoryName);
      const repo = await github.getRepository(params.repositoryName);
      console.log("[TOOL] getRepository success:", repo.name);
      
      return `Repository: ${repo.name}
Description: ${repo.description || "No description"}
Language: ${repo.language || "Not specified"}
Stars: ${repo.stars}
Forks: ${repo.forks}
Updated: ${new Date(repo.updatedAt).toLocaleDateString()}
URL: ${repo.url}`;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[TOOL] getRepository error:", errorMsg);
      return `Error fetching repository "${params.repositoryName}": ${errorMsg}`;
    }
  },
});

/**
 * Tool: Get repository README content
 * Used for: "Explain project X", "What is project X for?", "How does X work?"
 */
export const getReadmeTool = tool({
  description:
    "Get README content from a project. Extract the repository name from user message (e.g., my-bot, nextbot, Profile-Next, CRUD-PHP, empat, h-1). Use when user asks for project explanation, features, how it works, or project purpose.",
  inputSchema: z.object({
    repositoryName: z
      .string()
      .min(1, "Repository name is required")
      .describe("The repository name (e.g. my-bot, nextbot, Profile-Next, CRUD-PHP, empat, h-1)."),
  }),
  execute: async (params: { repositoryName: string }) => {
    try {
      console.log("[TOOL] getReadme called with repositoryName:", params.repositoryName);
      const readme = await github.getReadme(params.repositoryName);

      if (!readme) {
        console.log("[TOOL] No README found for:", params.repositoryName);
        return `No README found for repository "${params.repositoryName}"`;
      }

      // Limit README size for LLM context
      const content = readme.length > 3000 ? readme.slice(0, 3000) + "\n[...README dipotong]" : readme;
      console.log("[TOOL] getReadme success, length:", content.length);
      return content;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[TOOL] getReadme error:", errorMsg);
      return `Error fetching README for "${params.repositoryName}": ${errorMsg}`;
    }
  },
});

/**
 * Tool: Get repository structure/file tree
 * Used for: "What is the structure of X?", "Where is file Y in X?", "What components does X have?"
 */
export const getRepositoryStructureTool = tool({
  description:
    "Get directory structure/file tree of a project. Extract repository name from user message (e.g., my-bot, nextbot, Profile-Next, CRUD-PHP, empat, h-1). Use when user asks about project structure, file organization, or architecture.",
  inputSchema: z.object({
    repositoryName: z
      .string()
      .min(1, "Repository name is required")
      .describe("The repository name (e.g. my-bot, nextbot, Profile-Next, CRUD-PHP, empat, h-1)."),
    path: z
      .string()
      .optional()
      .describe("Optional path within repository (e.g., 'src', 'components', 'app/api')"),
  }),
  execute: async (params: { repositoryName: string; path?: string }) => {
    try {
      console.log("[TOOL] getRepositoryStructure called for:", params.repositoryName);
      const structure = await github.getRepositoryStructure(
        params.repositoryName,
        params.path,
        2
      );

      if (!structure) {
        console.log("[TOOL] No structure found for:", params.repositoryName);
        return `Could not retrieve structure for "${params.repositoryName}"${params.path ? ` at path "${params.path}"` : ""}`;
      }

      console.log("[TOOL] getRepositoryStructure success");
      return `Directory structure${params.path ? ` (${params.path})` : ""}:\n\n${structure}`;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[TOOL] getRepositoryStructure error:", errorMsg);
      return `Error fetching structure: ${errorMsg}`;
    }
  },
});

/**
 * Tool: Get specific file content
 * Used for: "Show me file X", "What is in route.ts?", "How is authentication implemented?"
 */
export const getFileTool = tool({
  description:
    "Get content of a specific file from a project repository. Extract repository name (e.g., my-bot, Profile-Next) and file path. Use when user asks to see specific code or file content.",
  inputSchema: z.object({
    repositoryName: z
      .string()
      .min(1, "Repository name is required")
      .describe("The repository name (e.g. my-bot, nextbot, Profile-Next, CRUD-PHP, empat, h-1)."),
    filePath: z
      .string()
      .min(1, "File path is required")
      .describe("Path to file in repository (e.g., 'package.json', 'app/api/chat/route.ts')"),
  }),
  execute: async (params: { repositoryName: string; filePath: string }) => {
    // Security filter: Prevent AI from exposing environment files, auth secrets, or private keys
    const lowerPath = params.filePath.toLowerCase();
    const BLOCKED_PATTERNS = [
      '.env',
      '.key',
      '.pem',
      'id_rsa',
      'adminsession',
      'admin/auth',
      'data/portfolio-data.json',
      'credentials',
      'secret',
    ];

    if (BLOCKED_PATTERNS.some((pattern) => lowerPath.includes(pattern))) {
      console.warn("[SECURITY] AI blocked attempt to read sensitive file:", params.filePath);
      return `Akses ke file "${params.filePath}" dibatasi demi alasan privasi dan keamanan.`;
    }

    try {
      console.log("[TOOL] getFile called for:", params.filePath, "in", params.repositoryName);
      const result = await github.getFile(params.repositoryName, params.filePath);

      if (result.truncated) {
        console.log("[TOOL] File too large:", params.filePath);
        return `File "${params.filePath}" is too large (${Math.round(result.size / 1024)}KB). Max allowed: 100KB`;
      }

      if (!result.content) {
        console.log("[TOOL] No content for:", params.filePath);
        return `No content found for file "${params.filePath}"`;
      }

      console.log("[TOOL] getFile success, length:", result.content.length);
      return `File: ${params.filePath}\n\n${result.content}`;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[TOOL] getFile error:", errorMsg);
      return `Error fetching file "${params.filePath}": ${errorMsg}`;
    }
  },
});

/**
 * Tool: Search repository for files/code
 * Used for: "Where is the chatbot code?", "Find the API implementation", "Where is X located?"
 */
export const searchRepositoryTool = tool({
  description:
    "Search for files in a project repository. Extract repository name and query. Use when user asks to find a specific file or where something is implemented.",
  inputSchema: z.object({
    repositoryName: z
      .string()
      .min(1, "Repository name is required")
      .describe("The repository name (e.g. my-bot, nextbot, Profile-Next, CRUD-PHP, empat, h-1)."),
    query: z
      .string()
      .min(1, "Search query is required")
      .describe("Search query: filename, path, or keyword. Examples: 'api', 'route.ts', 'chat'"),
  }),
  execute: async (params: { repositoryName: string; query: string }) => {
    try {
      console.log("[TOOL] searchRepository called:", params.query, "in", params.repositoryName);
      const results = await github.searchRepository(params.repositoryName, params.query);

      if (results.length === 0) {
        console.log("[TOOL] No search results for:", params.query);
        return `No results found for "${params.query}" in repository "${params.repositoryName}"`;
      }

      const formatted = results.map((item) => `- ${item.path} (${item.type})`).join("\n");
      console.log("[TOOL] searchRepository found:", results.length, "results");
      return `Search results for "${params.query}" in "${params.repositoryName}":\n\n${formatted}`;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[TOOL] searchRepository error:", errorMsg);
      return `Error searching repository: ${errorMsg}`;
    }
  },
});

/**
 * Tool: List user repositories
 * Used for: "What projects do you have?", "Show me all repositories"
 */
export const listRepositoriesTool = tool({
  description:
    "List all projects/repositories for a GitHub user. Use when user asks what projects are available or wants to see all repos. For this AI, default username is 'MilQ28'.",
  inputSchema: z.object({
    username: z
      .string()
      .optional()
      .default("MilQ28")
      .describe("GitHub username (default: MilQ28)"),
    limit: z
      .number()
      .optional()
      .default(12)
      .describe("Max number of repositories to return (optional)"),
  }),
  execute: async (params: { username?: string; limit?: number }) => {
    try {
      const username = params.username ?? "MilQ28";
      console.log("[TOOL] listRepositories called with username:", username);
      const repos = await github.getUserRepositories(
        username,
        params.limit ?? 12
      );

      if (repos.length === 0) {
        console.log("[TOOL] No repositories found");
        return `No repositories found for user "${username}"`;
      }

      const formatted = repos
        .map((repo) => `- ${repo.name}: ${repo.description || "No description"} (${repo.language || "Unknown"})`)
        .join("\n");

      console.log("[TOOL] listRepositories found:", repos.length, "repos");
      return `Repositories for @${username}:\n\n${formatted}`;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[TOOL] listRepositories error:", errorMsg);
      return `Error fetching repositories: ${errorMsg}`;
    }
  },
});

/**
 * All chat tools
 * Export as object for use in chat API
 */
export const chatTools = {
  getRepository: getRepositoryTool,
  getReadme: getReadmeTool,
  getRepositoryStructure: getRepositoryStructureTool,
  getFile: getFileTool,
  searchRepository: searchRepositoryTool,
  listRepositories: listRepositoriesTool,
};


