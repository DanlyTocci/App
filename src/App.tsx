/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GlossaryTerm, AppState, LanguageLevel } from './types';
import { generateGlossary } from './services/gemini';
import { Glossary } from './components/Glossary';
import { Flashcards } from './components/Flashcards';
import { DialogueSimulation } from './components/DialogueSimulation';
import { DocumentAnalysis } from './components/DocumentAnalysis';
import { Speakers } from './components/Speakers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Languages, 
  Globe, 
  ArrowRight, 
  Loader2, 
  BookOpen, 
  Layers, 
  Mic, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  ChevronRight,
  FileSearch,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  const [state, setState] = useState<AppState>('setup');
  const [domain, setDomain] = useState('');
  const [sourceLang, setSourceLang] = useState('Italiano');
  const [targetLang, setTargetLang] = useState('Inglese');
  const [level, setLevel] = useState<LanguageLevel>('B2');
  const [termCount, setTermCount] = useState('10');
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!domain) {
      toast.error("Per favore, inserisci un dominio specifico.");
      return;
    }
    setIsGenerating(true);
    try {
      const terms = await generateGlossary(domain, sourceLang, targetLang, parseInt(termCount));
      setGlossary(terms);
      setState('glossary');
      toast.success("Glossario generato con successo!");
    } catch (error) {
      toast.error("Errore durante la generazione del glossario.");
    } finally {
      setIsGenerating(false);
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: AppState; icon: any; label: string }) => (
    <div
      onClick={() => (glossary.length > 0 || id === 'analysis' || id === 'speakers') && setState(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
        state === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold' 
          : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
      } ${(glossary.length === 0 && id !== 'analysis' && id !== 'speakers') ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (state === 'setup') {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 selection:bg-blue-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-200 mb-6 relative group">
                <Sparkles className="w-10 h-10 text-white relative z-10" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">INTERPRETA.PRO</h1>
              <p className="text-slate-500 font-medium">L'intelligenza artificiale al servizio dell'interpretazione</p>
            </div>

            <Card className="border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Dominio di Studio</Label>
                  <Input
                    placeholder="es. Chirurgia Robotica o Diritto Penale"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="bg-slate-50 border-slate-200 h-14 text-lg text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 rounded-2xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Lingua A</Label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-14 text-slate-900 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="Italiano">🇮🇹 Italiano</SelectItem>
                        <SelectItem value="Inglese">🇬🇧 Inglese</SelectItem>
                        <SelectItem value="Francese">🇫🇷 Francese</SelectItem>
                        <SelectItem value="Tedesco">🇩🇪 Tedesco</SelectItem>
                        <SelectItem value="Spagnolo">🇪🇸 Spagnolo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Lingua B</Label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-14 text-slate-900 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="Italiano">🇮🇹 Italiano</SelectItem>
                        <SelectItem value="Inglese">🇬🇧 Inglese</SelectItem>
                        <SelectItem value="Francese">🇫🇷 Francese</SelectItem>
                        <SelectItem value="Tedesco">🇩🇪 Tedesco</SelectItem>
                        <SelectItem value="Spagnolo">🇪🇸 Spagnolo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Livello Difficoltà</Label>
                    <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-14 text-slate-900 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="B1">Livello B1 (Intermedio)</SelectItem>
                        <SelectItem value="B2">Livello B2 (Intermedio Superiore)</SelectItem>
                        <SelectItem value="C1">Livello C1 (Avanzato)</SelectItem>
                        <SelectItem value="C2">Livello C2 (Padronanza)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Numero Termini</Label>
                    <Select value={termCount} onValueChange={setTermCount}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-14 text-slate-900 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="10">10 Termini</SelectItem>
                        <SelectItem value="20">20 Termini</SelectItem>
                        <SelectItem value="30">30 Termini</SelectItem>
                        <SelectItem value="50">50 Termini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    className="flex-1 h-16 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold rounded-2xl transition-all"
                    onClick={() => setState('analysis')}
                  >
                    Analisi Documento
                  </Button>
                  <Button 
                    className="flex-[2] h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>Genera Workspace <ArrowRight className="ml-2 w-6 h-6" /></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <Toaster theme="light" position="top-center" />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen w-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-100">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-50 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="text-slate-900 font-black text-2xl tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => setState('setup')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              INTERPRETA.PRO
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-4 text-sm font-bold">
              <span className="text-slate-700">{sourceLang === 'Italiano' ? '🇮🇹 IT' : sourceLang === 'Inglese' ? '🇬🇧 EN' : sourceLang}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">{targetLang === 'Italiano' ? '🇮🇹 IT' : targetLang === 'Inglese' ? '🇬🇧 EN' : targetLang}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200">
              {domain}
            </div>
            <Button variant="outline" size="sm" onClick={() => setState('setup')} className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl font-bold">
              Nuovo Studio
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-3 shrink-0">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-4">Strumenti</p>
              <NavItem id="glossary" icon={Globe} label="Glossario" />
              <NavItem id="flashcards" icon={Sparkles} label="Flashcards" />
              <NavItem id="dialogue" icon={Languages} label="Interpretazione Dialogica" />
              <NavItem id="analysis" icon={FileSearch} label="Analisi Documentale" />
              <NavItem id="speakers" icon={Users} label="Relatori" />
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-bold">Impostazioni</span>
              </div>
            </div>
          </aside>

          {/* Main Content - Scrollable container */}
          <main className="flex-1 overflow-hidden bg-[#F8FAFC] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={state}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full w-full overflow-y-auto"
              >
                <div className="min-h-full">
                  {state === 'glossary' && (
                    <Glossary 
                      terms={glossary} 
                      domain={domain}
                      sourceLang={sourceLang}
                      onPracticeFlashcards={() => setState('flashcards')}
                      onStartSimulation={() => {}}
                      onStartDialogue={() => setState('dialogue')}
                    />
                  )}
                  {state === 'flashcards' && <Flashcards terms={glossary} onBack={() => setState('glossary')} />}
                  {state === 'dialogue' && (
                    <DialogueSimulation 
                      domain={domain} 
                      lang1={sourceLang} 
                      lang2={targetLang} 
                      glossary={glossary} 
                      level={level}
                      onBack={() => setState('glossary')} 
                    />
                  )}
                  {state === 'analysis' && (
                    <DocumentAnalysis 
                      sourceLang={sourceLang} 
                      targetLang={targetLang} 
                      onAnalysisComplete={(terms) => {
                        setGlossary(prev => [...prev, ...terms]);
                        setState('glossary');
                      }} 
                    />
                  )}
                  {state === 'speakers' && <Speakers />}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer Actions */}
        <footer className="h-24 bg-white border-t border-slate-200 flex items-center justify-center gap-6 px-8 shrink-0 relative z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <Button 
            variant="outline" 
            className="h-14 px-8 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold rounded-2xl transition-all"
            onClick={() => setState('flashcards')}
          >
            <Layers className="mr-2 w-5 h-5" /> Flashcards
          </Button>
          <Button 
            className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95"
            onClick={() => setState('dialogue')}
          >
            <MessageSquare className="mr-2 w-6 h-6" /> Pratica Dialogica
          </Button>
          <Button 
            variant="outline" 
            className="h-14 px-8 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold rounded-2xl transition-all"
            onClick={() => setState('speakers')}
          >
            <Users className="mr-2 w-5 h-5" /> Relatori
          </Button>
        </footer>
        <Toaster theme="light" position="top-center" />
      </div>
    </TooltipProvider>
  );
}
