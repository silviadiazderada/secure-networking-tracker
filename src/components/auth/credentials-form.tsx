"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { neon } from "@/lib/neon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Mode = "sign-in" | "sign-up";

const COPY: Record<
  Mode,
  { title: string; description: string; cta: string; altText: string; altHref: string; altLabel: string }
> = {
  "sign-in": {
    title: "Sign in",
    description: "Access your private contact list.",
    cta: "Sign in",
    altText: "Need an account?",
    altHref: "/sign-up",
    altLabel: "Create one",
  },
  "sign-up": {
    title: "Create your account",
    description: "Start tracking the people you want to stay connected with.",
    cta: "Create account",
    altText: "Already have an account?",
    altHref: "/sign-in",
    altLabel: "Sign in",
  },
};

export function CredentialsForm({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Email and password are required.");
      return;
    }
    if (mode === "sign-up" && password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "sign-up") {
        const { error } = await neon.auth.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.trim(),
        });
        if (error) {
          setFormError(error.message ?? "Could not create the account.");
          return;
        }
        // Ensure a session exists even if signUp doesn't start one.
        const { error: signInError } = await neon.auth.signIn.email({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setFormError("Account created. Please sign in.");
          return;
        }
      } else {
        const { error } = await neon.auth.signIn.email({
          email: email.trim(),
          password,
        });
        if (error) {
          setFormError(error.message ?? "Incorrect email or password.");
          return;
        }
      }
      router.replace("/contacts");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          {mode === "sign-up" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Optional"
              />
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              required
            />
          </div>

          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Working…" : copy.cta}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {copy.altText}{" "}
            <Link href={copy.altHref} className="text-foreground underline underline-offset-4">
              {copy.altLabel}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
