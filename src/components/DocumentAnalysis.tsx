/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, Loader2, Search, CheckCircle2 } from 'lucide-react';
import { analyzeDocument } from '../services/gemini';
import { GlossaryTerm } from '../types';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';

// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker path for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface DocumentAnalysisProps {
  sourceLang: string;
  targetLang: string;
  onAnalysisComplete: (terms: GlossaryTerm[]) => void;
}

export const DocumentAnalysis: React.FC<DocumentAnalysisProps> = ({ sourceLang, targetLang, onAnalysisComplete }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);
    
    if (file.type === 'application/pdf') {
      try {
        console.log("Starting PDF extraction for:", file.name);
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        
        const pdf = await loadingTask.promise;
        console.log(`PDF loaded: ${pdf.numPages} pages`);
        
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
          toast.error("Il PDF sembra essere vuoto o composto solo da immagini (scansione).");
          setIsExtracting(false);
          return;
        }

        setText(fullText);
        toast.success("PDF caricato ed estratto con successo!");
      } catch (error: any) {
        console.error("Error parsing PDF:", error);
        toast.error(`Errore durante la lettura del PDF: ${error.message || 'Assicurati che il file non sia protetto da password.'}`);
      } finally {
        setIsExtracting(false);
      }
    } else if (file.type === 'text/plain') {
      try {
        const content = await file.text();
        setText(content);
        toast.success("File di testo caricato con successo!");
      } catch (error: any) {
        toast.error("Errore durante la lettura del file di testo.");
      } finally {
        setIsExtracting(false);
      }
    } else {
      toast.error("Formato file non supportato. Usa PDF o TXT.");
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Inserisci del testo o carica un documento.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const terms = await analyzeDocument(text, sourceLang, targetLang);
      if (terms.length > 0) {
        onAnalysisComplete(terms);
        toast.success(`Analisi completata! Estratti ${terms.length} termini.`);
      } else {
        toast.warning("Nessun termine rilevato nel documento.");
      }
    } catch (error) {
      toast.error("Errore durante l'analisi del documento.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] p-10 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Analisi Documentale</h2>
          <p className="text-slate-500 font-medium">Estrai terminologia specifica dai tuoi documenti di preparazione</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
          <Card className="flex flex-col border-slate-200 bg-white shadow-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-8">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Upload className="w-6 h-6 text-blue-600" />
                Caricamento
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 space-y-6 flex flex-col">
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center group-hover:border-blue-400 transition-all bg-slate-50/50">
                  {isExtracting ? (
                    <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                  ) : (
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
                  )}
                  <p className="text-slate-600 font-bold">{isExtracting ? "Estrazione in corso..." : (fileName || "Trascina un PDF o TXT qui")}</p>
                  <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">{isExtracting ? "Attendere prego" : "O clicca per sfogliare"}</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Testo Estratto / Inserito</label>
                <Textarea
                  placeholder="Incolla qui il testo del documento se non vuoi caricare un file..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl p-6 resize-none focus:ring-blue-500"
                />
              </div>

              <Button
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>Avvia Analisi AI <Search className="ml-2 w-5 h-5" /></>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-slate-200 bg-white shadow-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-8">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                Istruzioni
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-10 space-y-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <span className="text-blue-600 font-black">1</span>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Carica il materiale</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Inserisci i documenti, i discorsi o i testi tecnici che dovrai interpretare.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <span className="text-blue-600 font-black">2</span>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Analisi Terminologica</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">L'AI identificherà i termini più complessi e rilevanti per il dominio specifico.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <span className="text-blue-600 font-black">3</span>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Generazione Glossario</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">I termini estratti verranno aggiunti al tuo workspace per lo studio e la pratica.</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Search className="w-20 h-20 text-blue-600" />
                </div>
                <p className="text-sm text-blue-700 font-medium leading-relaxed relative z-10">
                  "L'analisi documentale ti permette di prepararti su testi reali, garantendo che il glossario sia perfettamente allineato con il materiale della conferenza."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
