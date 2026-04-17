import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Place } from "@/src/types";
import { MapPin, Navigation, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface PlaceCardProps {
  place: Place;
  onDelete?: (id: string) => void;
}

export function PlaceCard({ place, onDelete }: PlaceCardProps) {
  const openInMaps = () => {
    if (place.mapUrl) {
      window.open(place.mapUrl, '_blank');
    } else if (place.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`, '_blank');
    }
  };

  return (
    <Card className="border-2 hover:border-primary/30 transition-all overflow-hidden glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary mb-1">
              <MapPin className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Lieu enregistré</span>
            </div>
            <CardTitle className="text-xl font-bold">{place.name}</CardTitle>
          </div>
          {onDelete && place.id && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(place.id!)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(place.address || place.mapUrl) && (
          <div className="bg-muted/50 p-3 rounded-xl space-y-2">
            {place.address && <p className="text-sm font-medium">{place.address}</p>}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full rounded-lg gap-2 bg-background"
              onClick={openInMaps}
            >
              <Navigation className="w-4 h-4" />
              Y aller
            </Button>
          </div>
        )}
        
        {place.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {place.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
