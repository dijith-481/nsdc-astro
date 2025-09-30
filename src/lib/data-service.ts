// src/lib/data-service.ts
import type { MockData, TeamYear } from "../types";

// Helper function to fetch JSON from a public URL
async function fetchJsonFromUrl<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

const mockDataService = {
  getInitialData: async (): Promise<MockData> => {
    console.log("Fetching data from external URLs for build...");

    // Read the URLs from environment variables
    const urls = {
      hero: process.env.MOCK_HERO_URL,
      announcements: process.env.MOCK_ANNOUNCEMENTS_URL,
      about: process.env.MOCK_ABOUT_URL,
      events: process.env.MOCK_EVENTS_URL,
      projects: process.env.MOCK_PROJECTS_URL,
      resources: process.env.MOCK_RESOURCES_URL,
      teams: process.env.MOCK_TEAMS_URL,
      teamsPreview: process.env.MOCK_TEAM_PREVIEW_URL,
      links: process.env.MOCK_LINKS_URL,
    };

    // Check if all URLs are provided
    for (const [key, url] of Object.entries(urls)) {
      if (!url) {
        throw new Error(
          `Missing environment variable MOCK_${key.toUpperCase()}_URL`,
        );
      }
    }

    try {
      const [
        heroContent,
        announcements,
        about,
        events,
        projects,
        resources,
        teams,
        teamsPreview,
        links,
      ] = await Promise.all([
        fetchJsonFromUrl(urls.hero!),
        fetchJsonFromUrl(urls.announcements!),
        fetchJsonFromUrl(urls.about!),
        fetchJsonFromUrl(urls.events!),
        fetchJsonFromUrl(urls.projects!),
        fetchJsonFromUrl(urls.resources!),
        fetchJsonFromUrl(urls.teams!),
        fetchJsonFromUrl(urls.teamsPreview!),
        fetchJsonFromUrl(urls.links!),
      ]);

      // Your existing sorting logic
      (teams as TeamYear[]).sort((a, b) => parseInt(b.id) - parseInt(a.id));
      (teams as TeamYear[]).forEach((team) => {
        team.members.sort((a, b) => a.priority - b.priority);
      });

      return {
        heroContent,
        announcements,
        about,
        events,
        projects,
        resources,
        teams,
        teamsPreview,
        links: links || [],
      };
    } catch (error) {
      console.error("Failed to fetch mock data from external URLs:", error);
      throw new Error("Could not load mock data.");
    }
  },
};

export const dataService = mockDataService;
