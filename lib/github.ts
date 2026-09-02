/**
 * GitHub API Client
 * Server-side only utilities for fetching GitHub repository information.
 * All API calls are made server-side to protect any potential tokens.
 */

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_USERNAME = "MilQ28";

interface GitHubApiOptions {
  headers?: Record<string, string>;
}

/**
 * Make authenticated GitHub API requests
 * Uses GITHUB_TOKEN env var if available for higher rate limits
 */
async function githubFetch(
  endpoint: string,
  options: GitHubApiOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Syamil-Portfolio-Bot",
    ...options.headers,
  };

  // Only add auth header if token exists (optional for public repos)
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const url = `${GITHUB_API_BASE}${endpoint}`;
  console.log("[GITHUB_FETCH]", "GET", endpoint);
  
  const response = await fetch(url, { 
    headers,
    signal: AbortSignal.timeout(15000) // 15 second timeout
  });

  if (!response.ok) {
    console.error("[GITHUB_FETCH]", "Error", response.status, response.statusText);
    throw new GitHubError(
      `GitHub API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  console.log("[GITHUB_FETCH]", "Success", response.status);
  return response;
}

/**
 * Custom error class for GitHub API errors
 */
export class GitHubError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

/**
 * Get repository metadata (name, description, language, stars, forks, etc.)
 * @param repoName Repository name (e.g., "my-bot")
 */
export async function getRepository(repoName: string): Promise<{
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}> {
  try {
    const response = await githubFetch(`/repos/${GITHUB_USERNAME}/${repoName}`);
    const data = await response.json() as Record<string, unknown>;

    return {
      name: String(data.name ?? ""),
      description: (data.description as string | null) ?? null,
      url: String(data.html_url ?? ""),
      language: (data.language as string | null) ?? null,
      stars: Number(data.stargazers_count ?? 0),
      forks: Number(data.forks_count ?? 0),
      defaultBranch: String(data.default_branch ?? "main"),
      createdAt: String(data.created_at ?? ""),
      updatedAt: String(data.updated_at ?? ""),
    };
  } catch (error) {
    if (error instanceof GitHubError) {
      if (error.statusCode === 404) {
        throw new GitHubError(`Repository "${repoName}" not found`, 404);
      }
      throw error;
    }
    throw new GitHubError(`Failed to fetch repository: ${String(error)}`, 500);
  }
}

/**
 * Get repository README content
 * @param repoName Repository name
 */
export async function getReadme(repoName: string): Promise<string> {
  try {
    const response = await githubFetch(
      `/repos/${GITHUB_USERNAME}/${repoName}/readme`,
      {
        headers: { Accept: "application/vnd.github.v3.raw" },
      }
    );
    const content = await response.text();
    return content;
  } catch (error) {
    if (error instanceof GitHubError && error.statusCode === 404) {
      return ""; // No README found
    }
    throw error;
  }
}

/**
 * Get repository directory structure (file tree)
 * Returns simplified structure for better LLM context
 * @param repoName Repository name
 * @param path Optional path within repo (default: root)
 * @param depth Max depth to traverse (default: 2)
 */
export async function getRepositoryStructure(
  repoName: string,
  path: string = "",
  depth: number = 2
): Promise<string> {
  try {
    if (depth === 0) return "";

    const endpoint = path
      ? `/repos/${GITHUB_USERNAME}/${repoName}/contents/${path}`
      : `/repos/${GITHUB_USERNAME}/${repoName}/contents`;

    const response = await githubFetch(endpoint);
    const items = await response.json() as Array<Record<string, unknown>>;

    if (!Array.isArray(items)) {
      return "";
    }

    // Filter and format items
    const structure = items
      .filter((item) => {
        const name = String(item.name ?? "");
        // Skip common unimportant folders
        return !["node_modules", ".git", ".next", "dist", "build"].includes(
          name
        );
      })
      .map((item) => {
        const indent = "  ".repeat(2 - depth); // Simple indentation
        const type = item.type === "dir" ? "/" : "";
        return `${indent}${item.name}${type}`;
      });

    return structure.join("\n");
  } catch (error) {
    if (error instanceof GitHubError && error.statusCode === 404) {
      return ""; // Path not found
    }
    throw error;
  }
}

/**
 * Get specific file content from repository
 * @param repoName Repository name
 * @param filePath Path to file (e.g., "package.json" or "src/components/Button.tsx")
 * @param maxSize Maximum file size in bytes (default: 100KB for LLM context)
 */
export async function getFile(
  repoName: string,
  filePath: string,
  maxSize: number = 100000
): Promise<{
  content: string;
  size: number;
  truncated: boolean;
  message?: string;
}> {
  try {
    const response = await githubFetch(
      `/repos/${GITHUB_USERNAME}/${repoName}/contents/${filePath}`,
      {
        headers: { Accept: "application/vnd.github.v3.raw" },
      }
    );

    // Check content length before reading
    const contentLength = response.headers.get("content-length");
    const size = contentLength ? parseInt(contentLength, 10) : 0;

    if (size > maxSize) {
      return {
        content: "",
        size,
        truncated: true,
        message: `File is too large (${Math.round(size / 1000)}KB). Max allowed: ${Math.round(maxSize / 1000)}KB`,
      };
    }

    const content = await response.text();
    return {
      content,
      size: content.length,
      truncated: false,
    };
  } catch (error) {
    if (error instanceof GitHubError && error.statusCode === 404) {
      throw new GitHubError(`File "${filePath}" not found in repository`, 404);
    }
    throw error;
  }
}

/**
 * Search for files/content in repository
 * Uses Git Tree API for public repos without requiring authentication
 * @param repoName Repository name
 * @param query Search query (filename, path, or code keyword)
 */
export async function searchRepository(
  repoName: string,
  query: string
): Promise<
  Array<{
    name: string;
    path: string;
    type: "file" | "dir";
    url: string;
  }>
> {
  try {
    // Try Git trees recursive first (works on public repositories without auth)
    for (const branch of ["main", "master"]) {
      try {
        const response = await githubFetch(
          `/repos/${GITHUB_USERNAME}/${repoName}/git/trees/${branch}?recursive=1`
        );
        const data = (await response.json()) as {
          tree?: Array<{ path?: string; type?: string }>;
        };

        if (Array.isArray(data?.tree)) {
          const lowerQuery = query.toLowerCase();
          const matches = data.tree
            .filter((item) => {
              const p = (item.path ?? "").toLowerCase();
              return p.includes(lowerQuery) && !p.startsWith("node_modules") && !p.startsWith(".git");
            })
            .slice(0, 10);

          return matches.map((item) => ({
            name: (item.path ?? "").split("/").pop() || "",
            path: item.path || "",
            type: item.type === "tree" ? ("dir" as const) : ("file" as const),
            url: `https://github.com/${GITHUB_USERNAME}/${repoName}/blob/${branch}/${item.path}`,
          }));
        }
      } catch {
        // Try next branch
      }
    }

    return [];
  } catch (error) {
    console.warn("GitHub search failed:", error);
    return [];
  }
}

/**
 * Get list of repositories for a user
 * @param username GitHub username
 * @param limit Maximum number of repos to return
 */
export async function getUserRepositories(
  username: string = GITHUB_USERNAME,
  limit: number = 12
): Promise<
  Array<{
    name: string;
    description: string | null;
    url: string;
    language: string | null;
    stars: number;
    updatedAt: string;
  }>
> {
  try {
    const response = await githubFetch(
      `/users/${username}/repos?sort=updated&per_page=${Math.min(limit, 100)}`
    );
    const items = await response.json() as Array<Record<string, unknown>>;

    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      name: String(item.name ?? ""),
      description: (item.description as string | null) ?? null,
      url: String(item.html_url ?? ""),
      language: (item.language as string | null) ?? null,
      stars: Number(item.stargazers_count ?? 0),
      updatedAt: String(item.updated_at ?? ""),
    }));
  } catch (error) {
    throw new GitHubError(
      `Failed to fetch repositories for ${username}: ${String(error)}`,
      500
    );
  }
}

