/**
 * TinyFish API Integration Service
 * Provides web search and content extraction capabilities for VCC System
 * Integrates PDF extraction and AI-powered documentation search
 */

export interface TinyFishSearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  domain: string;
  publishedDate?: string;
}

export interface TinyFishSearchResponse {
  results: TinyFishSearchResult[];
  query: string;
  total: number;
  executionTime: number;
}

export interface TinyFishFetchResult {
  url: string;
  title: string;
  content: string;
  extractedText: string;
  metadata: {
    author?: string;
    publishedDate?: string;
    description?: string;
    keywords?: string[];
  };
}

class TinyFishService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.search.tinyfish.ai';
  private readonly fetchUrl = 'https://api.fetch.tinyfish.ai';

  constructor() {
    this.apiKey = process.env.TINYFISH_API_KEY || 'sk-tinyfish-JAI-1Lk0ZP-FkvhUYsWUaZD4AhpAxlbG';
  }

  /**
   * Search the web using TinyFish search API
   */
  async search(
    query: string, 
    options: {
      location?: string;
      language?: string;
      limit?: number;
      freshness?: string;
    } = {}
  ): Promise<TinyFishSearchResponse> {
    const startTime = Date.now();
    
    try {
      const searchParams = new URLSearchParams({
        query: query.trim(),
        location: options.location || 'US',
        language: options.language || 'en',
        limit: (options.limit || 10).toString(),
        ...(options.freshness && { freshness: options.freshness })
      });

      console.log(`🔍 TinyFish Search: "${query}"`);

      const response = await fetch(`${this.baseUrl}?${searchParams}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'VCC-System/1.0'
        },
      });

      if (!response.ok) {
        throw new Error(`TinyFish search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      console.log(`✅ TinyFish search completed: ${data.results?.length || 0} results in ${executionTime}ms`);

      return {
        results: data.results || [],
        query,
        total: data.total || data.results?.length || 0,
        executionTime
      };

    } catch (error) {
      console.error('❌ TinyFish search error:', error);
      throw new Error(`TinyFish search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch and extract content from a URL using TinyFish fetch API
   */
  async fetch(url: string): Promise<TinyFishFetchResult> {
    try {
      console.log(`📥 TinyFish Fetch: ${url}`);

      const response = await fetch(`${this.fetchUrl}`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'VCC-System/1.0'
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`TinyFish fetch failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`✅ TinyFish fetch completed: ${url}`);

      return {
        url,
        title: data.title || 'Untitled',
        content: data.content || '',
        extractedText: data.text || data.content || '',
        metadata: {
          author: data.author,
          publishedDate: data.publishedDate,
          description: data.description,
          keywords: data.keywords || []
        }
      };

    } catch (error) {
      console.error('❌ TinyFish fetch error:', error);
      throw new Error(`TinyFish fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhanced search for VCC-specific technical documentation
   */
  async searchTechnical(
    query: string,
    domain?: 'railway' | 'electrical' | 'automation' | 'documentation'
  ): Promise<TinyFishSearchResponse> {
    const enhancedQuery = this.enhanceQueryForTechnical(query, domain);
    
    return await this.search(enhancedQuery, {
      location: 'US',
      language: 'en',
      limit: 15,
      freshness: 'month' // Prefer recent technical documentation
    });
  }

  /**
   * Search for VCC system manuals and documentation
   */
  async searchVCCDocumentation(query: string): Promise<TinyFishSearchResponse> {
    const vccQuery = `VCC system railway control "${query}" manual documentation technical specification`;
    
    return await this.search(vccQuery, {
      location: 'US',
      language: 'en',
      limit: 10
    });
  }

  /**
   * Enhanced query building for technical searches
   */
  private enhanceQueryForTechnical(query: string, domain?: 'railway' | 'electrical' | 'automation' | 'documentation'): string {
    const domainKeywords: Record<string, string> = {
      railway: 'railway train control system electrical traction brake door',
      electrical: 'electrical circuit wire connector pin signal voltage current',
      automation: 'automation control system PLC TCMS GSD protocol',
      documentation: 'manual specification documentation datasheet technical guide'
    };

    const baseQuery = query.trim();
    const domainTerms = domain ? domainKeywords[domain] : '';
    
    return `${baseQuery} ${domainTerms}`.trim();
  }

  /**
   * Bulk fetch multiple URLs in parallel
   */
  async fetchMultiple(urls: string[]): Promise<TinyFishFetchResult[]> {
    console.log(`📥 TinyFish Bulk Fetch: ${urls.length} URLs`);
    
    const promises = urls.map(url => 
      this.fetch(url).catch(error => {
        console.warn(`⚠️ Failed to fetch ${url}:`, error.message);
        return null;
      })
    );

    const results = await Promise.all(promises);
    const successful = results.filter(result => result !== null) as TinyFishFetchResult[];
    
    console.log(`✅ TinyFish Bulk Fetch completed: ${successful.length}/${urls.length} successful`);
    
    return successful;
  }

  /**
   * Search and fetch - get search results then fetch full content for top results
   */
  async searchAndFetch(
    query: string, 
    fetchTopResults = 3
  ): Promise<{
    searchResults: TinyFishSearchResponse;
    fetchedContent: TinyFishFetchResult[];
  }> {
    // First get search results
    const searchResults = await this.search(query, { limit: Math.max(fetchTopResults, 10) });
    
    // Then fetch content for top results
    const topUrls = searchResults.results
      .slice(0, fetchTopResults)
      .map(result => result.url);
      
    const fetchedContent = await this.fetchMultiple(topUrls);
    
    return {
      searchResults,
      fetchedContent
    };
  }

  /**
   * Health check for TinyFish API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.search('test query', { limit: 1 });
      return result.results !== undefined;
    } catch (error) {
      console.error('❌ TinyFish health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const tinyFishService = new TinyFishService();

// Export class for custom instances
export { TinyFishService };

// Helper functions for integration with VCC system
export const VCCTinyFishHelpers = {
  /**
   * Search for railway system documentation
   */
  async searchRailwayDocs(systemCode: string, query: string): Promise<TinyFishSearchResponse> {
    const enhancedQuery = `railway ${systemCode} system ${query} manual documentation specification`;
    return await tinyFishService.searchTechnical(enhancedQuery, 'railway');
  },

  /**
   * Find electrical component datasheets
   */
  async findComponentDatasheet(componentName: string): Promise<TinyFishSearchResponse> {
    const query = `${componentName} datasheet specification electrical component railway`;
    return await tinyFishService.searchTechnical(query, 'electrical');
  },

  /**
   * Search for troubleshooting guides
   */
  async searchTroubleshooting(faultCode: string, description: string): Promise<TinyFishSearchResponse> {
    const query = `fault code ${faultCode} ${description} troubleshooting guide railway system`;
    return await tinyFishService.searchTechnical(query, 'documentation');
  },

  /**
   * Find wire/connector specifications
   */
  async findWireSpecification(wireNo: string, connectorCode?: string): Promise<TinyFishSearchResponse> {
    const query = connectorCode 
      ? `wire ${wireNo} connector ${connectorCode} specification railway`
      : `wire ${wireNo} specification railway electrical`;
    return await tinyFishService.searchTechnical(query, 'electrical');
  },

  /**
   * Extract drawing-related information
   */
  async searchDrawingInfo(drawingNo: string): Promise<TinyFishSearchResponse> {
    const query = `drawing ${drawingNo} schematic blueprint railway technical`;
    return await tinyFishService.searchTechnical(query, 'documentation');
  }
};
