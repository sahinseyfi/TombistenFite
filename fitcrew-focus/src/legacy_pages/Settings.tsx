import type { LucideIcon } from "lucide-react";
import { Bell, ChevronRight, Globe, HelpCircle, Lock, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type SettingItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  toggle?: boolean;
  enabled?: boolean;
  value?: string;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

const settingsSections: SettingSection[] = [
  {
    title: "Hesap",
    items: [
      { icon: User, label: "Profili Düzenle", href: "#" },
      { icon: Lock, label: "Gizlilik", href: "#" },
    ],
  },
  {
    title: "Tercihler",
    items: [
      { icon: Bell, label: "Bildirimler", href: "#", toggle: true, enabled: true },
      { icon: Globe, label: "Dil", href: "#", value: "Türkçe" },
    ],
  },
  {
    title: "Destek",
    items: [{ icon: HelpCircle, label: "Yardım Merkezi", href: "#" }],
  },
];

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Çıkış yapıldı");
    navigate("/auth");
  };

  return (
    <MobileLayout title="Ayarlar" showNotifications={false}>
      <div className="space-y-6 p-4">
        {settingsSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="px-2 text-sm font-semibold text-muted-foreground">{section.title}</h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {section.items.map((item, idx) => (
                <div key={item.label}>
                  {idx > 0 && <Separator />}
                  <Link
                    to={item.href}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.toggle ? (
                        <Switch defaultChecked={item.enabled} />
                      ) : item.value ? (
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                      ) : null}
                      {!item.toggle && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <Button variant="destructive" className="h-12 w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-5 w-5" />
            Çıkış Yap
          </Button>
        </div>

        <div className="pt-4 text-center text-xs text-muted-foreground">
          <p>FitCrew v1.0.0</p>
          <p className="mt-1">
            <Link to="#" className="hover:text-primary">
              Gizlilik Politikası
            </Link>
            {" • "}
            <Link to="#" className="hover:text-primary">
              Kullanım Koşulları
            </Link>
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
