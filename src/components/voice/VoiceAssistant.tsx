'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, Loader2, Play, Pause, 
  MessageSquare, ArrowRight, Bot, Sparkles, Zap, Activity 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Voice Assistant Types
interface VoiceCommand {
  transcript: string;
  action: 'navigate' | 'search' | 'query' | 'unknown';
  parameters: Record<string, any>;
  confidence: number;
}

interface VoiceResponse {
  audioFile: string;
  duration: number;
  speakers: number;
}

interface RAGResponse {
  query: string;
  unifiedResponse: string;
  executionTime: number;
  agents: Array<{
    agent: string;
    confidence: number;
  }>;
}

// Main Voice Assistant Component
export default function VoiceAssistant() {
  const router = useRouter();
  
  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Voice Data States
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [lastResponse, setLastResponse] = useState<RAGResponse | null>(null);
  const [voiceResponse, setVoiceResponse] = useState<VoiceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Component States
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Level Analysis for Visual Feedback
  const analyzeAudioLevel = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    microphone.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
    };
    
    analysisIntervalRef.current = setInterval(updateLevel, 100);
  }, []);

  // Start Voice Recording
  const startRecording = async () => {
    try {
      setError(null);
      
      // Check browser support first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support voice recording. Please use Chrome, Edge, or Safari.');
      }
      
      // Check for HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Voice features require HTTPS. Please access the app securely or use localhost.');
      }
      
      setIsRecording(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      analyzeAudioLevel(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = processVoiceCommand;
      mediaRecorder.start(1000); // Collect data every second
      
    } catch (error) {
      console.error('Recording start failed:', error);
      
      let errorMessage = 'Failed to start voice recording';
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
          errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings.';
        } else if (error.message.includes('NotFoundError')) {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.message.includes('NotReadableError')) {
          errorMessage = 'Microphone is being used by another application. Please close other apps using the microphone.';
        } else if (error.message.includes('HTTPS') || error.message.includes('localhost')) {
          errorMessage = error.message;
        } else if (error.message.includes('browser')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Voice recording error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setIsRecording(false);
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      
      setIsRecording(false);
      setAudioLevel(0);
      setIsProcessing(true);
    }
  };

  // Process Voice Command
  const processVoiceCommand = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      console.log('🎤 Processing voice command with OpenAI Whisper...');
      
      // Step 1: Transcribe audio using OpenAI Whisper
      const transcribeFormData = new FormData();
      transcribeFormData.append('audio', audioBlob);
      transcribeFormData.append('language', 'en');

      const transcribeResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: transcribeFormData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        console.warn('⚠️ OpenAI Whisper failed, using fallback:', errorData);
        
        // Fallback to browser Web Speech API if OpenAI fails
        if (errorData.fallback === 'browser') {
          setError(`Using browser voice recognition (OpenAI unavailable): ${errorData.message}`);
          // Continue with limited functionality
          return;
        }
        throw new Error(errorData.message || 'Transcription failed');
      }

      const transcription = await transcribeResponse.json();
      
      console.log('✅ Transcription:', transcription.transcript);
      console.log('🎯 Command detected:', transcription.command);
      
      setLastCommand({
        transcript: transcription.transcript,
        action: transcription.command.action,
        parameters: transcription.command.parameters,
        confidence: transcription.confidence,
      });
      
      // Step 2: If it's a query, get AI response
      if (transcription.command.action === 'query') {
        console.log('🤖 Getting AI response...');
        
        const ragResponse = await fetch('/api/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: transcription.transcript,
            taskType: 'unified_search',
            useMultiAgent: true,
          }),
        });

        if (ragResponse.ok) {
          const ragData = await ragResponse.json();
          console.log('✅ AI response received');
          
          setLastResponse({
            query: ragData.query,
            unifiedResponse: ragData.unifiedResponse,
            executionTime: ragData.executionTime,
            agents: ragData.agents || [],
          });

          // Step 3: Convert AI response to speech using OpenAI TTS
          console.log('🔊 Converting response to speech...');
          
          const ttsResponse = await fetch('/api/voice/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: ragData.unifiedResponse,
              voice: 'alloy', // or 'nova' for female voice
              speed: 1.0,
            }),
          });

          if (ttsResponse.ok) {
            const audioBlob = await ttsResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            setVoiceResponse({
              audioFile: audioUrl,
              duration: parseInt(ttsResponse.headers.get('X-Execution-Time') || '0') / 1000,
              speakers: 1,
            });
            
            console.log('✅ Voice response ready');
          } else {
            const ttsError = await ttsResponse.json();
            console.warn('⚠️ TTS failed:', ttsError);
            setError(`Voice synthesis unavailable: ${ttsError.message}. You can still read the text response.`);
          }
        } else {
          const ragError = await ragResponse.json();
          console.error('❌ AI query failed:', ragError);
          setError(`AI query failed: ${ragError.error}`);
        }
      }
      
      // Execute navigation if applicable
      if (transcription.command.action === 'navigate' && transcription.command.parameters.route) {
        console.log('🧭 Navigating to:', transcription.command.parameters.route);
        setTimeout(() => {
          router.push(transcription.command.parameters.route);
        }, 1000);
      }
      
      setShowTranscript(true);
      
    } catch (error) {
      console.error('Voice command processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  // Play Voice Response
  const playVoiceResponse = async () => {
    if (!voiceResponse || isPlaying) return;
    
    try {
      setIsPlaying(true);
      
      // Create audio element and play response
      const audio = new Audio(voiceResponse.audioFile);
      audio.volume = volume;
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
        // Clean up blob URL
        if (voiceResponse.audioFile.startsWith('blob:')) {
          URL.revokeObjectURL(voiceResponse.audioFile);
        }
      };
      
      audio.onerror = () => {
        setError('Failed to play voice response');
        setIsPlaying(false);
        audioRef.current = null;
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Voice playback error:', error);
      setError('Audio playback failed');
      setIsPlaying(false);
    }
  };

  // Stop Voice Response
  const stopVoiceResponse = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  // Toggle Recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Voice Assistant Main Button */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <div className="relative">
          {/* Recording pulse animation */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-red-500 rounded-full"
              />
            )}
          </AnimatePresence>
          
          {/* Main button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-glow-lg border-2 transition-all ${
              isRecording 
                ? 'bg-red-500 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                : isProcessing
                ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                : 'bg-gradient-accent border-accent-400 shadow-[0_0_30px_rgba(0,212,255,0.6)]'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </motion.button>
          
          {/* Audio level indicator */}
          {isRecording && (
            <motion.div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              <div 
                className="w-4 h-4 bg-red-500 rounded-full"
                style={{ opacity: Math.max(0.3, audioLevel) }}
              />
            </motion.div>
          )}
        </div>
        
        {/* Expand button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-glass-light backdrop-blur-xl border border-glass-border rounded-xl flex items-center justify-center text-white hover:bg-glass-medium transition-all"
        >
          <MessageSquare className="h-5 w-5" />
        </motion.button>
      </motion.div>

      {/* Expanded Voice Assistant Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 400, y: 100 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-32 right-8 w-96 max-h-[600px] glass-card-premium backdrop-blur-4xl border border-glass-border rounded-3xl shadow-premium z-40 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-glass-border bg-gradient-to-r from-accent-500/20 to-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-accent rounded-2xl flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                      VCC Voice Assistant
                    </h3>
                    <p className="text-xs text-white/70 font-sans">
                      VibeVoice · Multi-Agent RAG · Real-time
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              
              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-500/20 border border-red-400/30 rounded-2xl text-red-300 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Voice Error</div>
                        <div>{error}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Last Command Display */}
              <AnimatePresence>
                {lastCommand && showTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-accent-500/10 border border-accent-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Mic className="h-4 w-4 text-accent-400" />
                        <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">
                          Voice Command
                        </span>
                        <span className="text-xs text-white/60 ml-auto">
                          {Math.round(lastCommand.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-white font-mono text-sm bg-black/20 p-3 rounded-xl">
                        "{lastCommand.transcript}"
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          lastCommand.action === 'navigate' ? 'bg-blue-500/20 text-blue-400' :
                          lastCommand.action === 'search' ? 'bg-green-500/20 text-green-400' :
                          lastCommand.action === 'query' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {lastCommand.action.toUpperCase()}
                        </span>
                        {lastCommand.action === 'navigate' && lastCommand.parameters.route && (
                          <span className="flex items-center gap-1 text-xs text-white/70">
                            <ArrowRight className="h-3 w-3" />
                            {lastCommand.parameters.route}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI Response */}
                    {lastResponse && (
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                            AI Response
                          </span>
                          <span className="text-xs text-white/60 ml-auto">
                            {lastResponse.executionTime}ms
                          </span>
                        </div>
                        <p className="text-white text-sm leading-relaxed">
                          {lastResponse.unifiedResponse}
                        </p>
                        
                        {/* Voice Response Playback */}
                        {voiceResponse && (
                          <div className="mt-4 p-3 bg-black/20 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={isPlaying ? stopVoiceResponse : playVoiceResponse}
                                  className="w-8 h-8 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg flex items-center justify-center text-purple-400 transition-colors"
                                >
                                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </button>
                                <span className="text-xs text-white/70">
                                  Voice Response ({Math.round(voiceResponse.duration)}s)
                                </span>
                              </div>
                              
                              {/* Volume Control */}
                              <div className="flex items-center gap-2">
                                <VolumeX className="h-3 w-3 text-white/50" />
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={volume}
                                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none accent-purple-500"
                                />
                                <Volume2 className="h-3 w-3 text-white/50" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Commands */}
              <div>
                <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                  Try saying:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Show dashboard',
                    'Search for wire 3003',
                    'What is TRAC system?',
                    'Go to drawings',
                    'Find connector APS_CN1'
                  ].map((command, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 font-mono hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      "{command}"
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-glass-border bg-gradient-to-r from-glass-light to-transparent">
              <div className="flex items-center justify-between text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  <span>VibeVoice Integration Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Ready</span>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}