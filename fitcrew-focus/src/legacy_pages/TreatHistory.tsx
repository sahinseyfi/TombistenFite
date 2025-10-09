import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Calendar, TrendingDown, Footprints } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/ui/empty-state';
import { mockTreatSpins, mockTreatItems, mockMeasurements } from '@/services/mockData';

export default function TreatHistory() {
  const [timeFilter, setTimeFilter] = useState<'1m' | '3m' | '6m' | 'all'>('3m');
  const spins = mockTreatSpins;

  // Combine weight data with spin markers
  const chartData = mockMeasurements.map(m => {
    const spin = spins.find(s => s.date.startsWith(m.date));
    return {
      date: m.date,
      weight: m.weightKg,
      spin: spin ? {
        id: spin.id,
        treatName: mockTreatItems.find(t => t.id === spin.treatId)?.name,
        portion: spin.portion,
        bonusWalkMin: spin.bonusWalkMin
      } : null
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold mb-1">{data.date}</p>
        <p className="text-sm">Kilo: {data.weight} kg</p>
        {data.spin && (
          <div className="mt-2 pt-2 border-t border-border space-y-1">
            <p className="text-sm font-semibold text-primary">📍 {data.spin.treatName}</p>
            <p className="text-xs text-muted-foreground">Porsiyon: {data.spin.portion}</p>
            {data.spin.bonusWalkMin > 0 && (
              <p className="text-xs text-muted-foreground">
                Bonus: {data.spin.bonusWalkMin} dk yürüyüş
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <MobileLayout title="Kaçamak Geçmişi">
      <div className="p-4 space-y-4">
        {/* Time Filter */}
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="1m">1A</TabsTrigger>
            <TabsTrigger value="3m">3A</TabsTrigger>
            <TabsTrigger value="6m">6A</TabsTrigger>
            <TabsTrigger value="all">Tümü</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Chart */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Kilo Eğrisi & Kaçamak İşaretleri
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('tr-TR', { month: 'short' })}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              />
              {chartData.map((point, idx) =>
                point.spin ? (
                  <ReferenceDot
                    key={idx}
                    x={point.date}
                    y={point.weight || 0}
                    r={6}
                    fill="hsl(var(--destructive))"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            📍 Kırmızı işaretler kaçamak günlerini gösterir
          </p>
        </Card>

        {/* History List */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Geçmiş
          </h3>

          {spins.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Henüz Kaçamak Yok"
              description="İlk çark çevirişinden sonra geçmişin burada görünecek."
            />
          ) : (
            spins.map((spin) => {
              const treat = mockTreatItems.find(t => t.id === spin.treatId);
              if (!treat) return null;

              return (
                <Card key={spin.id} className="p-4">
                  <div className="flex gap-3">
                    {treat.photoUrl && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={treat.photoUrl}
                          alt={treat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{treat.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(spin.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {spin.portion}
                        </Badge>
                        {spin.bonusWalkMin > 0 && (
                          <Badge variant={spin.completed ? 'default' : 'outline'} className="text-xs gap-1">
                            <Footprints className="w-3 h-3" />
                            {spin.bonusWalkMin} dk
                            {spin.completed && ' ✓'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
