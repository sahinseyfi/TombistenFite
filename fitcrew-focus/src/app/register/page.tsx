'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function extractCaptchaToken(form: HTMLFormElement) {
  const textarea = form.querySelector<HTMLTextAreaElement>("textarea[name='h-captcha-response']");
  return textarea?.value?.trim() ?? "";
}

export default function RegisterPage() {
  const router = useRouter();
  const [state, setState] = useState<SubmissionState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("password") !== formData.get("confirmPassword")) {
      setState({ status: "error", message: "Şifreler eşleşmiyor." });
      return;
    }

    const captchaToken = extractCaptchaToken(form);

    if (!captchaToken) {
      setState({ status: "error", message: "Lütfen hCaptcha doğrulamasını tamamlayın." });
      return;
    }

    setState({ status: "submitting" });

    const payload = {
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      name: formData.get("name"),
      handle: formData.get("handle"),
      captchaToken,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.error?.message ??
          (response.status === 409 ? "Bilgiler başka bir kullanıcı tarafından kullanılıyor." : "Kayıt işlemi başarısız oldu.");
        setState({ status: "error", message });
        if (typeof window !== "undefined" && window.hcaptcha) {
          window.hcaptcha.reset();
        }
        return;
      }

      setState({
        status: "success",
        message: "Kayıt tamamlandı. Gelen kutunuzu doğrulama e-postası için kontrol edin.",
      });
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      console.error("Kayıt isteği başarısız:", error);
      setState({ status: "error", message: "Beklenmeyen bir hata oluştu." });
    }
  }

  return (
    <div className="mx-auto flex min-h-[85vh] w-full max-w-2xl flex-col justify-center px-6 py-10">
      <Script src="https://hcaptcha.com/1/api.js" async defer />
      <Card className="shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">FitCrew Focus&apos;a Katılın</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Beslenme, ölçüm ve antrenman hedeflerinizi tek yerden yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 text-left">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" name="name" required placeholder="Adınız Soyadınız" />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="handle">Kullanıcı Adı</Label>
                <Input id="handle" name="handle" required placeholder="@kullanici" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 text-left">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" inputMode="email" required placeholder="ornek@eposta.com" />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="phone">Telefon (opsiyonel)</Label>
                <Input id="phone" name="phone" type="tel" inputMode="tel" placeholder="+90555..." />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 text-left">
                <Label htmlFor="password">Şifre</Label>
                <Input id="password" name="password" type="password" required minLength={8} />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="confirmPassword">Şifre (Tekrar)</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
              </div>
            </div>
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Bot kayıtlarını engellemek için hCaptcha koruması etkin. Lütfen doğrulama bileşenini tamamlayın.
            </div>
            <div className="flex justify-center">
              <div
                className="h-captcha"
                data-sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
              />
            </div>
            {state.status === "error" && (
              <p className="text-sm font-medium text-destructive">{state.message}</p>
            )}
            {state.status === "success" && (
              <p className="text-sm font-medium text-success">{state.message}</p>
            )}
            <Button className="w-full" type="submit" disabled={state.status === "submitting"}>
              {state.status === "submitting" ? "Kayıt oluşturuluyor..." : "Kayıt ol"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-1 text-sm text-muted-foreground">
          <p>
            Zaten hesabınız var mı?{" "}
            <Link className="font-semibold text-primary" href={{ pathname: "/login" }}>
              Giriş yapın
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var hcaptcha: {
    reset: () => void;
  };
}
