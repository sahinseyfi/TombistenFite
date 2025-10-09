import { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockMeasurements } from '@/services/mockData';
import { TrendingDown, Target, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimeFilter = '1m' | '3m' | '6m' | 'all';

export default function Analytics() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('6m');

  const filters: { value: TimeFilter; label: string }[] = [
    { value: '1m', label: '1A' },
    { value: '3m', label: '3A' },
    { value: '6m', label: '6A' },
    { value: 'all', label: 'Tümü' }
  ];

  const latestWeight = mockMeasurements[mockMeasurements.length - 1]?.weightKg || 0;
  const firstWeight = mockMeasurements[0]?.weightKg || 0;
  const weightChange = latestWeight - firstWeight;

  return (
    <MobileLayout title="Grafikler">
      <div className="p-4 space-y-6">
        {/* Time Filters */}
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={timeFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter(filter.value)}
              className={cn(
                'flex-1',
                timeFilter === filter.value && 'gradient-primary'
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Son Ölçüm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestWeight} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Değişim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                weightChange < 0 ? "text-success" : "text-warning"
              )}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Kilo Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockMeasurements}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { month: 'short' })}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="weightKg" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Measurements Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vücut Ölçüleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockMeasurements}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { month: 'short' })}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR')}
                />
                <Line type="monotone" dataKey="waistCm" stroke="hsl(var(--primary))" strokeWidth={2} name="Bel" />
                <Line type="monotone" dataKey="chestCm" stroke="hsl(var(--secondary))" strokeWidth={2} name="Göğüs" />
                <Line type="monotone" dataKey="hipCm" stroke="hsl(var(--accent))" strokeWidth={2} name="Kalça" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
