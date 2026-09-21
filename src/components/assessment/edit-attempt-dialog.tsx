"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AssessmentAttempt } from "@/lib/assessment/types";

export function EditAttemptDialog({
  attempt,
  open,
  onOpenChange,
  onSaved,
}: {
  attempt: AssessmentAttempt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (attempt: AssessmentAttempt) => void;
}) {
  const [nama, setNama] = useState(attempt.participant_nama);
  const [jabatan, setJabatan] = useState(attempt.participant_jabatan);
  const [telp, setTelp] = useState(attempt.participant_telp);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNama(attempt.participant_nama);
      setJabatan(attempt.participant_jabatan);
      setTelp(attempt.participant_telp);
    }
  }, [open, attempt]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/assessment/attempts/${attempt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_nama: nama,
        participant_jabatan: jabatan,
        participant_telp: telp,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      toast.error(body.error ?? "Gagal menyimpan perubahan.");
      return;
    }

    toast.success("Data peserta diperbarui.");
    onSaved(body.attempt);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Koreksi Data Peserta</DialogTitle>
          <DialogDescription>
            Hanya nama, jabatan, dan no. telepon yang bisa dikoreksi. Perubahan ini akan
            tercatat di audit log.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-nama">Nama</Label>
            <Input id="edit-nama" value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-jabatan">Jabatan</Label>
            <Input id="edit-jabatan" value={jabatan} onChange={(e) => setJabatan(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-telp">No. Telepon</Label>
            <Input id="edit-telp" value={telp} onChange={(e) => setTelp(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
