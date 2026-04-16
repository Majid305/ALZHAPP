import { GoogleGenAI, Type } from "@google/genai";
import { AlzhAnalysis } from "../types";

const geminiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: geminiKey });

const DEFAULT_MODEL = "gemini-3-flash-preview";

const SYSTEM_PROMPT = `Tu es ALZHAPP, un assistant cognitif intelligent pour les personnes ayant des troubles de la mémoire.
Ton ton est calme, rassurant et simple. Tu parles UNIQUEMENT en français simple.

Ton rôle est d'analyser les entrées et de les classer RIGOUREUSEMENT :
1. "reminder" (Rappels) : Événements liés à une date ou heure précise (ex: rendez-vous, anniversaire, "rappelle-moi de...").
2. "task" (Tâches) : Actions à faire sans date précise ou informations utiles à conserver (ex: liste de courses, résultat de match, "pense à acheter...").
3. "place" (Lieux) : Adresses, noms de magasins ou de restaurants, "où se trouve...", "enregistre l'endroit...".
4. "note" (Mémoire) : Souvenirs, pensées, informations générales qui n'entrent pas dans les autres catégories.
5. "important" (Urgent) : Informations critiques qui doivent être marquées comme prioritaires.

RÈGLES :
- Pour les résultats de sport, cherche/génère l'info et mets-la dans 'summary', classe en "task".
- Pour les adresses, classe TOUJOURS en "place".
- Réponds toujours en JSON valide.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    keyInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
    category: { 
      type: Type.STRING, 
      enum: ["note", "task", "reminder", "place", "important"] 
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
    suggestReminder: { type: Type.BOOLEAN }
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
      responseSchema: RESPONSE_SCHEMA
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
      responseSchema: RESPONSE_SCHEMA
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Refine response", e);
    throw new Error("Désolé, je n'ai pas pu mettre à jour l'analyse.");
  }
}
