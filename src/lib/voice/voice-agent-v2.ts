/**
 * VOICE AGENT V2 - Fixed & Integrated
 * Native browser speech with AI-powered responses
 */

import { generateAIResponse } from '@/lib/ai/integrated-engine';

type SpeechRecognition = any;

interface VoiceAgentConfig {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export class VoiceAgentV2 {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private messages: VoiceMessage[] = [];
  private messageId = 0;

  constructor(private config: VoiceAgentConfig = {}) {
    this.config = {
      lang: 'en-US',
      continuous: true,
      interimResults: true,
      ...config,
    };
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn('Speech Recognition not available');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.lang = this.config.lang || 'en-US';
    this.recognition.continuous = this.config.continuous ?? true;
    this.recognition.interimResults = this.config.interimResults ?? true;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        this.handleUserInput(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  private initializeSpeechSynthesis(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  public startListening(): void {
    if (!this.recognition) {
      console.error('Speech Recognition not available');
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      console.error('Error starting speech recognition:', e);
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public async speak(text: string): Promise<void> {
    if (!this.synthesis) {
      console.error('Speech Synthesis not available');
      return;
    }

    return new Promise((resolve) => {
      this.synthesis!.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.lang || 'en-US';
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      this.synthesis!.speak(utterance);
    });
  }

  private async handleUserInput(text: string): Promise<void> {
    const userMessage: VoiceMessage = {
      id: `msg-${++this.messageId}`,
      type: 'user',
      text,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);

    try {
      const response = await generateAIResponse({
        userQuery: text,
        systemContext: 'troubleshooting',
        temperature: 0.6,
      });

      const assistantMessage: VoiceMessage = {
        id: `msg-${++this.messageId}`,
        type: 'assistant',
        text: response.content,
        timestamp: new Date(),
      };
      this.messages.push(assistantMessage);

      await this.speak(response.content);
    } catch (error) {
      console.error('Error handling voice input:', error);
      const errorMessage = 'I encountered an error processing your request.';
      await this.speak(errorMessage);
    }
  }

  public getMessages(): VoiceMessage[] {
    return this.messages;
  }

  public clearMessages(): void {
    this.messages = [];
    this.messageId = 0;
  }

  public isActive(): boolean {
    return this.isListening;
  }

  public destroy(): void {
    this.stopListening();
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

let agentInstance: VoiceAgentV2 | null = null;

export function getVoiceAgent(config?: VoiceAgentConfig): VoiceAgentV2 {
  if (!agentInstance) {
    agentInstance = new VoiceAgentV2(config);
  }
  return agentInstance;
}

export function destroyVoiceAgent(): void {
  if (agentInstance) {
    agentInstance.destroy();
    agentInstance = null;
  }
}
