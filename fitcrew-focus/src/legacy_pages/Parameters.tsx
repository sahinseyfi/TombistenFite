import { useState } from 'react';
import { Settings, TrendingDown, Clock, Calendar, Activity } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function Parameters() {
  const [params, setParams] = useState({
    weightLossKg: 0.8,
    weightLossPercent: 1,
    emaWindow: 7,
    cooldownDays: 4,
    weeklyLimit: 1,
    consistencyDays: 4,
    consistencyWindow: 7,
    bonusProbabilities: {
      0: 25,
      15: 25,
      20: 20,
      30: 15,
      60: 10,
      90: 5
    },
    plateauEnabled: false,
    plateauDays: 14,
    plateauMeasurements: 10,
    plateauRangeKg: 0.3,
    newUserEnabled: false,
    newUserDays: 7,
    newUserMeasurements: 5,
    newUserWeightLoss: 0.3
  });

  const totalProbability = Object.values(params.bonusProbabilities).reduce((a, b) => a + b, 0);

  return (
    <MobileLayout title="Parametreler">
      <div className="p-4 space-y-4">
        {/* Info */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Geliştirici Ayarları</p>
              <p className="text-xs text-muted-foreground">
                Bu panel sadece UI görüntüleme amaçlıdır. Değişiklikler kalıcı değildir.
              </p>
            </div>
          </div>
        </div>

        {/* Weight Thresholds */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Kilo Eşikleri</h3>
          </div>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label htmlFor="weightLoss">Minimum Kilo Düşüşü (kg)</Label>
              <Input
                id="weightLoss"
                type="number"
                step="0.1"
                value={params.weightLossKg}
                onChange={(e) => setParams({ ...params, weightLossKg: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="weightPercent">Yüzde Düşüş (%)</Label>
              <Input
                id="weightPercent"
                type="number"
                step="0.1"
                value={params.weightLossPercent}
                onChange={(e) => setParams({ ...params, weightLossPercent: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="emaWindow">EMA Penceresi (gün)</Label>
              <Input
                id="emaWindow"
                type="number"
                value={params.emaWindow}
                onChange={(e) => setParams({ ...params, emaWindow: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </Card>

        {/* Cooldown & Limits */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Bekleme & Limitler</h3>
          </div>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label htmlFor="cooldown">Cooldown (gün)</Label>
              <Input
                id="cooldown"
                type="number"
                value={params.cooldownDays}
                onChange={(e) => setParams({ ...params, cooldownDays: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="weekly">Haftalık Limit</Label>
              <Input
                id="weekly"
                type="number"
                value={params.weeklyLimit}
                onChange={(e) => setParams({ ...params, weeklyLimit: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </Card>

        {/* Consistency */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Ölçüm Tutarlılığı</h3>
          </div>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label htmlFor="consistencyDays">Minimum Gün Sayısı</Label>
              <Input
                id="consistencyDays"
                type="number"
                value={params.consistencyDays}
                onChange={(e) => setParams({ ...params, consistencyDays: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="consistencyWindow">Pencere (gün)</Label>
              <Input
                id="consistencyWindow"
                type="number"
                value={params.consistencyWindow}
                onChange={(e) => setParams({ ...params, consistencyWindow: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Son {params.consistencyWindow} günde ≥ {params.consistencyDays} gün ölçüm
              </p>
            </div>
          </div>
        </Card>

        {/* Bonus Walk Probabilities */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Bonus Yürüyüş Olasılıkları</h3>
          </div>
          <Separator />
          <div className="space-y-3">
            {Object.entries(params.bonusProbabilities).map(([min, prob]) => (
              <div key={min}>
                <Label htmlFor={`bonus-${min}`}>{min} dk (%)</Label>
                <Input
                  id={`bonus-${min}`}
                  type="number"
                  min="0"
                  max="100"
                  value={prob}
                  onChange={(e) => setParams({
                    ...params,
                    bonusProbabilities: {
                      ...params.bonusProbabilities,
                      [min]: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
            ))}
            <div className={`text-sm font-semibold ${totalProbability === 100 ? 'text-success' : 'text-destructive'}`}>
              Toplam: {totalProbability}% {totalProbability !== 100 && '⚠️ 100 olmalı'}
            </div>
          </div>
        </Card>

        {/* Plateau Spin */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Plateau Spin</h3>
            <Switch
              checked={params.plateauEnabled}
              onCheckedChange={(checked) => setParams({ ...params, plateauEnabled: checked })}
            />
          </div>
          {params.plateauEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div>
                  <Label htmlFor="plateauDays">Gün Sayısı</Label>
                  <Input
                    id="plateauDays"
                    type="number"
                    value={params.plateauDays}
                    onChange={(e) => setParams({ ...params, plateauDays: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="plateauMeasurements">Minimum Ölçüm</Label>
                  <Input
                    id="plateauMeasurements"
                    type="number"
                    value={params.plateauMeasurements}
                    onChange={(e) => setParams({ ...params, plateauMeasurements: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="plateauRange">EMA Aralığı (±kg)</Label>
                  <Input
                    id="plateauRange"
                    type="number"
                    step="0.1"
                    value={params.plateauRangeKg}
                    onChange={(e) => setParams({ ...params, plateauRangeKg: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* New User Spin */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Yeni Kullanıcı Spin</h3>
            <Switch
              checked={params.newUserEnabled}
              onCheckedChange={(checked) => setParams({ ...params, newUserEnabled: checked })}
            />
          </div>
          {params.newUserEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div>
                  <Label htmlFor="newUserDays">İlk Gün Sayısı</Label>
                  <Input
                    id="newUserDays"
                    type="number"
                    value={params.newUserDays}
                    onChange={(e) => setParams({ ...params, newUserDays: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="newUserMeasurements">Minimum Ölçüm</Label>
                  <Input
                    id="newUserMeasurements"
                    type="number"
                    value={params.newUserMeasurements}
                    onChange={(e) => setParams({ ...params, newUserMeasurements: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="newUserWeight">Minimum Düşüş (kg)</Label>
                  <Input
                    id="newUserWeight"
                    type="number"
                    step="0.1"
                    value={params.newUserWeightLoss}
                    onChange={(e) => setParams({ ...params, newUserWeightLoss: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </MobileLayout>
  );
}
