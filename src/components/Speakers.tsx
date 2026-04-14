/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SpeakerInfo } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Users, Upload, Loader2, Search, User, Briefcase, BookOpen } from 'lucide-react';
import { extractSpeakerInfo } from '../services/gemini';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';

// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker path for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const Speakers: React.FC = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [speakers, setSpeakers] = useState<SpeakerInfo[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);
    
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ');
          fullText += pageText + '\n';
        }
        
        if (!fullText.trim()) {
          toast.error("Il PDF sembra essere vuoto o composto solo da immagini.");
          setIsExtracting(false);
          return;
        }

        setText(fullText);
        toast.success("PDF caricato con successo!");
      } catch (error: any) {
        console.error("Error parsing PDF:", error);
        toast.error(`Errore durante la lettura del PDF: ${error.message || 'Assicurati che il file non sia protetto.'}`);
      } finally {
        setIsExtracting(false);
      }
    } else if (file.type === 'text/plain') {
      try {
        setText(await file.text());
        toast.success("File di testo caricato!");
      } catch (error) {
        toast.error("Errore durante la lettura del file.");
      } finally {
        setIsExtracting(false);
      }
    } else {
      toast.error("Formato non supportato (PDF o TXT).");
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const info = await extractSpeakerInfo(text);
      setSpeakers(info);
      toast.success(`Trovati ${info.length} relatori!`);
    } catch (error) {
      toast.error("Errore durante l'analisi dei relatori.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 lg:p-10 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Relatori della Conferenza</h2>
          <p className="text-slate-500">Analizza i documenti per conoscere chi parlerà e i loro temi principali.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
          {/* Left: Input */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col">
              <CardHeader className="border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Carica Documento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="relative group">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group-hover:border-blue-400 transition-all bg-slate-50/50">
                    {isExtracting ? (
                      <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                    ) : (
                      <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                    )}
                    <p className="text-xs font-semibold text-slate-600">{isExtracting ? "Estrazione..." : (fileName || "PDF o TXT")}</p>
                  </div>
                </div>

                <Textarea
                  placeholder="Incolla qui il programma o le bio dei relatori..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 min-h-[200px] bg-white border-slate-200 text-slate-800 rounded-xl p-4 resize-none focus:ring-blue-500"
                />

                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !text.trim()}
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analizza Relatori"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-8 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {speakers.length > 0 ? (
                  speakers.map((speaker, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-6">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                              <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="space-y-4 flex-1">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900">{speaker.name}</h3>
                                <p className="text-blue-600 font-semibold flex items-center gap-2 text-sm">
                                  <Briefcase className="w-4 h-4" />
                                  {speaker.role}
                                </p>
                              </div>
                              
                              <p className="text-slate-600 text-sm leading-relaxed">
                                {speaker.bio}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {speaker.topics.map((topic, tIdx) => (
                                  <span 
                                    key={tIdx} 
                                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 flex items-center gap-1"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                    <Search className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Nessun relatore analizzato ancora.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
