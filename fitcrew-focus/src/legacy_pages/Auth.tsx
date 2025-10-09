import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !accepted) {
      toast.error('Lütfen gizlilik politikasını kabul edin');
      return;
    }

    if (!email || !password || (!isLogin && !name)) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    // Mock authentication
    toast.success(isLogin ? 'Giriş başarılı!' : 'Kayıt başarılı!');
    setTimeout(() => navigate('/feed'), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-primary bg-clip-text text-transparent">
            FitCrew
          </h1>
          <p className="text-muted-foreground">
            Hedeflerinizi paylaşın, birlikte dönüşün
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Adınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>

            {!isLogin && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <a href="#" className="text-primary hover:underline">KVKK</a> ve{' '}
                  <a href="#" className="text-primary hover:underline">Gizlilik Politikası</a>'nı
                  okudum ve kabul ediyorum
                </label>
              </div>
            )}

            <Button type="submit" className="w-full h-12 gradient-primary text-base font-semibold">
              {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? (
                <>
                  Hesabınız yok mu?{' '}
                  <span className="text-primary font-semibold">Kayıt olun</span>
                </>
              ) : (
                <>
                  Zaten hesabınız var mı?{' '}
                  <span className="text-primary font-semibold">Giriş yapın</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
