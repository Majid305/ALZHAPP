import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu";
import { Key, LogOut, User, Settings, Sun, Moon, Flower2, Snowflake, Check } from "lucide-react";

interface HeaderProps {
  user: any;
  onLogout: () => void;
  onLogin: () => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

export function Header({ user, onLogout, onLogin, theme, onThemeChange }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-transparent sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="bg-zinc-950 p-2.5 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_16px_-4px_rgba(0,0,0,0.5)] border border-zinc-800 flex items-center justify-center w-12 h-12 transform -rotate-6 group transition-all duration-300">
          <Key className="w-7 h-7 text-amber-400 fill-amber-500/20 drop-shadow-[0_2px_0_rgba(146,64,14,1)] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight leading-none">ALZHAPP</h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Mon Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl">
            <div className="px-2 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Thème
            </div>
            <DropdownMenuItem onClick={() => onThemeChange("default")} className="rounded-xl gap-2 cursor-pointer">
              <Sun className="w-4 h-4" /> 
              <span className="flex-1">Par défaut</span>
              {theme === "default" && <Check className="w-3 h-3" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onThemeChange("dark")} className="rounded-xl gap-2 cursor-pointer">
              <Moon className="w-4 h-4" /> 
              <span className="flex-1">Sombre</span>
              {theme === "dark" && <Check className="w-3 h-3" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onThemeChange("spring")} className="rounded-xl gap-2 cursor-pointer">
              <Flower2 className="w-4 h-4" /> 
              <span className="flex-1">Printemps</span>
              {theme === "spring" && <Check className="w-3 h-3" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onThemeChange("winter")} className="rounded-xl gap-2 cursor-pointer">
              <Snowflake className="w-4 h-4" /> 
              <span className="flex-1">Hiver</span>
              {theme === "winter" && <Check className="w-3 h-3" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user.displayName || "Utilisateur"}</p>
              <p className="text-[10px] text-muted-foreground">{user.email}</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={user.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.displayName?.charAt(0) || <User className="w-5 h-5" />}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <Button onClick={onLogin} className="rounded-full font-bold h-9">
            Se connecter
          </Button>
        )}
      </div>
    </header>
  );
}
