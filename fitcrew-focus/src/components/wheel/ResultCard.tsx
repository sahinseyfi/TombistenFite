import { useState } from 'react';
import { TreatItem, TreatSpin } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Share2, Save, Calendar, Footprints } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ResultCardProps {
  treat: TreatItem;
  portion: 'Küçük' | 'Orta' | 'Tam';
  bonusWalkMin: number;
  onSave: () => void;
  onClose: () => void;
}

export default function ResultCard({ treat, portion, bonusWalkMin, onSave, onClose }: ResultCardProps) {
  const [bonusCompleted, setBonusCompleted] = useState(false);

  const handleSave = () => {
    onSave();
    toast({
      title: 'Kaydedildi!',
      description: 'Kaçamak geçmişine eklendi.',
    });
  };

  const handleShare = () => {
    toast({
      title: 'Paylaşım özelliği yakında!',
      description: 'Bu özellik henüz aktif değil.',
    });
  };

  const portionDescriptions = {
    'Küçük': 'Küçük bir porsiyon - tadına bak!',
    'Orta': 'Orta boy porsiyon - keyifle tüket',
    'Tam': 'Tam porsiyon - hak ettin!'
  };

  const balanceTips = [
    'Gün içinde protein alımını artır',
    'Bol su tüketmeyi unutma',
    bonusWalkMin > 0 && `${bonusWalkMin} dk yürüyüş ile dengeye katkıda bulun`
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-card rounded-2xl shadow-glow overflow-hidden">
        {/* Image */}
        {treat.photoUrl && (
          <div className="relative h-48 bg-muted">
            <img
              src={treat.photoUrl}
              alt={treat.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">🎉 Bugünün Kaçamağı</h3>
            <p className="text-3xl font-bold text-primary">{treat.name}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              {portion} Porsiyon
            </Badge>
            {bonusWalkMin > 0 && (
              <Badge variant="default" className="px-4 py-2 text-sm gap-1">
                <Footprints className="w-4 h-4" />
                {bonusWalkMin} dk Yürüyüş
              </Badge>
            )}
            {treat.kcalHint && (
              <Badge variant="outline" className="px-4 py-2 text-sm">
                {treat.kcalHint}
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {portionDescriptions[portion]}
            </p>
          </div>

          {/* Balance Tips */}
          {balanceTips.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Denge Önerileri:</p>
              <ul className="space-y-1">
                {balanceTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bonus Walk Toggle */}
          {bonusWalkMin > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Bonus tamamlandı</span>
              </div>
              <Switch
                checked={bonusCompleted}
                onCheckedChange={setBonusCompleted}
              />
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleSave}
              className="w-full gradient-primary"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Paylaş
              </Button>
              <Button variant="outline" disabled>
                <Calendar className="w-4 h-4 mr-2" />
                Hatırlat
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Bu içerik tıbbi tavsiye değildir.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
