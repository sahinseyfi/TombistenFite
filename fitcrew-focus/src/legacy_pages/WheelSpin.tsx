import { useState } from 'react';
import { Lock, TrendingDown, Calendar } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import TreatWheel from '@/components/wheel/TreatWheel';
import ResultCard from '@/components/wheel/ResultCard';
import { TreatItem, TreatSpin } from '@/types';
import { mockTreatItems, mockEligibility, mockTreatSpins } from '@/services/mockData';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

const BONUS_WALK_OPTIONS = [0, 15, 20, 30, 60, 90] as const;
const BONUS_PROBABILITIES = [0.25, 0.25, 0.2, 0.15, 0.1, 0.05];
const PORTIONS = ['Küçük', 'Orta', 'Tam'] as const;

export default function WheelSpin() {
  const navigate = useNavigate();
  const [spins, setSpins] = useState<TreatSpin[]>(mockTreatSpins);
  const [selectedTreat, setSelectedTreat] = useState<TreatItem | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [portion] = useState<'Küçük' | 'Orta' | 'Tam'>(
    PORTIONS[Math.floor(Math.random() * PORTIONS.length)]
  );
  const [bonusWalk] = useState<number>(() => {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < BONUS_PROBABILITIES.length; i++) {
      cumulative += BONUS_PROBABILITIES[i];
      if (rand <= cumulative) {
        return BONUS_WALK_OPTIONS[i];
      }
    }
    return 0;
  });

  const eligibility = mockEligibility;
  const daysSinceLastSpin = spins.length > 0 ? 6 : 0;

  const handleSpinComplete = (treat: TreatItem) => {
    setSelectedTreat(treat);
    setResultDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedTreat) return;

    const newSpin: TreatSpin = {
      id: Date.now().toString(),
      treatId: selectedTreat.id,
      date: new Date().toISOString(),
      portion,
      bonusWalkMin: bonusWalk as 0 | 15 | 20 | 30 | 60 | 90,
      completed: false
    };

    setSpins([newSpin, ...spins]);
    setResultDialogOpen(false);
    navigate('/treat-history');
  };

  return (
    <MobileLayout title="Kaçamak Çarkı">
      <div className="p-4 space-y-6">
        {/* Status Card */}
        <div className="bg-card rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Son kaçamaktan beri</p>
                <p className="text-2xl font-bold text-success">
                  {eligibility.progressDeltaKg || 0} kg
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Geçen süre</p>
                <p className="text-2xl font-bold">{daysSinceLastSpin} gün</p>
              </div>
            </div>
          </div>

          {/* Eligibility Status */}
          {eligibility.eligible ? (
            <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center">
              <p className="text-success font-semibold">
                🎉 Hazır! İlerlemen bir ödülü hak ediyor.
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 border border-muted rounded-xl p-3 text-center flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {eligibility.reason || 'Kilitli: Henüz yeterli ilerleme yok'}
              </p>
            </div>
          )}
        </div>

        {/* Wheel */}
        <TreatWheel
          items={mockTreatItems}
          onSpinComplete={handleSpinComplete}
          disabled={!eligibility.eligible}
        />

        {/* Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Haftada en fazla 1 kez kullanılabilir
          </p>
          <p className="text-xs text-muted-foreground">
            Bu içerik tıbbi tavsiye değildir.
          </p>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-md mx-4 p-0 bg-transparent border-0">
          {selectedTreat && (
            <ResultCard
              treat={selectedTreat}
              portion={portion}
              bonusWalkMin={bonusWalk}
              onSave={handleSave}
              onClose={() => setResultDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
