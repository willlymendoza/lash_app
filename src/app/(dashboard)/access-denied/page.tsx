import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Access denied",
};

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Card className="bg-surface-0 border-ink-200">
        <CardHeader>
          <CardTitle className="text-ink-900">Access denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-ink-500">
            You do not have permission to access this page. Ask an administrator if you need access.
          </p>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
