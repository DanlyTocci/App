/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GlossaryTerm, SimulationFeedback, DialogueSimulation, LanguageLevel, SpeakerInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Cleans the response text from Gemini, removing markdown code blocks if present.
 */
function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks like ```json ... ``` or ``` ... ```
  return text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
}

export async function generateGlossary(
  domain: string, 
  sourceLang: string, 
  targetLang: string, 
  termCount: number = 10
): Promise<GlossaryTerm[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate a glossary of EXACTLY ${termCount} specialized terms for conference interpreting in the domain: "${domain}". 
      It is CRITICAL that you provide exactly ${termCount} terms.
      Source language: ${sourceLang}. Target language: ${targetLang}.
      For each term, provide:
      - The term in ${sourceLang}
      - Its translation in ${targetLang}
      - A short context of use IN ${targetLang} (the target language, NOT Italian unless it is the target language)
      - A link to hear the pronunciation (use: https://translate.google.com/?sl=auto&tl=en&text=[TERM]&op=translate where [TERM] is the term in the source language).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              translation: { type: Type.STRING },
              context: { type: Type.STRING },
              pronunciationUrl: { type: Type.STRING },
            },
            required: ["term", "translation", "context", "pronunciationUrl"],
          },
        },
      },
    });

    const cleanedText = cleanJsonResponse(response.text || "[]");
    const terms = JSON.parse(cleanedText);
    return Array.isArray(terms) ? terms.slice(0, termCount) : [];
  } catch (e) {
    console.error("Error generating glossary:", e);
    return [];
  }
}

export async function getSimulationFeedback(transcript: string, glossary: GlossaryTerm[]): Promise<SimulationFeedback> {
  const terms = glossary.map(g => `${g.term} (${g.translation})`).join(", ");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analyze the following interpretation transcript for an interpreting student.
      Target Glossary Terms to check: ${terms}
      
      Transcript: "${transcript}"
      
      Provide feedback on:
      1. Terminology: Which key terms were used correctly or missed.
      2. Fluency: General flow and professional tone.
      3. Suggestions: Specific advice for improvement.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            terminology: { type: Type.ARRAY, items: { type: Type.STRING } },
            fluency: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["terminology", "fluency", "suggestions"],
        },
      },
    });

    const cleanedText = cleanJsonResponse(response.text || "{}");
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Error getting simulation feedback:", e);
    return { terminology: [], fluency: "Errore nell'analisi della fluidità", suggestions: [] };
  }
}

export async function generateDialogueSimulation(
  domain: string, 
  lang1: string, 
  lang2: string, 
  terms: GlossaryTerm[],
  level: LanguageLevel = 'B2'
): Promise<DialogueSimulation> {
  const termList = terms.map(t => t.term).join(", ");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Create a professional and challenging dialogue simulation for a consecutive interpreting exercise.
      Domain: ${domain}
      Languages: ${lang1} and ${lang2}
      Difficulty Level: ${level} (CEFR)
      Include these terms if possible: ${termList}
      
      The simulation should have:
      1. A detailed scenario description.
      2. A series of turns (at least 10-12 turns) alternating between speakers in the two languages.
      3. The language should be sophisticated, with complex sentence structures and professional register appropriate for the ${level} level.
      4. Each turn should be substantial (2-4 sentences) to provide a real challenge for consecutive interpreting.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            turns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                  language: { type: Type.STRING },
                },
                required: ["speaker", "text", "language"],
              },
            },
          },
          required: ["scenario", "turns"],
        },
      },
    });

    const cleanedText = cleanJsonResponse(response.text || "{}");
    const data = JSON.parse(cleanedText);
    if (!data.turns || !Array.isArray(data.turns)) {
      throw new Error("Invalid dialogue simulation format: missing turns");
    }
    return data;
  } catch (e) {
    console.error("Error generating dialogue simulation:", e);
    throw e; // Re-throw to be caught by the component and show toast
  }
}

export async function analyzeDocument(text: string, sourceLang: string, targetLang: string): Promise<GlossaryTerm[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analyze the following document text and extract the most important specialized terms for a conference interpreter.
      Source language: ${sourceLang}. Target language: ${targetLang}.
      
      Document text:
      """
      ${text}
      """
      
      For each term, provide:
      - The term in ${sourceLang}
      - Its translation in ${targetLang}
      - A short context of use IN ${targetLang}
      - A link to hear the pronunciation (use: https://translate.google.com/?sl=auto&tl=en&text=[TERM]&op=translate where [TERM] is the term in the source language).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              translation: { type: Type.STRING },
              context: { type: Type.STRING },
              pronunciationUrl: { type: Type.STRING },
            },
            required: ["term", "translation", "context", "pronunciationUrl"],
          },
        },
      },
    });

    const cleanedText = cleanJsonResponse(response.text || "[]");
    const terms = JSON.parse(cleanedText);
    return Array.isArray(terms) ? terms : [];
  } catch (e) {
    console.error("Error analyzing document:", e);
    return [];
  }
}

export async function extractSpeakerInfo(text: string): Promise<SpeakerInfo[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analyze the following document text and extract information about the speakers/presenters mentioned.
      
      Document text:
      """
      ${text}
      """
      
      For each speaker, provide:
      - name: Full name
      - role: Professional title or role at the conference
      - bio: A brief biography or background info
      - topics: A list of topics they are likely to discuss based on the text.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              bio: { type: Type.STRING },
              topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "role", "bio", "topics"],
          },
        },
      },
    });

    const cleanedText = cleanJsonResponse(response.text || "[]");
    const speakers = JSON.parse(cleanedText);
    return Array.isArray(speakers) ? speakers : [];
  } catch (e) {
    console.error("Error extracting speaker info:", e);
    return [];
  }
}
