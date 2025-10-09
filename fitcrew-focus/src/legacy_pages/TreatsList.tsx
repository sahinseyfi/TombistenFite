import { useState } from 'react';
import { Plus, Edit, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/ui/empty-state';
import MobileLayout from '@/components/layout/MobileLayout';
import { TreatItem } from '@/types';
import { mockTreatItems } from '@/services/mockData';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function TreatsList() {
  const navigate = useNavigate();
  const [treats, setTreats] = useState<TreatItem[]>(mockTreatItems);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [portionInfoOpen, setPortionInfoOpen] = useState(false);
  const [newTreat, setNewTreat] = useState<Partial<TreatItem>>({
    name: '',
    photoUrl: '',
    kcalHint: '',
    portions: ['Küçük', 'Orta', 'Tam']
  });

  const handleAdd = () => {
    if (!newTreat.name) {
      toast({
        title: 'Hata',
        description: 'Lütfen en az bir isim girin.',
        variant: 'destructive'
      });
      return;
    }

    const treat: TreatItem = {
      id: Date.now().toString(),
      name: newTreat.name,
      photoUrl: newTreat.photoUrl,
      kcalHint: newTreat.kcalHint,
      portions: newTreat.portions || ['Küçük', 'Orta', 'Tam']
    };

    setTreats([...treats, treat]);
    setNewTreat({ name: '', photoUrl: '', kcalHint: '', portions: ['Küçük', 'Orta', 'Tam'] });
    setIsAddOpen(false);
    toast({
      title: 'Eklendi!',
      description: `${treat.name} kaçamak listene eklendi.`
    });
  };

  const handleDelete = (id: string) => {
    setTreats(treats.filter(t => t.id !== id));
    toast({
      title: 'Silindi',
      description: 'Kaçamak listenden kaldırıldı.'
    });
  };

  const handleGoToWheel = () => {
    if (treats.length < 3) {
      toast({
        title: 'Yetersiz Öğe',
        description: 'Çark için en az 3 kaçamak eklemelisin.',
        variant: 'destructive'
      });
      return;
    }
    navigate('/wheel');
  };

  return (
    <MobileLayout
      title="Kaçamak Listem"
      headerAction={
        <Button onClick={handleGoToWheel} size="sm" disabled={treats.length < 3}>
          Çarka Git
        </Button>
      }
    >
      <div className="p-4 space-y-4">
        {/* Add Button */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gradient-primary" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Yeni Kaçamak Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Kaçamak Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">İsim *</Label>
                <Input
                  id="name"
                  value={newTreat.name}
                  onChange={(e) => setNewTreat({ ...newTreat, name: e.target.value })}
                  placeholder="Örn: Baklava"
                />
              </div>
              <div>
                <Label htmlFor="photo">Görsel URL (opsiyonel)</Label>
                <Input
                  id="photo"
                  value={newTreat.photoUrl}
                  onChange={(e) => setNewTreat({ ...newTreat, photoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="kcal">Kalori İpucu (opsiyonel)</Label>
                <Input
                  id="kcal"
                  value={newTreat.kcalHint}
                  onChange={(e) => setNewTreat({ ...newTreat, kcalHint: e.target.value })}
                  placeholder="Örn: ~300-400 kcal"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Ekle
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Portion Info */}
        <Dialog open={portionInfoOpen} onOpenChange={setPortionInfoOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Info className="w-4 h-4 mr-2" />
              Porsiyon Rehberi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Porsiyon Büyüklükleri</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-4">
              <div className="p-3 bg-muted rounded-xl">
                <p className="font-semibold mb-1">Küçük</p>
                <p className="text-sm text-muted-foreground">Tadımlık boyut - yaklaşık %30 azaltılmış</p>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <p className="font-semibold mb-1">Orta</p>
                <p className="text-sm text-muted-foreground">Dengeli boyut - standart porsiyonun yarısı</p>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <p className="font-semibold mb-1">Tam</p>
                <p className="text-sm text-muted-foreground">Normal porsiyon - tam lezzet deneyimi</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* List */}
        {treats.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Kaçamak Ekle"
            description="Sevdiğin 5-6 kaçamak ekle. Çark dilimlerin bunlardan oluşacak."
            actionLabel="İlk Kaçamağı Ekle"
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {treats.map((treat) => (
              <Card key={treat.id} className="p-4">
                <div className="flex gap-3">
                  {treat.photoUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        src={treat.photoUrl}
                        alt={treat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">{treat.name}</h3>
                    {treat.kcalHint && (
                      <p className="text-sm text-muted-foreground mb-2">{treat.kcalHint}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {treat.portions?.map((portion) => (
                        <Badge key={portion} variant="outline" className="text-xs">
                          {portion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(treat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info */}
        {treats.length > 0 && treats.length < 3 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-center">
            <p className="text-sm text-warning">
              Çark için en az 3 kaçamak gerekli. ({treats.length}/3)
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
