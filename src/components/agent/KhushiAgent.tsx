'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, X } from 'lucide-react';

export default function KhushiAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('Hi! I am Khushi, your VCC AI Assistant. How can I help you today?');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (transcript) {
            handleProcessQuery(transcript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
      }
    }
  }, [transcript]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleProcessQuery = async (query: string) => {
    setIsSpeaking(true);
    setResponse('Let me look that up for you...');
    
    try {
      // Call the AI assistant API for intelligent responses
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode: 'operator' }),
      });
      
      const data = await res.json();
      
      let aiReply: string;
      
      if (data.success && data.response) {
        // Clean markdown formatting for speech
        aiReply = data.response
          .replace(/##?\s*/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/- /g, '. ')
          .replace(/\n+/g, '. ')
          .substring(0, 500); // Limit for speech
      } else {
        // Fallback intelligent responses
        const lower = query.toLowerCase();
        if (lower.includes('wire') || lower.includes('cable')) {
          aiReply = "I can help you trace that wire. Let me navigate to the wire tracing panel for you.";
        } else if (lower.includes('drawing') || lower.includes('pdf')) {
          aiReply = "I'll pull up the associated engineering drawing for you. Navigating to the drawings section.";
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
          aiReply = "Hi there! I'm Khushi, your VCC system assistant. I can help you find drawings, trace wires, check connectors, or explain any system. What would you like to know?";
        } else if (lower.includes('brake') || lower.includes('braking')) {
          aiReply = "The brake system uses BCU and BECU for control. It includes compressor control, emergency brake loop with trainline 4062, and parking brake with PBMV. Would you like me to show the brake system drawings?";
        } else if (lower.includes('door')) {
          aiReply = "The door system uses DCU for independent door control. Key trainlines are 6073 and 6076 for door proving. Each door has DOLR and DORR relays. Want me to open the door system details?";
        } else if (lower.includes('traction') || lower.includes('trac')) {
          aiReply = "The traction system operates on 750V DC from the third rail through the HSCB to the VVVF inverter. The VVVF converts to 3-phase AC for the traction motors. Shall I show you the traction drawings?";
        } else if (lower.includes('connector') || lower.includes('pin')) {
          aiReply = "We have over 1600 connectors and 72000 pins in the system. I can help you find specific connector pin assignments. Which connector are you looking for?";
        } else {
          aiReply = "I searched for that but couldn't find a specific match. Try asking about a specific system like brakes, doors, traction, or ask me to find a wire number or drawing.";
        }
      }
      
      setResponse(aiReply);
      speak(aiReply);
    } catch (error) {
      const fallbackReply = "I'm having trouble connecting to the database right now. Please try again in a moment.";
      setResponse(fallbackReply);
      speak(fallbackReply);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get all available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Priority list for a sweet young Indian girl voice (9-10 year old sound)
      // Higher pitch + slightly faster rate creates a younger-sounding voice
      const voicePreferences = [
        'Google हिन्दी',           // Google Hindi female
        'Microsoft Swara',          // Microsoft Indian English female
        'Lekha',                    // Apple Indian English
        'Rishi',                    // Apple Indian English (lighter)
        'Google UK English Female', // Google female as fallback
        'Samantha',                 // Apple Samantha (young female)
        'Microsoft Zira',           // Microsoft female
        'Karen',                    // Apple Australian (lighter)
        'Moira',                    // Apple Irish (lighter)
      ];
      
      let selectedVoice: SpeechSynthesisVoice | null = null;
      
      // Try to find Indian English voice first
      for (const pref of voicePreferences) {
        const found = voices.find(v => v.name.includes(pref));
        if (found) {
          selectedVoice = found;
          break;
        }
      }
      
      // Fallback: find any female or en-IN voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === 'en-IN') ||
                       voices.find(v => v.name.toLowerCase().includes('female')) ||
                       voices.find(v => v.lang.startsWith('en')) ||
                       null;
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Configure for sweet young Indian girl voice (9-10 years old)
      utterance.lang = 'en-IN';
      utterance.rate = 1.05;   // Slightly faster = more youthful
      utterance.pitch = 1.45;  // Higher pitch = younger sounding
      utterance.volume = 1.0;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 glass-card-morph rounded-2xl p-5 shadow-2xl relative overflow-hidden"
          >
            {/* Animated 3D background effects */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <motion.div 
                    animate={isSpeaking ? { scale: [1, 1.2, 1], rotate: 360 } : { rotate: 360 }}
                    transition={isSpeaking ? { repeat: Infinity, duration: 1.5 } : { repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400"
                  />
                  <motion.div 
                    animate={isSpeaking ? { scale: [1, 1.1, 1], rotate: -360 } : { rotate: -360 }}
                    transition={isSpeaking ? { repeat: Infinity, duration: 1 } : { repeat: Infinity, duration: 15, ease: "linear" }}
                    className="absolute inset-1 rounded-full border-b-2 border-l-2 border-purple-400"
                  />
                  <div className="w-6 h-6 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                </div>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Khushi AI</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="min-h-24 bg-slate-900/50 rounded-xl p-3 mb-4 text-sm border border-slate-700/50 shadow-inner relative z-10">
              {isListening && !transcript && (
                <span className="text-slate-400 italic flex items-center gap-2">
                  <span className="flex gap-1">
                    <motion.span animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-cyan-400 rounded-full"></motion.span>
                    <motion.span animate={{ height: ["4px", "16px", "4px"] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 bg-cyan-400 rounded-full"></motion.span>
                    <motion.span animate={{ height: ["4px", "8px", "4px"] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 bg-cyan-400 rounded-full"></motion.span>
                  </span>
                  Listening...
                </span>
              )}
              {transcript && <div className="text-slate-300 italic mb-2">"{transcript}"</div>}
              {response && <div className="text-white mt-1 leading-relaxed font-medium">{response}</div>}
            </div>
            
            <div className="flex justify-center relative z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListen}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all shadow-lg ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                    : 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-100 border border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                {isListening ? 'Stop Listening' : 'Speak to Khushi'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!isOpen && !response) {
            setResponse("Hi! I'm Khushi. How can I assist you with your VCC engineering systems today?");
          }
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_25px_rgba(139,92,246,0.6)] flex items-center justify-center text-white cursor-pointer relative group"
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full opacity-50 blur-md group-hover:opacity-75 transition-opacity"
        />
        <MessageSquare size={24} className="relative z-10" />
      </motion.button>
    </div>
  );
}
