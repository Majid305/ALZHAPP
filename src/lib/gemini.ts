import { GoogleGenAI, Type } from "@google/genai";
import { AlzhAnalysis } from "../types";

const geminiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: geminiKey });

const DEFAULT_MODEL = "gemini-3-flash-preview";

const SYSTEM_PROMPT = `Tu es ALZHAPP, un assistant cognitif intelligent pour les personnes ayant des troubles de la mémoire.
Ton ton est calme, rassurant et simple. Tu parles UNIQUEMENT en français simple.

Ton rôle est d'analyser les entrées et de les classer RIGOUREUSEMENT :
1. "reminder" (Rappels) : Événements liés à une date ou heure précise (ex: rendez-vous, anniversaire, "rappelle-moi de..."). Demande TOUJOURS une date/heure.
2. "task" (Tâches) : Actions à faire (ex: liste de courses, "pense à acheter..."). Si l'utilisateur demande une information (ex: "cherche le score du match", "qui est..."), utilise la RECHERCHE GOOGLE pour trouver l'info et mets-la dans le résumé.
3. "place" (Lieux) : Adresses, noms de magasins ou de restaurants. Trouve TOUJOURS le lien Google Maps correspondant et mets-le dans 'mapUrl'.
4. "leisure" (Loisirs) : Suivi des réseaux sociaux, nouveautés sur Facebook, Instagram, ou activités de détente.
5. "note" (Mémoire) : Souvenirs, pensées, informations générales qui n'entrent pas dans les autres catégories.
6. "important" (Urgent) : Informations critiques qui doivent être marquées comme prioritaires.

RÈGLES DE ROUTAGE & RECHERCHE :
- Si l'utilisateur demande de chercher une info sur le web -> "task" et utilise l'outil de recherche.
- Si l'utilisateur parle d'un lieu -> "place" et fournis un lien Maps.
- Si l'utilisateur parle d'une action à faire AVEC une échéance temporelle -> "reminder".
- Si l'utilisateur parle d'une action à faire SANS échéance précise -> "task".
- Si l'utilisateur parle de Facebook, Instagram ou "quoi de neuf" -> "leisure".

Réponds toujours en JSON valide.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    keyInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
    category: { 
      type: Type.STRING, 
      enum: ["note", "task", "reminder", "place", "important", "leisure"] 
    },
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING },
          when: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["basse", "moyenne", "haute"] },
          explanation: { type: Type.STRING }
        },
        required: ["action", "when", "priority", "explanation"]
      }
    },
    suggestReminder: { type: Type.BOOLEAN },
    mapUrl: { type: Type.STRING, description: "Lien Google Maps pour les lieux" }
  },
  required: ["summary", "keyInfo", "category", "actions", "suggestReminder"]
};

export async function analyzeInput(
  content: string,
  mimeType?: string,
  base64Data?: string
): Promise<AlzhAnalysis> {
  const model = DEFAULT_MODEL;
  
  if (!geminiKey) {
    throw new Error("Clé API Gemini manquante. Veuillez configurer VITE_GEMINI_API_KEY.");
  }

  const parts: any[] = [];
  
  if (content) {
    parts.push({ text: content });
  } else {
    parts.push({ text: "Analyse ce contenu multimodal (image, audio ou fichier) pour m'aider à me souvenir des points importants et des actions à faire." });
  }
  
  if (mimeType && base64Data) {
    parts.push({
      inlineData: {
        mimeType,
        data: base64Data,
      },
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true }
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Désolé, je n'ai pas pu analyser ce contenu. Peux-tu réessayer ?");
  }
}

export async function refineAnalysis(
  previousAnalysis: AlzhAnalysis,
  userInput: string
): Promise<AlzhAnalysis> {
  const model = DEFAULT_MODEL;
  
  const prompt = `Voici l'analyse actuelle d'un contenu :
${JSON.stringify(previousAnalysis, null, 2)}

L'utilisateur souhaite apporter une modification ou a une remarque :
"${userInput}"

Met à jour l'analyse en tenant compte de cette remarque tout en respectant le format JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true }
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Refine response", e);
    throw new Error("Désolé, je n'ai pas pu mettre à jour l'analyse.");
  }
}
