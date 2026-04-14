/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GlossaryTerm, DialogueSimulation as DialogueType, LanguageLevel } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, ArrowRight, RefreshCcw, ChevronLeft, FileText as FilePdf, FileText as FileWord } from 'lucide-react';
import { generateDialogueSimulation } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exportDialogueToPDF, exportDialogueToWord } from '../lib/exportUtils';

interface DialogueSimulationProps {
  domain: string;
  lang1: string;
  lang2: string;
  glossary: GlossaryTerm[];
  level: LanguageLevel;
  onBack: () => void;
}

export const DialogueSimulation: React.FC<DialogueSimulationProps> = ({ domain, lang1, lang2, glossary, level, onBack }) => {
  const [simulation, setSimulation] = useState<DialogueType | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSimulation = async () => {
    setIsLoading(true);
    try {
      const data = await generateDialogueSimulation(domain, lang1, lang2, glossary, level);
      setSimulation(data);
      setCurrentTurn(0);
    } catch (error) {
      toast.error("Errore nella generazione della simulazione.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, []);

  const handleNext = () => {
    if (simulation && currentTurn < simulation.turns.length - 1) {
      setCurrentTurn(currentTurn + 1);
    }
  };

  const handlePrev = () => {
    if (currentTurn > 0) {
      setCurrentTurn(currentTurn - 1);
    }
  };

  const handleExportPDF = async () => {
    if (!simulation) return;
    try {
      exportDialogueToPDF(simulation, domain, glossary);
      toast.success("PDF generato con successo!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Errore durante la generazione del PDF.");
    }
  };

  const handleExportWord = async () => {
    if (!simulation) return;
    try {
      await exportDialogueToWord(simulation, domain, glossary);
      toast.success("Documento Word generato con successo!");
    } catch (error) {
      console.error("Word export error:", error);
      toast.error("Errore durante la generazione del documento Word.");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#F8FAFC] space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 animate-pulse" />
          <RefreshCcw className="w-20 h-20 animate-spin text-blue-600 relative z-10" />
        </div>
        <div className="text-center space-y-3">
          <p className="text-2xl font-black text-slate-900 tracking-tight">Creazione scenario di dialogo...</p>
          <p className="text-slate-500 font-medium">L'AI sta preparando una situazione professionale realistica</p>
        </div>
      </div>
    );
  }

  if (!simulation) return null;

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] p-10 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <Badge className="mb-3 bg-blue-100 text-blue-600 border-blue-200 font-black uppercase tracking-widest px-3 py-1 rounded-full text-[10px]">
              Interpretazione Consecutiva
            </Badge>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Simulazione Dialogica</h2>
            <p className="text-slate-500 font-medium mt-1">Pratica l'interpretazione di trattativa in contesti reali</p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-100"
                onClick={handleExportPDF}
                title="Esporta PDF"
              >
                <FilePdf className="w-5 h-5" />
              </Button>
              <span className="text-[8px] font-bold uppercase text-red-400">PDF</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 text-blue-500 hover:text-blue-600 hover:bg-blue-50 border border-blue-100"
                onClick={handleExportWord}
                title="Esporta Word"
              >
                <FileWord className="w-5 h-5" />
              </Button>
              <span className="text-[8px] font-bold uppercase text-blue-400">Word</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSimulation} className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-12 rounded-xl px-6 font-bold self-center">
              <RefreshCcw className="mr-2 h-4 w-4" /> Nuovo Scenario
            </Button>
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-slate-900 hover:bg-white h-12 rounded-xl px-6 font-bold self-center">
              Esci
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-8 pb-12">
            <Card className="border-slate-200 shadow-xl bg-blue-600 rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <CardHeader className="p-10 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-100" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Scenario</span>
                </div>
                <CardTitle className="text-3xl font-black text-white mb-4 tracking-tight">{domain}</CardTitle>
                <p className="text-blue-50 text-xl leading-relaxed italic font-medium">
                  "{simulation.scenario}"
                </p>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Dialogo</h3>
              {simulation.turns.map((turn, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'} p-8 rounded-[2rem] border border-slate-200 shadow-sm`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-lg ${idx % 2 === 0 ? 'bg-slate-100' : 'bg-blue-600'} flex items-center justify-center`}>
                        <User className={`w-4 h-4 ${idx % 2 === 0 ? 'text-slate-600' : 'text-white'}`} />
                      </div>
                      <span className="font-black text-slate-900 text-sm tracking-tight">{turn.speaker}</span>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200">
                        {turn.language}
                      </Badge>
                    </div>
                    <p className="text-xl text-slate-700 leading-relaxed font-medium">
                      {turn.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-12 border-t border-slate-200">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 ml-4">Glossario Utilizzato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {glossary.map((term, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <span className="font-bold text-slate-900">{term.term}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <span className="font-bold text-blue-600">{term.translation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
