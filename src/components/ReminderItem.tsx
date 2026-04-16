import * as React from "react";
import { Reminder } from "@/src/types";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Clock, AlertTriangle, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface ReminderItemProps {
  reminder: Reminder;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (reminder: Reminder) => void;
}

export function ReminderItem({ reminder, onToggleStatus, onDelete, onEdit }: ReminderItemProps) {
  const isOverdue = isPast(new Date(reminder.dueDate)) && reminder.status === "en_attente";
  
  const priorityColors = {
    basse: "bg-blue-100 text-blue-700",
    moyenne: "bg-yellow-100 text-yellow-700",
    haute: "bg-red-100 text-red-700",
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer backdrop-blur-md",
        reminder.status === "termine" ? "bg-muted/30 border-transparent opacity-60" : "bg-card/60 border-muted hover:border-primary/30",
        isOverdue && "border-red-200 bg-red-50/40"
      )}
      onClick={() => reminder.id && onToggleStatus?.(reminder.id)}
    >
      <div className={cn(
        "mt-1 p-2 rounded-full",
        reminder.status === "termine" ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
      )}>
        <Bell className="w-5 h-5" />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            "font-semibold text-lg leading-tight",
            reminder.status === "termine" && "line-through"
          )}>
            {reminder.title}
          </h3>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className={cn("text-[10px]", priorityColors[reminder.priority])}>
              {reminder.priority}
            </Badge>
            <div className="flex items-center">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(reminder);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {onDelete && reminder.id && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(reminder.id!);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {reminder.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {reminder.description}
          </p>
        )}
        
        <div className="flex items-center gap-3 pt-1">
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isOverdue ? "text-red-600" : "text-muted-foreground"
          )}>
            <Clock className="w-3 h-3" />
            <span>{format(new Date(reminder.dueDate), "d MMMM 'à' HH:mm", { locale: fr })}</span>
          </div>
          
          {isOverdue && (
            <div className="flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>En retard</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
