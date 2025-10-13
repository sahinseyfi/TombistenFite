'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import Script from "next/script";
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

export default function ForgotPasswordPage() {
  const [state, setState] = useState<SubmissionState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const captchaToken = extractCaptchaToken(form);

    if (!captchaToken) {
      setState({ status: "error", message: "Lütfen hCaptcha doğrulamasını tamamlayın." });
      return;
    }

    setState({ status: "submitting" });

    const payload = {
      email: formData.get("email"),
      captchaToken,
    };

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error?.message ?? "Talep gönderilemedi.";
        setState({ status: "error", message });
        if (typeof window !== "undefined" && window.hcaptcha) {
          window.hcaptcha.reset();
        }
        return;
      }

      setState({
        status: "success",
        message: "Eğer kayıtlı bir hesabınız varsa sıfırlama bağlantısı e-posta ile gönderildi.",
      });
    } catch (error) {
      console.error("Şifre sıfırlama isteği başarısız:", error);
      setState({ status: "error", message: "Beklenmeyen bir hata oluştu." });
    }
  }

  return (
    <div className="mx-auto flex min-h-[85vh] w-full max-w-md flex-col justify-center px-6 py-10">
      <Script src="https://hcaptcha.com/1/api.js" async defer />
      <Card className="shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Şifremi Unuttum</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Kayıtlı e-posta adresinizi girin; doğrulama sonrası sıfırlama bağlantısı göndereceğiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required placeholder="ornek@eposta.com" />
            </div>
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Güvenlik için hCaptcha doğrulaması zorunludur.
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
              {state.status === "submitting" ? "Talep gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-1 text-sm text-muted-foreground">
          <p>
            Giriş sayfasına dönmek için{" "}
            <Link className="font-semibold text-primary" href="/login">
              buraya tıklayın
            </Link>
            .
          </p>
          <p>
            Hala problem yaşıyorsanız destek ekibimizle iletişime geçin.
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
