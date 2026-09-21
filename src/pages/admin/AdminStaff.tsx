import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, generateReferralCode } from "@/lib/data";
import type { Profile, UserRole } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus } from "lucide-react";

const empty: Partial<Profile> = {
  id: "",
  full_name: "",
  role: "staff",
  referral_code: "",
  commission_percent: 2,
  active: true,
};

export default function AdminStaff() {
  const [items, setItems] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Profile>>(empty);

  const load = () => {
    setLoading(true);
    db.profiles
      .list()
      .then(setItems)
      .catch((e) => toast({ title: "Couldn't load staff", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => {
    setEditing({ ...empty });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing.id || !editing.full_name) {
      toast({
        title: "Auth User ID and name are required",
        description: "Create the login in Supabase Authentication first, then paste their User ID here.",
        variant: "destructive",
      });
      return;
    }
    try {
      await db.profiles.upsert({
        ...editing,
        referral_code: editing.referral_code || generateReferralCode(editing.full_name),
      });
      toast({ title: "Staff member saved" });
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    }
  };

  const toggleActive = async (p: Profile) => {
    try {
      await db.profiles.setActive(p.id, !p.active);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't update", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Staff</h1>
          <p className="text-sm text-muted-foreground">
            Staff can log into /admin/login and manage Leads only — they can't edit prices, promos, or settings.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-sm">Before adding staff here</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>1. In Supabase: Authentication → Users → Add user (their email + a password).</p>
          <p>2. Copy that user's ID (a long code shown next to their email).</p>
          <p>3. Click "Add Staff" here and paste that ID in — this is what links their login to a role.</p>
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid gap-3">
        {items.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{p.full_name}</h3>
                  <Badge variant="outline">{p.role}</Badge>
                  {!p.active && <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Disabled</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Referral code: <span className="font-mono">{p.referral_code || "—"}</span> · Commission:{" "}
                  {p.commission_percent}%
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} />
                <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No staff added yet.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing.created_at ? "Edit Staff" : "Add Staff"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Supabase Auth User ID</Label>
              <Input
                placeholder="paste from Authentication → Users"
                value={editing.id ?? ""}
                disabled={!!editing.created_at}
                onChange={(e) => setEditing({ ...editing, id: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={editing.full_name ?? ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={editing.role ?? "staff"} onValueChange={(v) => setEditing({ ...editing, role: v as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff (Leads only)</SelectItem>
                    <SelectItem value="admin">Admin (Full access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Referral Commission %</Label>
                <Input
                  type="number"
                  value={editing.commission_percent ?? 2}
                  onChange={(e) => setEditing({ ...editing, commission_percent: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Referral Code (auto-generated if left blank)</Label>
              <Input
                placeholder="e.g. MABEL01"
                value={editing.referral_code ?? ""}
                onChange={(e) => setEditing({ ...editing, referral_code: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
