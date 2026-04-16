import * as React from "react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { AlzhAnalysis } from "@/src/types";
import { CheckCircle2, Clock, AlertCircle, BellPlus, Send, Loader2, Mic } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { toast } from "sonner";

interface ActionDialogProps {
  analysis: AlzhAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateReminder: (action: AlzhAnalysis['actions'][0]) => void;
  onRefine: (input: string) => Promise<void>;
  isRefining?: boolean;
}

export function ActionDialog({ 
  analysis, 
  isOpen, 
  onClose, 
  onCreateReminder, 
  onRefine,
  isRefining = false 
}: ActionDialogProps) {
  const [refineText, setRefineText] = useState("");

  if (!analysis || !isOpen) return null;

  const handleRefine = () => {
    if (!refineText.trim()) return;
    onRefine(refineText);
    setRefineText("");
  };

  const handleVoiceComplete = (blob: Blob) => {
    // For now, we'll just send a generic signal or try to process it
    // But since the user wants to "talk", we should ideally transcribe it first.
    // Simplifying: User can use the main voice recorder. 
    // For here, let's just stick to text for now as refine is complex.
    toast.error("Vocal non supporté ici pour l'instant, utilise le texte.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              {analysis.category.toUpperCase()}
            </Badge>
            <h2 className="text-2xl font-bold leading-tight">{analysis.summary}</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                Ce qu'il faut retenir
              </h3>
              <ul className="space-y-2">
                {analysis.keyInfo.map((info, i) => (
                  <li key={i} className="flex items-start gap-2 text-lg">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" />
                Actions à faire
              </h3>
              <div className="space-y-3">
                {analysis.actions.map((action, i) => (
                  <div key={i} className="bg-muted p-4 rounded-2xl space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">{action.action}</span>
                        <Badge variant="outline" className="bg-background">
                          {action.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{action.when}</span>
                      </div>
                    </div>
                    <p className="text-sm opacity-90">{action.explanation}</p>
                    
                    <Button 
                      variant="secondary" 
                      className="w-full rounded-xl gap-2 font-semibold"
                      onClick={() => onCreateReminder(action)}
                    >
                      <BellPlus className="w-4 h-4" />
                      Créer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              Une remarque ou modification ?
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Dis-moi ce qu'il faut changer..." 
                className="rounded-xl h-11"
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                disabled={isRefining}
              />
              <Button 
                size="icon" 
                className="rounded-xl shrink-0 h-11 w-11"
                onClick={handleRefine}
                disabled={isRefining || !refineText.trim()}
              >
                {isRefining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full rounded-2xl h-12 text-lg font-bold" onClick={onClose} variant="outline">
              C'est compris, merci !
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
