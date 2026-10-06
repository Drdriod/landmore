import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/data";
import type { Promo } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";

const emptyPromo: Partial<Promo> = {
  title: "",
  message: "",
  discount_percent: null,
  active: false,
  start_date: null,
  end_date: null,
};

export default function AdminPromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Promo>>(emptyPromo);

  const load = () => {
    setLoading(true);
    db.promos
      .list()
      .then(setPromos)
      .catch((e) => toast({ title: "Couldn't load promos", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(emptyPromo);
    setOpen(true);
  };

  const openEdit = (promo: Promo) => {
    setEditing(promo);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      await db.promos.upsert({
        ...editing,
        discount_percent:
          editing.discount_percent === undefined || String(editing.discount_percent) === ""
            ? null
            : Number(editing.discount_percent),
      });
      toast({ title: "Promo saved" });
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't save promo", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo?")) return;
    try {
      await db.promos.remove(id);
      toast({ title: "Promo deleted" });
      load();
    } catch (e: any) {
      toast({ title: "Couldn't delete promo", description: e.message, variant: "destructive" });
    }
  };

  const toggleActive = async (promo: Promo) => {
    try {
      await db.promos.upsert({ id: promo.id, active: !promo.active });
      load();
    } catch (e: any) {
      toast({ title: "Couldn't update promo", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Promos &amp; Discounts</h1>
          <p className="text-sm text-muted-foreground">
            Turn a promo "active" to show it as a banner on the live site. Only one active promo is needed at a time.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Promo
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!loading && promos.length === 0 && (
        <p className="text-sm text-muted-foreground">No promos yet.</p>
      )}

      <div className="grid gap-3">
        {promos.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{promo.title}</h3>
                  {promo.active && <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">Live</Badge>}
                  {promo.discount_percent ? (
                    <Badge variant="outline">{promo.discount_percent}% off</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{promo.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {promo.start_date || "no start"} → {promo.end_date || "no end"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={promo.active} onCheckedChange={() => toggleActive(promo)} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(promo)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Edit Promo" : "New Promo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="e.g. December Discount"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Banner Message</Label>
              <Textarea
                rows={2}
                placeholder="e.g. Get 10% off all plots this December — offer ends soon!"
                value={editing.message ?? ""}
                onChange={(e) => setEditing({ ...editing, message: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={editing.discount_percent ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      discount_percent: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={editing.start_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, start_date: e.target.value || null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={editing.end_date ?? ""}
                  onChange={(e) => setEditing({ ...editing, end_date: e.target.value || null })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editing.active ?? false}
                onCheckedChange={(v) => setEditing({ ...editing, active: v })}
              />
              <Label>Active (show on site now)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Promo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
