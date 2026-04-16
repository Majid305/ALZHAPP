import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Note } from "@/src/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Mic, Image as ImageIcon, Video, File, AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
}

const typeIcons = {
  text: FileText,
  voice: Mic,
  photo: ImageIcon,
  video: Video,
  file: File,
};

const categoryColors = {
  important: "bg-red-100 text-red-700 border-red-200",
  note: "bg-blue-100 text-blue-700 border-blue-200",
  task: "bg-green-100 text-green-700 border-green-200",
  reminder: "bg-yellow-100 text-yellow-700 border-yellow-200",
  place: "bg-purple-100 text-purple-700 border-purple-200",
};

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const Icon = typeIcons[note.type] || FileText;
  const analysis = note.analysis;

  return (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors glass-card">
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-full">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(note.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={categoryColors[note.category]}>
              {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
            </Badge>
            {onDelete && note.id && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(note.id!)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <CardTitle className="text-lg font-medium leading-tight">
          {analysis.summary}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.keyInfo.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              À retenir :
            </h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              {analysis.keyInfo.map((info, i) => (
                <li key={i}>{info}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.actions.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Actions proposées :
            </h4>
            <div className="space-y-3">
              {analysis.actions.map((action, i) => (
                <div key={i} className="bg-muted/50 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{action.action}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {action.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{action.when}</span>
                  </div>
                  <p className="text-xs italic opacity-80">{action.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
