import { Brain, Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
      <div className="relative">
        <div className="bg-primary/10 p-6 rounded-full">
          <Brain className="w-12 h-12 text-primary/40" />
        </div>
        <Sparkles className="w-6 h-6 text-primary absolute -top-1 -right-1 animate-pulse" />
      </div>
      <div className="max-w-xs space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
