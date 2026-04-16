import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Brain, Bell, MapPin, CheckSquare, XCircle, Gamepad2, Coffee } from "lucide-react";

interface TabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-2 pb-10 pt-10 bg-gradient-to-t from-background/40 to-transparent z-40 pointer-events-none">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full pointer-events-auto">
        <TabsList className="grid grid-cols-7 bg-transparent border-none gap-0.5 sm:gap-4 h-auto shadow-none">
          <TabsTrigger value="memory" className="rounded-2xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-1 sm:gap-1.5 py-2 px-1 transition-all hover:scale-110">
            <Brain className="w-6 h-6 sm:w-10 sm:h-10" />
            <span className="text-[7px] sm:text-[10px] font-bold">Mémoire</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="rounded-2xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-1 sm:gap-1.5 py-2 px-1 transition-all hover:scale-110">
            <Bell className="w-6 h-6 sm:w-10 sm:h-10" />
            <span className="text-[7px] sm:text-[10px] font-bold">Rappels</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-2xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-1 sm:gap-1.5 py-2 px-1 transition-all hover:scale-110">
            <CheckSquare className="w-6 h-6 sm:w-10 sm:h-10" />
            <span className="text-[7px] sm:text-[10px] font-bold">Tâches</span>
          </TabsTrigger>
          <TabsTrigger value="places" className="rounded-2xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-1 sm:gap-1.5 py-2 px-1 transition-all hover:scale-110">
            <MapPin className="w-6 h-6 sm:w-10 sm:h-10" />
            <span className="text-[7px] sm:text-[10px] font-bold">Lieux</span>
          </TabsTrigger>
          <TabsTrigger value="leisure" className="rounded-2xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-1 sm:gap-1.5 py-2 px-1 transition-all hover:scale-110">
            <Coffee className="w-6 h-6 sm:w-10 sm:h-10" />
            <span className="text-[7px] sm:text-[10px] font-bold">Loisirs</span>
          </TabsTrigger>
          <TabsTrigger value="failed" className="rounded-2xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-1 sm:gap-1.5 py-2 px-1 transition-all hover:scale-110">
            <XCircle className="w-6 h-6 sm:w-10 sm:h-10" />
            <span className="text-[7px] sm:text-[10px] font-bold">Ratés</span>
          </TabsTrigger>
          <TabsTrigger value="play" className="rounded-2xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-1 sm:gap-1.5 py-2 px-1 transition-all hover:scale-110">
            <Gamepad2 className="w-6 h-6 sm:w-10 sm:h-10" />
            <span className="text-[7px] sm:text-[10px] font-bold">Jouer</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
