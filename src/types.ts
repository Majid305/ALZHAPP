export interface Note {
  id?: string;
  userId: string;
  content: string;
  type: "text" | "voice" | "photo" | "video" | "file";
  mediaUrl?: string;
  analysis: AlzhAnalysis;
  category: "important" | "note" | "task" | "reminder" | "place";
  createdAt: string;
}

export interface Reminder {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: "basse" | "moyenne" | "haute";
  status: "en_attente" | "termine";
  createdAt: string;
}

export interface Place {
  id?: string;
  userId: string;
  name: string;
  address?: string;
  description?: string;
  createdAt: string;
}

export interface AlzhAnalysis {
  summary: string;
  keyInfo: string[];
  category: "important" | "note" | "task" | "reminder" | "place";
  actions: {
    action: string;
    when: string;
    priority: "basse" | "moyenne" | "haute";
    explanation: string;
  }[];
  suggestReminder: boolean;
}
