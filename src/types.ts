/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageLevel = 'B1' | 'B2' | 'C1' | 'C2';

export interface GlossaryTerm {
  term: string;
  translation: string;
  context: string;
  pronunciationUrl: string;
}

export interface SimulationFeedback {
  terminology: string[];
  fluency: string;
  suggestions: string[];
}

export interface DialogueTurn {
  speaker: string;
  text: string;
  language: string;
}

export interface DialogueSimulation {
  scenario: string;
  turns: DialogueTurn[];
}

export interface SpeakerInfo {
  name: string;
  role: string;
  bio: string;
  topics: string[];
}

export type AppState = 'setup' | 'glossary' | 'flashcards' | 'dialogue' | 'analysis' | 'speakers';
