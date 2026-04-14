/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GlossaryTerm } from '../types';
import { Button } from '@/components/ui/button';
import { Volume2, Youtube, Search, Info, Download, FileSpreadsheet, FileText as FilePdf, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { exportGlossaryToPDF, exportGlossaryToExcel } from '../lib/exportUtils';

interface GlossaryProps {
  terms: GlossaryTerm[];
  domain: string;
  onPracticeFlashcards: () => void;
  onStartSimulation: () => void;
  onStartDialogue: () => void;
  sourceLang: string;
}

const langMap: Record<string, string> = {
  'Italiano': 'it-IT',
  'Inglese': 'en-US',
  'Francese': 'fr-FR',
  'Tedesco': 'de-DE',
  'Spagnolo': 'es-ES'
};

export const Glossary: React.FC<GlossaryProps> = ({ terms, domain, sourceLang }) => {
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(terms[0] || null);

  const handleSpeak = (term: string) => {
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = langMap[sourceLang] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const getPronunciationUrl = (term: string) => {
    return `https://translate.google.com/?sl=auto&tl=it&text=${encodeURIComponent(term)}&op=translate`;
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Glossary List */}
      <div className="w-[350px] border-r border-slate-200 flex flex-col bg-white shrink-0">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Termini ({terms.length})
          </h3>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-100"
                onClick={() => exportGlossaryToPDF(terms, domain)}
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
                className="w-10 h-10 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 border border-emerald-100"
                onClick={() => exportGlossaryToExcel(terms, domain)}
                title="Esporta Excel"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </Button>
              <span className="text-[8px] font-bold uppercase text-emerald-400">Excel</span>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {terms.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedTerm(item)}
              className={`p-5 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${
                selectedTerm?.term === item.term ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <span className={`font-bold block mb-1 ${selectedTerm?.term === item.term ? 'text-blue-700' : 'text-slate-900'}`}>{item.term}</span>
              <span className="text-xs text-slate-500 font-medium">{item.translation}</span>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-[#F8FAFC] overflow-y-auto p-16">
        {selectedTerm ? (
          <motion.div
            key={selectedTerm.term}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="mb-12 border-b border-slate-200 pb-12">
              <Badge className="mb-6 bg-blue-100 text-blue-600 border-blue-200 font-black uppercase tracking-widest px-3 py-1 rounded-full text-[10px]">
                Dettaglio Termine
              </Badge>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">
                {selectedTerm.term}
              </h1>
              <p className="text-2xl text-slate-500 font-medium tracking-tight">
                {selectedTerm.translation}
              </p>
            </div>

            <div className="space-y-12">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Contesto d'uso</h3>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm leading-relaxed text-slate-700 text-xl italic font-medium">
                  "{selectedTerm.context}"
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Risorse Multimediali</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    className="h-14 px-8 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-2xl flex gap-3 transition-all"
                    onClick={() => handleSpeak(selectedTerm.term)}
                  >
                    <Volume2 className="w-5 h-5 text-blue-600" />
                    Ascolta Pronuncia
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-14 px-6 text-slate-400 hover:text-blue-600 font-medium rounded-2xl flex gap-2 transition-all"
                    onClick={() => window.open(getPronunciationUrl(selectedTerm.term), '_blank')}
                  >
                    <Globe className="w-4 h-4" />
                    Google Translate
                  </Button>
                </div>
              </section>

              <section className="pt-12 mt-12 border-t border-slate-200">
                <div className="flex items-start gap-4 text-slate-500">
                  <Info className="w-6 h-6 shrink-0 mt-1 text-blue-500/50" />
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400">Note Professionali</h3>
                    <p className="text-sm leading-relaxed font-medium">
                      Assicurati di mantenere la precisione terminologica durante la simultanea. 
                      In contesti formali, preferire la forma estesa rispetto agli acronimi se non precedentemente introdotti.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-200">
            <Search className="w-24 h-24 mb-6 opacity-20" />
            <p className="text-xl font-bold tracking-tight">Seleziona un termine per iniziare</p>
          </div>
        )}
      </div>
    </div>
  );
};
