
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getLiveClient } from '../services/geminiService';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../services/audioUtils';
import { LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Power, Activity, MoreHorizontal } from 'lucide-react';
import { AgeGroup } from '../types';
import clsx from 'clsx';

interface OwlAssistantProps {
  onTranscript?: (text: string, sender: 'owl' | 'user') => void;
  ageGroup?: AgeGroup;
  forcedVariant?: AgeGroup; // Allows override for "Buddy" selection
}

const OwlAssistant: React.FC<OwlAssistantProps> = ({ onTranscript, ageGroup = AgeGroup.DISCOVERY, forcedVariant }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the forcedVariant if present, otherwise default to ageGroup
  const activeVariant = forcedVariant || ageGroup;

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close(); 
      sessionRef.current = null;
    }
    setIsActive(false);
    setIsSpeaking(false);
  }, []);

  const getSystemInstruction = () => {
    // Use the variant logic for persona consistency
    switch(activeVariant) {
      case AgeGroup.EARLY:
        return "You are Ollie, a soft-spoken, gentle owl for toddlers. Speak in very simple, short sentences. Be warm and comforting. Use simple words.";
      case AgeGroup.DISCOVERY:
        return "You are Professor Ollie, a fun and energetic owl for curious kids. Be encouraging, use jokes, and help them solve problems with hints. Be enthusiastic!";
      case AgeGroup.JUNIOR:
        return "You are Unit O.W.L., a wise guide. Be cool, concise, and helpful. Use a slightly more mature tone, like a mentor.";
      default:
        return "You are a helpful Owl assistant.";
    }
  };

  const getVoiceName = () => {
    switch(activeVariant) {
      case AgeGroup.EARLY: return 'Aoede'; // Soft, storytelling voice
      case AgeGroup.DISCOVERY: return 'Puck'; // Playful, energetic
      case AgeGroup.JUNIOR: return 'Fenrir'; // Deeper, calmer
      default: return 'Kore';
    }
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const ai = getLiveClient();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const connectPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: getVoiceName() } }, 
          },
          systemInstruction: getSystemInstruction(),
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);

            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            inputSourceRef.current = source;
            
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (micMuted) return; 
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              connectPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             if (message.serverContent?.outputTranscription?.text) {
                onTranscript?.(message.serverContent.outputTranscription.text, 'owl');
             }
             if (message.serverContent?.inputTranscription?.text) {
                onTranscript?.(message.serverContent.inputTranscription.text, 'user');
             }

              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputAudioContextRef.current) {
               setIsSpeaking(true);
               const ctx = outputAudioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

               const audioBuffer = await decodeAudioData(
                 base64ToUint8Array(base64Audio),
                 ctx,
                 24000,
                 1
               );

               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(ctx.destination);
               source.start(nextStartTimeRef.current);
               
               source.onended = () => {
                 if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                    setIsSpeaking(false);
                 }
               };
               nextStartTimeRef.current += audioBuffer.duration;
             }
             
             if (message.serverContent?.interrupted) {
                setIsSpeaking(false);
                nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            cleanupAudio();
          },
          onerror: (err) => {
            console.error(err);
            setError("Connection lost");
            cleanupAudio();
          }
        }
      });
      sessionRef.current = connectPromise;

    } catch (err) {
      console.error(err);
      setError("Mic blocked");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => cleanupAudio();
  }, [cleanupAudio]);

  // -- Visual Variants --

  const EarlyOwl = () => (
    <div className={`w-40 h-40 relative transition-transform duration-700 ease-in-out ${isSpeaking ? 'animate-wiggle' : 'animate-float'}`}>
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-soft-lg">
         {/* Body: Rounder and softer */}
         <circle cx="50" cy="55" r="42" fill="#F4C95D" />
         <circle cx="50" cy="65" r="25" fill="#FDFBF7" />
         
         {/* Eyes: Larger for cuteness */}
         <circle cx="35" cy="45" r="14" fill="white" />
         <circle cx="65" cy="45" r="14" fill="white" />
         <circle cx="35" cy="45" r="5" fill="#5D4037" className={isSpeaking ? 'animate-pulse' : ''} />
         <circle cx="65" cy="45" r="5" fill="#5D4037" className={isSpeaking ? 'animate-pulse' : ''} />
         
         {/* Beak: Simple triangle, animates slightly open */}
         <path 
            d={isSpeaking ? "M 45 60 L 55 60 L 50 70 Z" : "M 45 60 L 55 60 L 50 68 Z"} 
            fill="#E79E85" 
            className="transition-all duration-100"
         />
         
         {/* Wings: Simple curves */}
         <path d="M 15 25 Q 25 15 35 25" fill="#F4C95D" />
         <path d="M 85 25 Q 75 15 65 25" fill="#F4C95D" />
       </svg>
    </div>
  );

  const DiscoveryOwl = () => (
    <div className={`w-36 h-36 relative transition-transform duration-300 ${isSpeaking ? 'scale-105' : ''}`}>
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-soft-lg">
         {/* Body: Dynamic shape */}
         <path d="M25,30 Q50,10 75,30 Q85,50 75,80 Q50,95 25,80 Q15,50 25,30" fill="#9CAF88" />
         <path d="M35,50 Q50,90 65,50" fill="#F3EFE0" opacity="0.8" />
         
         {/* Head Bob Group */}
         <g transform={isSpeaking ? "translate(0, -3)" : "translate(0, 0)"} className="transition-transform duration-100">
            {/* Glasses / Eyes */}
            <circle cx="38" cy="42" r="12" fill="white" stroke="#5F714F" strokeWidth="2" />
            <circle cx="62" cy="42" r="12" fill="white" stroke="#5F714F" strokeWidth="2" />
            <circle cx="38" cy="42" r="5" fill="#2C3E50" />
            <circle cx="62" cy="42" r="5" fill="#2C3E50" />
            <path d="M50,42 L50,42" stroke="#5F714F" strokeWidth="2" /> {/* Bridge */}
            
            {/* Beak */}
            <path d="M 47 55 L 53 55 L 50 60 Z" fill="#E79E85" />
         </g>
         
         {/* Wings: Flap slightly */}
         <path d={isSpeaking ? "M 15 50 Q 5 60 15 70" : "M 20 50 Q 15 60 20 70"} fill="none" stroke="#5F714F" strokeWidth="3" strokeLinecap="round" />
         <path d={isSpeaking ? "M 85 50 Q 95 60 85 70" : "M 80 50 Q 85 60 80 70"} fill="none" stroke="#5F714F" strokeWidth="3" strokeLinecap="round" />
       </svg>
    </div>
  );

  const JuniorOwl = () => (
    <div className="w-28 h-28 relative">
       <div className={`absolute inset-0 bg-junior-primary/20 rounded-full blur-xl ${isSpeaking ? 'animate-pulse' : ''}`}></div>
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
         {/* Tech / Geometric Shape */}
         <path d="M20,25 L80,25 L85,50 L75,85 L25,85 L15,50 Z" fill="#2C3E50" />
         <path d="M20,25 L50,50 L80,25" fill="#FFFFFF" opacity="0.1" />
         
         {/* Digital Eyes: Rectangular */}
         <rect x="32" y="42" width="14" height="10" rx="2" fill={isSpeaking ? "#9CAF88" : "#6B8CA3"} className="transition-colors duration-200" />
         <rect x="54" y="42" width="14" height="10" rx="2" fill={isSpeaking ? "#9CAF88" : "#6B8CA3"} className="transition-colors duration-200" />
         
         {/* Equalizer Mouth */}
         <g transform="translate(35, 65)">
           {isSpeaking ? (
             <>
               <rect x="0" y="2" width="4" height="6" fill="#9CAF88" className="animate-pulse" style={{animationDuration: '0.2s'}} />
               <rect x="6" y="0" width="4" height="10" fill="#9CAF88" className="animate-pulse" style={{animationDuration: '0.3s'}} />
               <rect x="12" y="3" width="4" height="4" fill="#9CAF88" className="animate-pulse" style={{animationDuration: '0.1s'}} />
               <rect x="18" y="1" width="4" height="8" fill="#9CAF88" className="animate-pulse" style={{animationDuration: '0.25s'}} />
               <rect x="24" y="2" width="4" height="6" fill="#9CAF88" className="animate-pulse" style={{animationDuration: '0.35s'}} />
             </>
           ) : (
             <rect x="0" y="4" width="28" height="2" fill="#6B8CA3" opacity="0.5" />
           )}
         </g>
       </svg>
    </div>
  );

  // -- Feedback Bubble Styles --
  const renderFeedbackBubble = () => {
    if (!isSpeaking) return null;

    if (activeVariant === AgeGroup.EARLY) {
       return (
         <div className="mb-2 p-6 rounded-[2rem] rounded-br-none bg-white border-4 border-early-primary shadow-toy animate-bounce">
            <div className="flex gap-2 items-center text-early-text font-kids font-bold text-lg">
                <Activity className="w-6 h-6 animate-pulse text-early-secondary" /> 
                Listening...
            </div>
         </div>
       );
    }
    
    if (activeVariant === AgeGroup.JUNIOR) {
       return (
         <div className="mb-2 px-4 py-2 bg-black/80 backdrop-blur border-l-4 border-junior-primary text-white font-mono text-xs rounded-r-lg shadow-lg animate-fade-in flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            PROCESSING_AUDIO_STREAM...
         </div>
       );
    }

    // Discovery Default
    return (
      <div className="mb-2 p-4 rounded-2xl rounded-br-none shadow-soft-lg bg-white animate-fade-in border border-disco-bg">
         <div className="flex gap-2 items-center text-disco-text font-bold text-sm">
             <MoreHorizontal className="w-4 h-4 animate-pulse text-disco-primary" /> 
             Thinking...
         </div>
      </div>
    );
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4`}>
      
      {renderFeedbackBubble()}

      <div className="flex items-end gap-4">
        {/* Controls */}
        {isActive && (
          <div className={clsx(
            "flex flex-col gap-2 p-2 rounded-2xl transition-all duration-300",
            activeVariant === AgeGroup.JUNIOR ? "bg-black/80 backdrop-blur border border-white/10" : "bg-white/90 shadow-soft border border-scandi-oat"
          )}>
             <button 
               onClick={() => setMicMuted(!micMuted)}
               className={clsx(
                 "p-3 rounded-xl transition-colors",
                 micMuted ? "bg-red-100 text-red-500" : (activeVariant === AgeGroup.JUNIOR ? "text-white hover:bg-white/10" : "bg-scandi-oat hover:bg-scandi-sand text-scandi-chocolate")
               )}
             >
               {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
             </button>
             <button 
               onClick={cleanupAudio}
               className={clsx(
                 "p-3 rounded-xl transition-colors",
                 activeVariant === AgeGroup.JUNIOR ? "text-white hover:text-red-400 hover:bg-white/10" : "bg-scandi-oat hover:bg-red-100 text-scandi-chocolate hover:text-red-500"
               )}
             >
               <Power size={20} />
             </button>
          </div>
        )}

        {/* Avatar Trigger */}
        <button 
          onClick={isActive ? undefined : startSession}
          disabled={isConnecting}
          className={`relative group transition-all duration-300 ${!isActive ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
        >
          {activeVariant === AgeGroup.EARLY && <EarlyOwl />}
          {activeVariant === AgeGroup.DISCOVERY && <DiscoveryOwl />}
          {activeVariant === AgeGroup.JUNIOR && <JuniorOwl />}
          
          {!isActive && (
            <div className={clsx(
              "absolute -top-1 -right-1 w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-bounce border-4 border-white",
              activeVariant === AgeGroup.EARLY ? "bg-early-primary text-white" :
              activeVariant === AgeGroup.DISCOVERY ? "bg-disco-primary text-white" :
              "bg-junior-text text-junior-accent"
            )}>
               {isConnecting ? <span className="animate-spin text-xl">⟳</span> : <Mic size={24} />}
            </div>
          )}
        </button>
      </div>
      
      {error && (
         <div className="bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-soft font-bold">
           {error}
         </div>
      )}
    </div>
  );
};

export default OwlAssistant;
