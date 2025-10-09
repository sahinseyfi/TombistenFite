import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const mealTypes = [
  { value: 'breakfast', label: 'Kahvaltı' },
  { value: 'lunch', label: 'Öğle' },
  { value: 'dinner', label: 'Akşam' },
  { value: 'snack', label: 'Ara Öğün' }
];

export default function Create() {
  const navigate = useNavigate();
  const [selectedMealType, setSelectedMealType] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [visibility, setVisibility] = useState('public');
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weightKg && !waistCm && !caption) {
      toast.error('Lütfen en az bir alan doldurun (kilo, ölçü veya açıklama)');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Gönderin paylaşıldı! 🎉');
    navigate('/feed');
  };

  return (
    <MobileLayout
      title="Yeni Gönderi"
      headerAction={
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <X className="w-5 h-5" />
        </Button>
      }
      showNotifications={false}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Photo Upload */}
        <div>
          <Label>Öğün Fotoğrafı</Label>
          <div className="mt-2 border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Fotoğraf eklemek için tıklayın</p>
            <p className="text-xs text-muted-foreground mt-1">En az 1 görsel önerilir</p>
          </div>
        </div>

        {/* Weight */}
        <div>
          <Label htmlFor="weight">Kilo (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="68.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="mt-2 h-12"
          />
        </div>

        {/* Measurements */}
        <div className="space-y-3">
          <Label>Vücut Ölçüleri (cm)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Bel"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <Input type="number" placeholder="Göğüs" className="h-12" />
            </div>
            <div>
              <Input type="number" placeholder="Kalça" className="h-12" />
            </div>
            <div>
              <Input type="number" placeholder="Kol" className="h-12" />
            </div>
          </div>
        </div>

        {/* Meal Type */}
        <div>
          <Label>Öğün Türü</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {mealTypes.map((type) => (
              <Badge
                key={type.value}
                variant={selectedMealType === type.value ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer px-4 py-2 text-sm transition-all',
                  selectedMealType === type.value && 'gradient-primary'
                )}
                onClick={() => setSelectedMealType(type.value)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div>
          <Label htmlFor="caption">Açıklama</Label>
          <Textarea
            id="caption"
            placeholder="Bugün nasıl geçti? Hedeflerinizi paylaşın..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-2 min-h-24 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {caption.length}/500
          </p>
        </div>

        {/* AI Comment */}
        <div className="bg-secondary/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <Label htmlFor="ai-toggle" className="cursor-pointer">
                Yapay Zeka Yorumu (GPT-5)
              </Label>
            </div>
            <Switch
              id="ai-toggle"
              checked={aiEnabled}
              onCheckedChange={setAiEnabled}
            />
          </div>
          {aiEnabled && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kilo/ölçü/açıklama bilgilerin GPT-5 ile analiz edilir ve kişisel öneriler üretilir. 
              Bu tavsiyeler tıbbi öneri değildir.
            </p>
          )}
        </div>

        {/* Privacy */}
        <div>
          <Label>Gizlilik</Label>
          <RadioGroup value={visibility} onValueChange={setVisibility} className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="font-normal cursor-pointer">
                Herkese açık
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="followers" id="followers" />
              <Label htmlFor="followers" className="font-normal cursor-pointer">
                Takipçilere
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="font-normal cursor-pointer">
                Gizli
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-semibold gradient-primary shadow-glow"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Paylaşılıyor...' : 'Paylaş'}
        </Button>
      </form>
    </MobileLayout>
  );
}
