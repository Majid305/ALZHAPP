import * as React from "react";
import { useState, useEffect } from "react";
import { Reminder } from "@/src/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

interface EditReminderDialogProps {
  reminder: Reminder | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Reminder>) => void;
}

export function EditReminderDialog({ reminder, isOpen, onClose, onSave }: EditReminderDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Reminder["priority"]>("moyenne");

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setDescription(reminder.description || "");
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      const date = new Date(reminder.dueDate);
      const formattedDate = date.toISOString().slice(0, 16);
      setDueDate(formattedDate);
      setPriority(reminder.priority);
    }
  }, [reminder, isOpen]);

  const handleSave = () => {
    if (!reminder?.id) return;
    onSave(reminder.id, {
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      priority,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Modifier le rappel</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-bold">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="font-bold">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl min-h-[100px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate" className="font-bold">Date et heure</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority" className="font-bold">Priorité</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choisir une priorité" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="basse">Basse</SelectItem>
                <SelectItem value="moyenne">Moyenne</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button>
          <Button onClick={handleSave} className="rounded-xl font-bold">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
