const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const TINYFISH_BASE_URL = 'https://api.search.tinyfish.ai';

export interface TinyFishSearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface TinyFishSearchResponse {
  results: TinyFishSearchResult[];
  query: string;
}

export interface TinyFishFetchResponse {
  content: string;
  url: string;
  title?: string;
}

export class TinyFishClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || TINYFISH_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TinyFish API key not configured');
    }
  }

  async search(query: string, options?: {
    location?: string;
    language?: string;
    numResults?: number;
  }): Promise<TinyFishSearchResponse> {
    if (!this.apiKey) {
      throw new Error('TinyFish API key not configured');
    }

    const params = new URLSearchParams({
      query,
      ...(options?.location && { location: options.location }),
      ...(options?.language && { language: options.language }),
    });

    const response = await fetch(`${TINYFISH_BASE_URL}?${params}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`TinyFish search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      query,
    };
  }

  async fetch(url: string): Promise<TinyFishFetchResponse> {
    if (!this.apiKey) {
      throw new Error('TinyFish API key not configured');
    }

    const params = new URLSearchParams({ url });

    const response = await fetch(`${TINYFISH_BASE_URL}/fetch?${params}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`TinyFish fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content || '',
      url: data.url || url,
      title: data.title,
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const tinyfish = new TinyFishClient();

export async function searchWeb(query: string, options?: {
  location?: string;
  language?: string;
  numResults?: number;
}): Promise<TinyFishSearchResponse> {
  return tinyfish.search(query, options);
}

export async function fetchUrl(url: string): Promise<TinyFishFetchResponse> {
  return tinyfish.fetch(url);
}