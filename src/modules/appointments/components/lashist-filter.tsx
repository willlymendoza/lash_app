"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LashistFilterProps = {
  lashists: Array<{ userId: number; fullName: string }>;
  selectedLashistId: number | null;
  onLashistChange: (lashistId: number | null) => void;
};

export function LashistFilter({
  lashists,
  selectedLashistId,
  onLashistChange,
}: LashistFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="lashist-filter">Filter by lash artist</Label>
      <Select
        value={selectedLashistId ? String(selectedLashistId) : "all"}
        onValueChange={(value) =>
          onLashistChange(value === "all" ? null : Number(value))
        }
      >
        <SelectTrigger id="lashist-filter">
          <SelectValue placeholder="All lash artists" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All lash artists</SelectItem>
          {lashists.map((lashist) => (
            <SelectItem key={lashist.userId} value={String(lashist.userId)}>
              {lashist.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
