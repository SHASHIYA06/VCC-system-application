/**
 * Browser-based Voice Client for VCC System
 * Uses Web Speech API for cross-platform support
 * Replaces mock VibeVoice implementation with real browser APIs
 */

// Voice Recognition Types
export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface VoiceCommand {
  command: string;
  action: 'navigate' | 'search' | 'query' | 'unknown';
  parameters: Record<string, any>;
  confidence: number;
}

export interface VoiceSynthesisOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

/**
 * Browser Voice Client using Web Speech API
 */
export class BrowserVoiceClient {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((result: VoiceRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  /**
   * Check if voice features are supported
   */
  isSupported(): {
    recognition: boolean;
    synthesis: boolean;
  } {
    return {
      recognition: this.recognition !== null,
      synthesis: this.synthesis !== null
    };
  }

  /**
   * Setup speech recognition
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      const result: VoiceRecognitionResult = {
        transcript: lastResult[0].transcript,
        confidence: lastResult[0].confidence,
        isFinal: lastResult.isFinal,
        alternatives: Array.from(lastResult).map((alt: any) => ({
          transcript: alt.transcript,
          confidence: alt.confidence
        }))
      };

      if (this.onResultCallback) {
        this.onResultCallback(result);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(`Recognition error: ${event.error}`));
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  /**
   * Start listening for voice input
   */
  startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError?: (error: Error) => void
  ): void {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to start recognition'));
      }
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Text-to-Speech
   */
  speak(text: string, options: VoiceSynthesisOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = options.lang || 'en-US';

      if (options.voice) {
        utterance.voice = options.voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Process voice command for VCC navigation
   */
  processVoiceCommand(transcript: string): VoiceCommand {
    const lower = transcript.toLowerCase().trim();
    let action: 'navigate' | 'search' | 'query' | 'unknown' = 'unknown';
    let parameters: Record<string, any> = {};
    let confidence = 0.8;

    // Navigation commands
    if (lower.includes('dashboard') || lower.includes('home')) {
      action = 'navigate';
      parameters.route = '/dashboard';
      confidence = 0.95;
    } else if (lower.includes('drawing') || lower.includes('drawings')) {
      action = 'navigate';
      parameters.route = '/drawings';
      confidence = 0.95;
    } else if (lower.includes('wire') && !lower.includes('search')) {
      action = 'navigate';
      parameters.route = '/wires';
      confidence = 0.9;
    } else if (lower.includes('system')) {
      action = 'navigate';
      parameters.route = '/systems';
      confidence = 0.9;
    } else if (lower.includes('equipment')) {
      action = 'navigate';
      parameters.route = '/equipment';
      confidence = 0.9;
    } else if (lower.includes('troubleshoot')) {
      action = 'navigate';
      parameters.route = '/troubleshooting';
      confidence = 0.9;
    } else if (lower.includes('gsd')) {
      action = 'navigate';
      parameters.route = '/gsd';
      confidence = 0.9;
    } else if (lower.includes('intelligence') || lower.includes('ai assistant')) {
      action = 'navigate';
      parameters.route = '/ai-assistant';
      confidence = 0.9;
    }
    
    // Search commands
    else if (lower.includes('search') || lower.includes('find') || lower.includes('show me')) {
      action = 'search';
      // Extract search query
      const searchMatch = lower.match(/(?:search for|find|show me|search)\s+(.+)/);
      parameters.query = searchMatch?.[1]?.trim() || '';
      confidence = 0.85;
    }
    
    // Query commands (for AI assistant)
    else if (lower.includes('what is') || lower.includes('tell me about') || lower.includes('explain')) {
      action = 'query';
      parameters.query = transcript;
      confidence = 0.8;
    }

    return {
      command: transcript,
      action,
      parameters,
      confidence
    };
  }

  /**
   * Get command suggestions based on partial input
   */
  getCommandSuggestions(partial: string): string[] {
    const suggestions = [
      'Go to dashboard',
      'Show drawings',
      'Open wires',
      'Navigate to systems',
      'Show equipment',
      'Open troubleshooting',
      'Show GSD',
      'Open AI assistant',
      'Search for wire 3003',
      'Find drawing 942-58120',
      'What is the TRAC system',
      'Tell me about brake system',
      'Explain connector APS CN1'
    ];

    const lower = partial.toLowerCase();
    return suggestions.filter(s => 
      s.toLowerCase().includes(lower)
    ).slice(0, 5);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopListening();
    this.stopSpeaking();
    this.onResultCallback = null;
    this.onErrorCallback = null;
  }
}

// Singleton instance
let browserVoiceClientInstance: BrowserVoiceClient | null = null;

export function getBrowserVoiceClient(): BrowserVoiceClient {
  if (!browserVoiceClientInstance) {
    browserVoiceClientInstance = new BrowserVoiceClient();
  }
  return browserVoiceClientInstance;
}

// Voice command navigation helper
export function parseVoiceNavigationCommand(transcript: string): {
  route?: string;
  action?: string;
  parameters?: Record<string, any>;
} {
  const client = getBrowserVoiceClient();
  const command = client.processVoiceCommand(transcript);
  
  return {
    route: command.parameters.route,
    action: command.action,
    parameters: command.parameters
  };
}

// Export for backward compatibility
export const browserVoiceClient = getBrowserVoiceClient();
