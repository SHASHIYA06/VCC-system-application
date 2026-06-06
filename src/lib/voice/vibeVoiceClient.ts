/**
 * VibeVoice Integration Client
 * Comprehensive voice AI system for VCC application
 * Supports ASR, TTS, and Real-time voice processing
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// VibeVoice Configuration
interface VibeVoiceConfig {
  asrModel: string;
  ttsModel: string;
  realtimeModel: string;
  maxAudioDuration: number;
  languages: string[];
  outputFormat: 'wav' | 'mp3';
}

const VIBEVOICE_CONFIG: VibeVoiceConfig = {
  asrModel: 'VibeVoice-ASR-7B',
  ttsModel: 'VibeVoice-TTS-1.5B',
  realtimeModel: 'VibeVoice-Realtime-0.5B',
  maxAudioDuration: 3600, // 60 minutes
  languages: ['en', 'de', 'fr', 'it', 'jp', 'kr', 'nl', 'pl', 'pt', 'es'],
  outputFormat: 'wav'
};

// Voice Agent Response Types
export interface VoiceASRResult {
  transcription: string;
  speakers: Array<{
    id: string;
    name?: string;
    segments: Array<{
      start: number;
      end: number;
      text: string;
      confidence: number;
    }>;
  }>;
  hotwords: string[];
  confidence: number;
  processingTime: number;
  language: string;
}

export interface VoiceTTSResult {
  audioFile: string;
  audioData: Buffer;
  speakers: number;
  duration: number;
  processingTime: number;
  format: string;
}

export interface VoiceRealtimeSession {
  sessionId: string;
  isActive: boolean;
  inputStream: NodeJS.WritableStream | null;
  outputStream: NodeJS.ReadableStream | null;
}

// Main VibeVoice Client Class
export class VibeVoiceClient {
  private config: VibeVoiceConfig;
  private tempDir: string;
  private realtimeSessions: Map<string, VoiceRealtimeSession>;

  constructor(config?: Partial<VibeVoiceConfig>) {
    this.config = { ...VIBEVOICE_CONFIG, ...config };
    this.tempDir = '/tmp/vibevoice';
    this.realtimeSessions = new Map();
    this.ensureTempDirectory();
  }

  private async ensureTempDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * ASR - Speech-to-Text with Speaker Diarization
   * Processes up to 60-minute audio files with speaker identification
   */
  async speechToText(
    audioFile: string,
    hotwords: string[] = [],
    language: string = 'en'
  ): Promise<VoiceASRResult> {
    const startTime = Date.now();

    try {
      // Validate input file
      const stats = await fs.stat(audioFile);
      if (!stats.isFile()) {
        throw new Error('Audio file does not exist');
      }

      // Prepare VibeVoice ASR command
      const outputFile = path.join(this.tempDir, `asr_output_${Date.now()}.json`);
      const hotwordStr = hotwords.length > 0 ? `--hotwords "${hotwords.join(',')}"` : '';
      
      const command = `python3 -c "
from transformers import pipeline
import json
import sys

# Load VibeVoice ASR model
pipe = pipeline('automatic-speech-recognition', model='microsoft/VibeVoice-ASR-7B')

# Process audio file
result = pipe('${audioFile}', return_timestamps=True, return_speaker_labels=True)

# Format output
output = {
  'transcription': result['text'],
  'speakers': result.get('speaker_labels', []),
  'segments': result.get('segments', []),
  'language': '${language}',
  'hotwords_detected': [word for word in '${hotwords.join(',')}' if word.lower() in result['text'].lower()]
}

# Save results
with open('${outputFile}', 'w') as f:
  json.dump(output, f, indent=2)

print('ASR processing complete')
"`;

      // Execute VibeVoice ASR
      await execAsync(command);

      // Read results
      const resultData = await fs.readFile(outputFile, 'utf-8');
      const rawResult = JSON.parse(resultData);

      // Process and format response
      const result: VoiceASRResult = {
        transcription: rawResult.transcription || '',
        speakers: this.formatSpeakers(rawResult.speakers || [], rawResult.segments || []),
        hotwords: rawResult.hotwords_detected || [],
        confidence: this.calculateConfidence(rawResult.segments || []),
        processingTime: Date.now() - startTime,
        language: rawResult.language || language
      };

      // Cleanup
      await fs.unlink(outputFile).catch(() => {});

      return result;
    } catch (error) {
      console.error('VibeVoice ASR Error:', error);
      throw new Error(`ASR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * TTS - Text-to-Speech with Multi-Speaker Support
   * Generates up to 90-minute audio with multiple speakers
   */
  async textToSpeech(
    text: string,
    speakers: string[] = ['default'],
    outputPath?: string
  ): Promise<VoiceTTSResult> {
    const startTime = Date.now();

    try {
      const outputFile = outputPath || path.join(this.tempDir, `tts_output_${Date.now()}.${this.config.outputFormat}`);
      
      // Prepare VibeVoice TTS command
      const speakerStr = speakers.length > 1 ? `--multi_speaker "${speakers.join(',')}"` : '';
      
      const command = `python3 -c "
from transformers import pipeline
import torchaudio
import json

# Load VibeVoice TTS model
tts_pipe = pipeline('text-to-speech', model='microsoft/VibeVoice-TTS-1.5B')

# Generate speech
audio_data = tts_pipe('${text.replace(/'/g, "\\'")}', speaker='${speakers[0] || 'default'}')

# Save audio file
torchaudio.save('${outputFile}', audio_data['audio'], audio_data['sampling_rate'])

# Output metadata
metadata = {
  'duration': len(audio_data['audio']) / audio_data['sampling_rate'],
  'speakers': ${speakers.length},
  'format': '${this.config.outputFormat}',
  'sampling_rate': audio_data['sampling_rate']
}

print(json.dumps(metadata))
"`;

      // Execute VibeVoice TTS
      const { stdout } = await execAsync(command);
      const metadata = JSON.parse(stdout.trim());

      // Read generated audio
      const audioData = await fs.readFile(outputFile);

      return {
        audioFile: outputFile,
        audioData,
        speakers: speakers.length,
        duration: metadata.duration,
        processingTime: Date.now() - startTime,
        format: this.config.outputFormat
      };
    } catch (error) {
      console.error('VibeVoice TTS Error:', error);
      throw new Error(`TTS processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Real-time Voice Processing
   * Streaming text input and speech generation
   */
  async startRealtimeSession(
    sessionId: string,
    language: string = 'en'
  ): Promise<VoiceRealtimeSession> {
    try {
      if (this.realtimeSessions.has(sessionId)) {
        throw new Error('Session already exists');
      }

      // Initialize VibeVoice Realtime model
      const command = `python3 -c "
import asyncio
from transformers import pipeline
import sys
import json

# Load VibeVoice Realtime model
realtime_pipe = pipeline('text-to-speech', model='microsoft/VibeVoice-Realtime-0.5B')

print('REALTIME_SESSION_READY')
sys.stdout.flush()

# Keep session alive
while True:
  try:
    line = input()
    if line == 'STOP_SESSION':
      break
    
    # Process real-time text input
    audio_data = realtime_pipe(line)
    print(f'AUDIO_GENERATED:{len(audio_data)}')
    sys.stdout.flush()
  except EOFError:
    break
"`;

      // Start subprocess for real-time processing
      const subprocess = exec(command);
      
      const session: VoiceRealtimeSession = {
        sessionId,
        isActive: true,
        inputStream: subprocess.stdin,
        outputStream: subprocess.stdout
      };

      this.realtimeSessions.set(sessionId, session);

      return session;
    } catch (error) {
      console.error('VibeVoice Realtime Error:', error);
      throw new Error(`Realtime session failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop Real-time Session
   */
  async stopRealtimeSession(sessionId: string): Promise<void> {
    const session = this.realtimeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      if (session.inputStream) {
        session.inputStream.write('STOP_SESSION\n');
        session.inputStream.end();
      }
      
      session.isActive = false;
      this.realtimeSessions.delete(sessionId);
    } catch (error) {
      console.error('Error stopping realtime session:', error);
    }
  }

  /**
   * Process Voice Command for VCC Dashboard Navigation
   */
  async processVoiceCommand(audioFile: string): Promise<{
    command: string;
    action: 'navigate' | 'search' | 'query' | 'unknown';
    parameters: Record<string, any>;
    confidence: number;
  }> {
    try {
      // Use ASR to transcribe voice command
      const asrResult = await this.speechToText(audioFile, [
        'dashboard', 'drawings', 'wires', 'systems', 'equipment', 
        'search', 'find', 'show', 'open', 'navigate'
      ]);

      const transcript = asrResult.transcription.toLowerCase();

      // Voice command parsing logic
      let action: 'navigate' | 'search' | 'query' | 'unknown' = 'unknown';
      let parameters: Record<string, any> = {};

      // Navigation commands
      if (transcript.includes('dashboard') || transcript.includes('home')) {
        action = 'navigate';
        parameters.route = '/dashboard';
      } else if (transcript.includes('drawings') || transcript.includes('schematic')) {
        action = 'navigate';
        parameters.route = '/drawings';
      } else if (transcript.includes('wires') || transcript.includes('cables')) {
        action = 'navigate';
        parameters.route = '/wires';
      } else if (transcript.includes('systems') || transcript.includes('subsystem')) {
        action = 'navigate';
        parameters.route = '/systems';
      } else if (transcript.includes('equipment') || transcript.includes('devices')) {
        action = 'navigate';
        parameters.route = '/equipment';
      }
      
      // Search commands
      else if (transcript.includes('search') || transcript.includes('find')) {
        action = 'search';
        // Extract search terms
        const searchMatch = transcript.match(/(?:search|find)\s+(?:for\s+)?(.+)/);
        parameters.query = searchMatch?.[1]?.trim() || '';
      }
      
      // AI Query commands
      else if (transcript.includes('what is') || transcript.includes('tell me') || transcript.includes('explain')) {
        action = 'query';
        parameters.query = transcript;
      }

      return {
        command: transcript,
        action,
        parameters,
        confidence: asrResult.confidence
      };
    } catch (error) {
      console.error('Voice command processing error:', error);
      throw new Error(`Voice command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Integration with VCC Multi-Agent RAG System
   */
  async voiceRAGQuery(audioFile: string): Promise<{
    voiceInput: VoiceASRResult;
    aiResponse: any;
    voiceOutput: VoiceTTSResult;
  }> {
    try {
      // 1. Convert voice to text
      const voiceInput = await this.speechToText(audioFile, [
        'wire', 'connector', 'drawing', 'system', 'equipment', 'pin'
      ]);

      // 2. Process with Multi-Agent RAG system
      const { executeMultiAgentQuery } = await import('../ai/multi-agent-rag');
      const aiResponse = await executeMultiAgentQuery(voiceInput.transcription);

      // 3. Convert response back to speech
      const voiceOutput = await this.textToSpeech(
        aiResponse.unifiedResponse,
        ['default']
      );

      return {
        voiceInput,
        aiResponse,
        voiceOutput
      };
    } catch (error) {
      console.error('Voice RAG query error:', error);
      throw new Error(`Voice RAG failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper Methods
  private formatSpeakers(speakers: any[], segments: any[]): VoiceASRResult['speakers'] {
    const speakerMap = new Map<string, any>();
    
    segments.forEach((segment: any) => {
      const speakerId = segment.speaker || 'unknown';
      if (!speakerMap.has(speakerId)) {
        speakerMap.set(speakerId, {
          id: speakerId,
          segments: []
        });
      }
      
      speakerMap.get(speakerId)?.segments.push({
        start: segment.start || 0,
        end: segment.end || 0,
        text: segment.text || '',
        confidence: segment.confidence || 0.5
      });
    });

    return Array.from(speakerMap.values());
  }

  private calculateConfidence(segments: any[]): number {
    if (segments.length === 0) return 0.5;
    
    const totalConfidence = segments.reduce((sum, seg) => sum + (seg.confidence || 0.5), 0);
    return totalConfidence / segments.length;
  }

  /**
   * Cleanup temporary files
   */
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.tempDir, file)).catch(() => {}))
      );
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

// Default instance
export const vibeVoiceClient = new VibeVoiceClient();

// Voice Command Navigation Helper
export function parseVoiceNavigationCommand(transcript: string): {
  route?: string;
  action?: string;
  parameters?: Record<string, any>;
} {
  const lower = transcript.toLowerCase();
  
  // Dashboard navigation
  if (lower.includes('go to dashboard') || lower.includes('show dashboard')) {
    return { route: '/dashboard', action: 'navigate' };
  }
  
  if (lower.includes('show drawings') || lower.includes('go to drawings')) {
    return { route: '/drawings', action: 'navigate' };
  }
  
  if (lower.includes('show wires') || lower.includes('wire search')) {
    return { route: '/wires', action: 'navigate' };
  }
  
  if (lower.includes('show systems') || lower.includes('system overview')) {
    return { route: '/systems', action: 'navigate' };
  }
  
  // Search commands
  if (lower.includes('search for') || lower.includes('find')) {
    const searchTerm = lower.replace(/(search for|find|show me)/, '').trim();
    return { 
      route: '/search', 
      action: 'search', 
      parameters: { query: searchTerm } 
    };
  }
  
  return {};
}