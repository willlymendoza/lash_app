"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/modules/auth/server/actions/login";
import type { LoginFormState } from "@/modules/auth/types/login.types";

export function LoginForm() {
  const initialState: LoginFormState = {};
  const [state, action, isPending] = useActionState(login, initialState);

  return (
    <Card className="w-full border-ink-200 bg-surface-0 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center font-playfair text-3xl text-ink-900">
          Sign in
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-ink-700">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              className="h-10 border-surface-300 bg-surface-50 placeholder:text-ink-400 focus-visible:border-brand-300 focus-visible:ring-brand-200/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-ink-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              className="h-10 border-surface-300 bg-surface-50 placeholder:text-ink-400 focus-visible:border-brand-300 focus-visible:ring-brand-200/50"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 w-full cursor-pointer bg-brand-600 text-white hover:bg-brand-700"
          >
            {isPending ? "Ingresando..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
