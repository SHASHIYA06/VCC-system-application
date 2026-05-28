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
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
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
    setResponse('Processing your query...');
    
    // Simulate AI thinking and querying backend/LAYRA
    setTimeout(() => {
      let aiReply = "I'm sorry, I couldn't process that request right now.";
      
      if (query.toLowerCase().includes('wire') || query.toLowerCase().includes('cable')) {
        aiReply = "I can help you trace that wire. Navigating to the wire tracing panel and highlighting the schematics.";
      } else if (query.toLowerCase().includes('drawing') || query.toLowerCase().includes('pdf')) {
        aiReply = "Accessing the LAYRA knowledge base to pull up the associated engineering drawing.";
      } else if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
        aiReply = "Hello! I'm Khushi. Tell me what system or component you're looking for.";
      }
      
      setResponse(aiReply);
      speak(aiReply);
    }, 1500);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to find a female/friendly voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      
      utterance.onend = () => setIsSpeaking(false);
      
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
