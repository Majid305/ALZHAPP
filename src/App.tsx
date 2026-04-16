import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { InputSection } from "./components/InputSection";
import { TabsNavigation } from "./components/TabsNavigation";
import { MemoryGame } from "./components/MemoryGame";
import { NoteCard } from "./components/NoteCard";
import { ReminderItem } from "./components/ReminderItem";
import { PlaceCard } from "./components/PlaceCard";
import { EmptyState } from "./components/EmptyState";
import { ActionDialog } from "./components/ActionDialog";
import { EditReminderDialog } from "./components/EditReminderDialog";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { analyzeInput, refineAnalysis } from "./lib/gemini";
import { Note, Reminder, Place, AlzhAnalysis } from "./types";
import { ScrollArea } from "./components/ui/scroll-area";
import { format, isPast } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "./lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, updateDoc, onSnapshot, query, where, orderBy, doc, deleteDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("memory");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AlzhAnalysis | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("alzh-theme") || "default";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "spring", "winter");
    if (theme !== "default") {
      root.classList.add(theme);
    }
    localStorage.setItem("alzh-theme", theme);
  }, [theme]);

  // Mock data for now
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tasks, setTasks] = useState<Reminder[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [leisures, setLeisures] = useState<Reminder[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setReminders([]);
      setPlaces([]);
      return;
    }

    const qNotes = query(collection(db, "notes"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "notes"));

    const qReminders = query(collection(db, "reminders"), where("userId", "==", user.uid), orderBy("dueDate", "asc"));
    const unsubReminders = onSnapshot(qReminders, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "reminders"));

    const qPlaces = query(collection(db, "places"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubPlaces = onSnapshot(qPlaces, (snapshot) => {
      setPlaces(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "places"));

    const qTasks = query(collection(db, "tasks"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "tasks"));

    const qLeisures = query(collection(db, "leisures"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubLeisures = onSnapshot(qLeisures, (snapshot) => {
      setLeisures(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "leisures"));

    return () => {
      unsubNotes();
      unsubReminders();
      unsubTasks();
      unsubPlaces();
      unsubLeisures();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Connecté !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Déconnecté.");
    } catch (error) {
      console.error(error);
    }
  };

  const handleProcess = async (content: string, file?: File | Blob) => {
    if (!user) {
      toast.error("Connecte-toi pour enregistrer tes notes.");
      return;
    }

    setIsProcessing(true);
    try {
      let base64Data: string | undefined;
      let mimeType: string | undefined;

      if (file) {
        mimeType = file.type;
        const reader = new FileReader();
        base64Data = await new Promise((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });
      }

      const analysis = await analyzeInput(content, mimeType, base64Data);
      setCurrentAnalysis(analysis);
      setIsDialogOpen(true);

      const newNote: Note = {
        userId: user.uid,
        content,
        type: file ? (file.type.startsWith("image") ? "photo" : file.type.startsWith("video") ? "video" : "voice") : "text",
        analysis,
        category: analysis.category,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "notes"), newNote);

      // Automatic Routing based on Category
      if (analysis.category === "place") {
        const newPlace: Place = {
          userId: user.uid,
          name: analysis.summary,
          address: analysis.keyInfo[0] || "",
          description: analysis.keyInfo.join(". "),
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, "places"), newPlace);
        toast.success("Lieu enregistré dans 'Lieux' !");
      } else if (analysis.category === "reminder") {
        for (const action of analysis.actions) {
          const newItem: Reminder = {
            userId: user.uid,
            title: action.action,
            description: action.explanation,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            priority: action.priority,
            status: "en_attente",
            createdAt: new Date().toISOString(),
          };
          await addDoc(collection(db, "reminders"), newItem);
        }
        toast.success("Rappel(s) ajouté(s) dans 'Rappels' !");
      } else if (analysis.category === "task") {
        for (const action of analysis.actions) {
          const newItem: Reminder = {
            userId: user.uid,
            title: action.action,
            description: action.explanation,
            dueDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // Far future for tasks without date
            priority: action.priority,
            status: "en_attente",
            createdAt: new Date().toISOString(),
          };
          await addDoc(collection(db, "tasks"), newItem);
        }
        toast.success("Tâche(s) ajoutée(s) dans 'Tâches' !");
      } else if (analysis.category === "leisure") {
        for (const action of analysis.actions) {
          const newItem: Reminder = {
            userId: user.uid,
            title: action.action,
            description: action.explanation,
            dueDate: new Date().toISOString(),
            priority: action.priority,
            status: "en_attente",
            createdAt: new Date().toISOString(),
          };
          await addDoc(collection(db, "leisures"), newItem);
        }
        toast.success("Loisir ajouté !");
      }

      toast.success("Analyse terminée !");
    } catch (error) {
      console.error("Gemini Analysis Error Detail:", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de l'analyse.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateReminder = async (action: AlzhAnalysis['actions'][0]) => {
    if (!user || !currentAnalysis) return;

    try {
      const category = currentAnalysis.category;
      let collectionName = "reminders";
      let successMsg = "Rappel créé !";
      let dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      if (category === "task") {
        collectionName = "tasks";
        successMsg = "Tâche créée !";
        dueDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
      } else if (category === "place") {
        collectionName = "places";
        successMsg = "Lieu enregistré !";
        const newPlace: Place = {
          userId: user.uid,
          name: action.action,
          address: "",
          description: action.explanation,
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, "places"), newPlace);
        toast.success(successMsg);
        setIsDialogOpen(false);
        return;
      } else if (category === "leisure") {
        collectionName = "leisures";
        successMsg = "Loisir ajouté !";
        dueDate = new Date().toISOString();
      }

      const newItem: Reminder = {
        userId: user.uid,
        title: action.action,
        description: action.explanation,
        dueDate: dueDate,
        priority: action.priority,
        status: "en_attente",
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, collectionName), newItem);
      toast.success(successMsg);
      setIsDialogOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "creation");
    }
  };

  const toggleReminderStatus = async (id: string) => {
    const reminder = reminders.find(r => r.id === id) || tasks.find(t => t.id === id) || leisures.find(l => l.id === id);
    if (!reminder) return;

    let collectionName = "reminders";
    if (tasks.find(t => t.id === id)) collectionName = "tasks";
    if (leisures.find(l => l.id === id)) collectionName = "leisures";

    try {
      await updateDoc(doc(db, collectionName, id), {
        status: reminder.status === "en_attente" ? "termine" : "en_attente"
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      toast.success("Note supprimée.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteDoc(doc(db, "reminders", id));
      toast.success("Rappel supprimé.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      toast.success("Tâche supprimée.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const handleDeletePlace = async (id: string) => {
    try {
      await deleteDoc(doc(db, "places", id));
      toast.success("Lieu supprimé.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `places/${id}`);
    }
  };

  const handleDeleteLeisure = async (id: string) => {
    try {
      await deleteDoc(doc(db, "leisures", id));
      toast.success("Loisir supprimé.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leisures/${id}`);
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: Partial<Reminder>) => {
    // Check which collection it belongs to
    const isReminder = reminders.some(r => r.id === id);
    const isTask = tasks.some(t => t.id === id);
    let collectionName = "leisures";
    if (isReminder) collectionName = "reminders";
    if (isTask) collectionName = "tasks";

    try {
      await updateDoc(doc(db, collectionName, id), updates);
      toast.success("Modifications enregistrées.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  };

  const handleRefineAnalysis = async (input: string) => {
    if (!currentAnalysis) return;
    setIsRefining(true);
    try {
      const refined = await refineAnalysis(currentAnalysis, input);
      setCurrentAnalysis(refined);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour l'analyse.");
    } finally {
      setIsRefining(false);
    }
  };

  const activeReminders = reminders.filter(r => !isPast(new Date(r.dueDate)) || r.status === "termine");
  const activeTasks = tasks.filter(t => !isPast(new Date(t.dueDate)) || t.status === "termine");
  const failedItems = [
    ...reminders.filter(r => isPast(new Date(r.dueDate)) && r.status === "en_attente"),
    ...tasks.filter(t => isPast(new Date(t.dueDate)) && t.status === "en_attente")
  ].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-transparent flex flex-col max-w-2xl mx-auto relative pb-32">
        {/* Fully transparent layout to let themes shine through */}
        
        <Header 
          user={user} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          theme={theme}
          onThemeChange={setTheme}
        />

        <main className="flex-1 p-4 space-y-6 relative overflow-x-hidden">
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === "memory" && (
                <motion.div
                  key="memory"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <InputSection onProcess={handleProcess} isProcessing={isProcessing} />
                  
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black px-2">Ma Mémoire</h2>
                    {notes.length === 0 ? (
                      <EmptyState 
                        title="Ta mémoire est vide" 
                        description="Note quelque chose, prends une photo ou enregistre ta voix pour commencer." 
                      />
                    ) : (
                      notes.map((note) => (
                        <div key={note.id}>
                          <NoteCard note={note} onDelete={handleDeleteNote} />
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "reminders" && (
                <motion.div
                  key="reminders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-black px-2">Mes Rappels</h2>
                  {activeReminders.length === 0 ? (
                    <EmptyState 
                      title="Aucun rappel en cours" 
                      description="Tes futurs rappels s'afficheront ici." 
                    />
                  ) : (
                    activeReminders.map((reminder) => (
                      <div key={reminder.id}>
                        <ReminderItem 
                          reminder={reminder} 
                          onToggleStatus={toggleReminderStatus} 
                          onDelete={handleDeleteReminder}
                          onEdit={handleEditReminder}
                        />
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "tasks" && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-black px-2">Mes Tâches</h2>
                  {activeTasks.length === 0 ? (
                    <EmptyState 
                      title="Pas de tâches en cours" 
                      description="Tes tâches à venir s'afficheront ici." 
                    />
                  ) : (
                    activeTasks.map((task) => (
                      <div key={task.id}>
                        <ReminderItem 
                          reminder={task} 
                          onToggleStatus={toggleReminderStatus} 
                          onDelete={handleDeleteTask}
                          onEdit={handleEditReminder}
                        />
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "failed" && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-destructive"
                >
                  <h2 className="text-2xl font-black px-2 flex items-center gap-2">
                    Mes Ratés
                  </h2>
                  {failedItems.length === 0 ? (
                    <div className="text-center p-12 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                      <p className="text-lg font-bold text-muted-foreground">Bravo ! Rien n'a été manqué.</p>
                    </div>
                  ) : (
                    failedItems.map((item) => (
                      <div key={item.id}>
                        <ReminderItem 
                          reminder={item} 
                          onToggleStatus={toggleReminderStatus} 
                          onDelete={reminders.some(r => r.id === item.id) ? handleDeleteReminder : handleDeleteTask}
                          onEdit={handleEditReminder}
                        />
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "play" && (
                <motion.div
                  key="play"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <MemoryGame />
                </motion.div>
              )}

              {activeTab === "places" && (
                <motion.div
                  key="places"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-black px-2 text-white drop-shadow-md">Mes Lieux</h2>
                  {places.length === 0 ? (
                    <EmptyState 
                      title="Aucun lieu" 
                      description="Enregistre les adresses importantes pour les retrouver facilement." 
                    />
                  ) : (
                    places.map((place) => (
                      <div key={place.id}>
                        <PlaceCard place={place} onDelete={handleDeletePlace} />
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "leisure" && (
                <motion.div
                  key="leisure"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-black px-2 text-white drop-shadow-md">Mes Loisirs</h2>
                  {leisures.length === 0 ? (
                    <EmptyState 
                      title="Rien à signaler" 
                      description="Suis ici tes nouveautés Facebook, Instagram et tes loisirs." 
                    />
                  ) : (
                    leisures.map((item) => (
                      <div key={item.id}>
                        <ReminderItem 
                          reminder={item} 
                          onToggleStatus={toggleReminderStatus} 
                          onDelete={handleDeleteLeisure}
                          onEdit={handleEditReminder}
                        />
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <ActionDialog 
          analysis={currentAnalysis} 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
          onCreateReminder={handleCreateReminder}
          onRefine={handleRefineAnalysis}
          isRefining={isRefining}
        />

        <EditReminderDialog
          reminder={editingReminder}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveEdit}
        />
        
        <Toaster position="top-center" />
      </div>
    </ErrorBoundary>
  );
}
