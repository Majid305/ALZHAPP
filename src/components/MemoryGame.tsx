import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { 
  Trophy, 
  RotateCcw, 
  Settings2, 
  Gamepad2,
  Apple, 
  Banana, 
  Cherry, 
  Grape, 
  IceCream, 
  Pizza, 
  Citrus, 
  Flame, 
  Cloud, 
  Sun, 
  Moon, 
  Star,
  Skull,
  Ghost,
  Cat,
  Dog,
  Car,
  Plane,
  Anchor,
  TreePine,
  Flower2,
  Leaf,
  Bike,
  Bus,
  Train,
  Wind,
  Zap,
  Heart,
  Music,
  Camera,
  Search,
  Key,
  Shield,
  Lightbulb,
  Bell,
  Puzzle,
  Gamepad,
  Dribbble,
  Flag,
  Coffee,
  Palette,
  Mic,
  Smile,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

const ICONS = [
  Apple, Banana, Cherry, Grape, IceCream, Pizza, Citrus, Flame, 
  Cloud, Sun, Moon, Star, Skull, Ghost, Cat, Dog, Car, Plane, 
  Anchor, TreePine, Flower2, Leaf, Bike, Bus, Train, Wind, 
  Zap, Heart, Music, Camera, Search, Key, Shield, Lightbulb, 
  Bell, Puzzle, Gamepad, Dribbble, Flag, Coffee, Palette, Mic, 
  Smile, Globe
];

type GridSize = 4 | 6 | 8;

interface MemoryCard {
  id: number;
  iconIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame() {
  const [gridSize, setGridSize] = useState<GridSize>(6);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  const totalPairs = (gridSize * gridSize) / 2;

  const initGame = useCallback((size: GridSize) => {
    const totalCards = size * size;
    const pairs = totalCards / 2;
    
    // Pick unique icons
    const selectedIcons = [...Array(ICONS.length).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairs);
    
    const initialCards: MemoryCard[] = [];
    [...selectedIcons, ...selectedIcons].forEach((iconIdx, index) => {
      initialCards.push({
        id: index,
        iconIndex: iconIdx,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Fisher-Yates Shuffle
    for (let i = initialCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialCards[i], initialCards[j]] = [initialCards[j], initialCards[i]];
    }

    setCards(initialCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setIsWon(false);
    setShowConfig(false);
  }, []);

  useEffect(() => {
    // Check for win only when matches state reaches totalPairs
    // and flipping back/matching logic is likely complete
    if (matches === totalPairs && totalPairs > 0) {
      const allMatched = cards.every(c => c.isMatched);
      if (allMatched) {
        const timer = setTimeout(() => setIsWon(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [matches, totalPairs, cards]);

  const handleCardClick = (index: number) => {
    // 1. All critical checks to prevent invalid turns
    if (flippedCards.length >= 2 || cards[index].isFlipped || cards[index].isMatched || isWon) return;

    // 2. Flip the card immediately
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], isFlipped: true };
    setCards(updatedCards);

    // 3. Handle matching logic
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].iconIndex === cards[secondIdx].iconIndex) {
        // MATCH FOUND
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[firstIdx] = { ...next[firstIdx], isMatched: true };
            next[secondIdx] = { ...next[secondIdx], isMatched: true };
            return next;
          });
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[firstIdx] = { ...next[firstIdx], isFlipped: false };
            next[secondIdx] = { ...next[secondIdx], isFlipped: false };
            return next;
          });
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  if (showConfig) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in zoom-in duration-500 min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 p-4 rounded-3xl w-fit mx-auto mb-4">
            <Gamepad2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black">Jeu de Mémoire</h2>
          <p className="text-muted-foreground font-medium">Choisis la taille de ta grille pour commencer</p>
        </div>

        <div className="grid gap-4 w-full max-w-xs">
          {[4, 6, 8].map((size) => (
            <Button 
              key={size}
              onClick={() => {
                setGridSize(size as GridSize);
                initGame(size as GridSize);
              }}
              className="h-16 text-xl font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
              variant={gridSize === size ? "default" : "outline"}
            >
              Mode {size}x{size}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 pb-32 pt-2">
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md p-5 rounded-[2rem] flex items-center justify-between border shadow-sm mb-2">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-left">Paires</span>
            <span className="text-xl font-black text-left">{matches} / {totalPairs}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-left">Coups</span>
            <span className="text-xl font-black text-left">{moves}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => initGame(gridSize)} className="rounded-xl h-12 w-12">
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowConfig(true)} className="rounded-xl h-12 w-12 text-left">
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div 
        className={cn(
          "grid gap-2 sm:gap-4 justify-center mx-auto",
          gridSize === 4 && "grid-cols-4",
          gridSize === 6 && "grid-cols-6",
          gridSize === 8 && "grid-cols-8"
        )}
      >
        {cards.map((card, index) => {
          const Icon = ICONS[card.iconIndex];
          return (
            <motion.div
              key={card.id}
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative cursor-pointer transition-all duration-300",
                gridSize === 4 ? "w-16 h-16 sm:w-24 sm:h-24" :
                gridSize === 6 ? "w-12 h-12 sm:w-20 sm:h-20" : 
                "w-8 h-8 sm:w-16 sm:h-16"
              )}
            >
              <div 
                className={cn(
                  "absolute inset-0 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-500 preserve-3d",
                  card.isFlipped || card.isMatched ? "rotate-y-180" : ""
                )}
              >
                {/* Back of card */}
                <div className={cn(
                  "absolute inset-0 bg-primary/20 border-primary/30 backface-hidden flex items-center justify-center rounded-lg sm:rounded-xl",
                  (card.isFlipped || card.isMatched) && "hidden"
                )}>
                  <div className="w-2 h-2 sm:w-4 sm:h-4 bg-primary/40 rounded-full animate-pulse" />
                </div>
                
                {/* Front of card */}
                <div className={cn(
                  "absolute inset-0 bg-card border-primary flex items-center justify-center rounded-lg sm:rounded-xl",
                  !(card.isFlipped || card.isMatched) && "hidden",
                  card.isMatched && "bg-green-100 border-green-500"
                )}>
                  <Icon className={cn(
                    "w-1/2 h-1/2",
                    card.isMatched ? "text-green-600" : "text-primary"
                  )} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl"
          >
            <Card className="p-8 w-full max-w-sm text-center space-y-6 shadow-2xl rounded-3xl border-4 border-primary">
              <div className="bg-primary p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                <Trophy className="w-12 h-12 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-black">Bravo !</h3>
              <p className="text-lg font-medium">Tu as trouvé toutes les paires en <span className="text-primary font-bold">{moves}</span> coups.</p>
              <div className="grid gap-3">
                <Button onClick={() => initGame(gridSize)} className="h-14 rounded-2xl text-xl font-bold">
                  Recommencer
                </Button>
                <Button variant="outline" onClick={() => setShowConfig(true)} className="h-14 rounded-2xl text-xl font-bold">
                  Choisir un autre mode
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
