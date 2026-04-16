import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Brain, Bell, MapPin, CheckSquare, XCircle, Gamepad2 } from "lucide-react";

interface TabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pb-6 pt-10 bg-gradient-to-t from-background/95 via-80% via-background/60 to-transparent z-40 pointer-events-none">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full pointer-events-auto">
        <TabsList className="grid grid-cols-6 h-22 rounded-[2rem] bg-muted/90 backdrop-blur-3xl shadow-2xl p-2 gap-2 border border-white/10">
          <TabsTrigger value="memory" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col gap-1 py-1 px-1 transition-all">
            <Brain className="w-8 h-8" />
            <span className="text-[10px] font-bold">Mémoire</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col gap-1 py-1 px-1 transition-all">
            <Bell className="w-8 h-8" />
            <span className="text-[10px] font-bold">Rappels</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col gap-1 py-1 px-1 transition-all">
            <CheckSquare className="w-8 h-8" />
            <span className="text-[10px] font-bold">Tâches</span>
          </TabsTrigger>
          <TabsTrigger value="places" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col gap-1 py-1 px-1 transition-all">
            <MapPin className="w-8 h-8" />
            <span className="text-[10px] font-bold">Lieux</span>
          </TabsTrigger>
          <TabsTrigger value="failed" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col gap-1 py-1 px-1 transition-all">
            <XCircle className="w-8 h-8" />
            <span className="text-[10px] font-bold">Ratés</span>
          </TabsTrigger>
          <TabsTrigger value="play" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col gap-1 py-1 px-1 transition-all">
            <Gamepad2 className="w-8 h-8" />
            <span className="text-[10px] font-bold">Jouer</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
