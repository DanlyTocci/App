/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GlossaryTerm } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface FlashcardsProps {
  terms: GlossaryTerm[];
  onBack: () => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ terms, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentTerm = terms[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < terms.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : terms.length - 1));
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] p-12">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center space-y-12">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl px-4 font-bold">
            <ChevronLeft className="mr-2 h-4 w-4" /> Glossario
          </Button>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Card {currentIndex + 1} / {terms.length}
          </div>
        </div>

        <div 
          className="relative h-[28rem] w-full perspective-2000 cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + (isFlipped ? '-back' : '-front')}
              initial={{ rotateY: isFlipped ? -180 : 180, opacity: 0, scale: 0.9 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: isFlipped ? 180 : -180, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, type: "spring", damping: 20 }}
              className="w-full h-full"
            >
              <Card className="w-full h-full flex items-center justify-center text-center p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-slate-200 bg-white rounded-[3rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-0 relative z-10">
                  {!isFlipped ? (
                    <div className="space-y-8">
                      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <Languages className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">{currentTerm.term}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Clicca per rivelare</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <h3 className="text-5xl font-black text-blue-600 tracking-tighter leading-tight">{currentTerm.translation}</h3>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600 text-lg font-medium">
                        "{currentTerm.context}"
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Clicca per tornare</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-8">
          <Button 
            variant="outline" 
            className="h-16 px-10 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold rounded-2xl shadow-sm transition-all active:scale-95"
            onClick={handlePrev}
          >
            <ChevronLeft className="mr-2 h-6 w-6" /> Precedente
          </Button>
          <Button 
            className="h-16 px-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95"
            onClick={handleNext}
          >
            Successivo <ChevronRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
