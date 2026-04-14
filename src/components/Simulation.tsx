/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GlossaryTerm, SimulationFeedback } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Square, RefreshCcw, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { getSimulationFeedback } from '../services/gemini';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface SimulationProps {
  glossary: GlossaryTerm[];
  onBack: () => void;
}

export const Simulation: React.FC<SimulationProps> = ({ glossary, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<SimulationFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [timer, setTimer] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'it-IT';

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Errore nel riconoscimento vocale: ${event.error}`);
        stopRecording();
      };
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Il tuo browser non supporta il riconoscimento vocale.");
      return;
    }
    setIsRecording(true);
    setTranscript('');
    setFeedback(null);
    setTimer(0);
    recognitionRef.current.start();
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAnalyze = async () => {
    if (!transcript) {
      toast.warning("Nessun trascritto da analizzare.");
      return;
    }
    setIsLoadingFeedback(true);
    try {
      const result = await getSimulationFeedback(transcript, glossary);
      setFeedback(result);
      toast.success("Analisi completata!");
    } catch (error) {
      toast.error("Errore durante l'analisi.");
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 p-10 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <Badge className="mb-3 bg-blue-500/10 text-blue-400 border-blue-500/20 font-black uppercase tracking-widest px-3 py-1 rounded-full text-[10px]">
              Modalità Simultanea
            </Badge>
            <h2 className="text-4xl font-black text-white tracking-tighter">Simulatore Real-time</h2>
            <p className="text-slate-500 font-medium mt-1">Pratica l'interpretazione con feedback istantaneo dell'AI</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm font-black bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl shadow-2xl">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-700'}`} />
              <span className="font-mono text-white text-lg">{formatTime(timer)}</span>
            </div>
            <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl h-12">
              Esci
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 min-h-0">
          <Card className="flex flex-col border-slate-800 shadow-2xl bg-slate-900/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 p-8">
              <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                <Mic className="w-6 h-6 text-blue-500" />
                Trascrizione Live
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-8 p-8 min-h-0">
              <ScrollArea className="flex-1 p-8 rounded-3xl bg-slate-950/50 border border-slate-800/50">
                {transcript ? (
                  <p className="text-2xl leading-relaxed text-slate-200 font-medium">{transcript}</p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 italic py-16">
                    <Mic className="w-16 h-16 mb-6 opacity-10" />
                    <p className="text-lg">Inizia a parlare per vedere la trascrizione...</p>
                  </div>
                )}
              </ScrollArea>
              
              <div className="flex gap-4">
                {!isRecording ? (
                  <Button 
                    className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95" 
                    onClick={startRecording}
                  >
                    <Mic className="mr-3 h-6 w-6" /> Inizia Sessione
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    className="flex-1 h-16 font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-95" 
                    onClick={stopRecording}
                  >
                    <MicOff className="mr-3 h-6 w-6" /> Termina Sessione
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="h-16 w-16 border-slate-800 bg-slate-900 text-slate-400 hover:text-white rounded-2xl transition-all"
                  onClick={() => setTranscript('')} 
                  disabled={isRecording}
                >
                  <RefreshCcw className="h-6 h-6" />
                </Button>
              </div>
              
              <Button 
                className="w-full h-14 bg-white text-slate-950 hover:bg-slate-200 font-black rounded-2xl transition-all disabled:opacity-50" 
                onClick={handleAnalyze} 
                disabled={isRecording || !transcript || isLoadingFeedback}
              >
                {isLoadingFeedback ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : "Analizza Performance con AI"}
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-slate-800 shadow-2xl bg-slate-900/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 p-8">
              <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-500" />
                Feedback Analitico
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 min-h-0">
              {isLoadingFeedback ? (
                <div className="flex flex-col items-center justify-center h-full space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                    <RefreshCcw className="w-16 h-16 animate-spin text-blue-500 relative z-10" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="font-black text-2xl text-white tracking-tight">L'AI sta analizzando...</p>
                    <p className="text-slate-500 font-medium">Valutazione terminologica e fluidità in corso</p>
                  </div>
                  <Progress value={66} className="w-full max-w-sm h-2 bg-slate-800" />
                </div>
              ) : feedback ? (
                <ScrollArea className="h-full pr-6">
                  <div className="space-y-12">
                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Terminologia Rilevata
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {feedback.terminology.map((term, i) => (
                          <Badge key={i} className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-2 rounded-xl font-bold text-sm">
                            {term}
                          </Badge>
                        ))}
                        {feedback.terminology.length === 0 && <p className="text-sm text-slate-500 italic">Nessun termine specifico rilevato.</p>}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                        Fluidità e Tono
                      </h4>
                      <div className="bg-blue-500/5 p-8 rounded-3xl border border-blue-500/10 text-slate-300 leading-relaxed italic text-lg font-medium">
                        "{feedback.fluency}"
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6">Suggerimenti di Miglioramento</h4>
                      <ul className="space-y-4">
                        {feedback.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-4 text-slate-400 font-medium">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center border border-slate-800">
                    <Play className="w-10 h-10 text-slate-800" />
                  </div>
                  <div className="max-w-sm">
                    <p className="font-black text-xl text-white tracking-tight">Pronto per l'analisi</p>
                    <p className="text-slate-500 font-medium mt-2">Completa una registrazione per ricevere un report dettagliato sulla tua performance professionale.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
