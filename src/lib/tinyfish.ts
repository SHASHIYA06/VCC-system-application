const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || 'sk-tinyfish-JAI-1Lk0ZP-FkvhUYsWUaZD4AhpAxlbG';
const TINYFISH_BASE_URL = 'https://api.search.tinyfish.ai';

export interface TinyFishSearchResult {
  title: string;
  url: string;
  snippet?: string;
  position?: number;
  site_name?: string;
  published_date?: string;
}

export interface TinyFishSearchResponse {
  results: TinyFishSearchResult[];
  total_results: number;
  query: string;
  page?: number;
}

export interface TinyFishFetchResponse {
  content: string;
  title: string;
  url: string;
}

export class TinyFishClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || TINYFISH_API_KEY;
    this.baseUrl = TINYFISH_BASE_URL;
  }

  async search(query: string, options?: {
    location?: string;
    language?: string;
    numResults?: number;
  }): Promise<TinyFishSearchResponse> {
    const params = new URLSearchParams({
      query,
      ...(options?.location && { location: options.location }),
      ...(options?.language && { language: options.language }),
      ...(options?.numResults && { num_results: options.numResults.toString() }),
    });

    // Guard with a timeout so a slow upstream never hangs a request.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`TinyFish search failed (${response.status}): ${error}`);
      }

      return response.json();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('TinyFish search timed out after 20s');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async fetch(url: string): Promise<TinyFishFetchResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${this.baseUrl}/fetch`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`TinyFish fetch failed (${response.status}): ${error}`);
      }

      return response.json();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('TinyFish fetch timed out after 30s');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const tinyfishClient = new TinyFishClient();

export async function searchWeb(query: string, location = 'US', language = 'en', numResults = 10): Promise<TinyFishSearchResponse> {
  return tinyfishClient.search(query, { location, language, numResults });
}

export async function fetchWebPage(url: string): Promise<TinyFishFetchResponse> {
  return tinyfishClient.fetch(url);
}