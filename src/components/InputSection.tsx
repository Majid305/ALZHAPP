import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Card, CardContent } from "@/src/components/ui/card";
import { Image as ImageIcon, Video, File, Send, Loader2, X } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { cn } from "@/src/lib/utils";

interface InputSectionProps {
  onProcess: (content: string, file?: File | Blob) => Promise<void>;
  isProcessing: boolean;
}

export function InputSection({ onProcess, isProcessing }: InputSectionProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setFileName(acceptedFiles[0].name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': [],
      'audio/*': []
    }
  } as any);

  const handleVoiceComplete = (blob: Blob) => {
    setSelectedFile(blob);
    setFileName("Enregistrement vocal.webm");
  };

  const handleSubmit = async () => {
    if (!text && !selectedFile) return;
    await onProcess(text, selectedFile || undefined);
    setText("");
    setSelectedFile(null);
    setFileName(null);
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg glass-card overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="relative glass-input p-3 rounded-xl">
          <Textarea
            placeholder="Note quelque chose ici... (ex: 'Rappelle-moi d'acheter du pain')"
            className="min-h-[120px] text-lg resize-none border-none focus-visible:ring-0 p-0 bg-transparent"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
          />
          
          {fileName && (
            <div className="mt-2 flex items-center gap-2 bg-muted p-2 rounded-lg text-sm">
              <div className="flex-1 truncate font-medium">{fileName}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => {
                  setSelectedFile(null);
                  setFileName(null);
                }}
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-primary/10" disabled={isProcessing}>
                <ImageIcon className="w-6 h-6 text-primary" />
              </Button>
            </div>
            
            <VoiceRecorder onRecordingComplete={handleVoiceComplete} isProcessing={isProcessing} />

            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-primary/10" disabled={isProcessing}>
              <Video className="w-6 h-6 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-primary/10" disabled={isProcessing}>
              <File className="w-6 h-6 text-primary" />
            </Button>
          </div>

          <Button 
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center font-bold" 
            onClick={handleSubmit}
            disabled={isProcessing || (!text && !selectedFile)}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {isDragActive && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center rounded-xl border-2 border-dashed border-primary z-10">
            <p className="font-bold text-primary">Dépose ton fichier ici</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
