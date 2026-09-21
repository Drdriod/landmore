import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/data";
import type { Testimonial } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";

const empty: Partial<Testimonial> = {
  name: "",
  role: "",
  quote: "",
  rating: 5,
  photo_url: "",
  sort_order: 0,
};

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Testimonial>>(empty);

  const load = () => {
    setLoading(true);
    db.testimonials
      .list()
      .then(setItems)
      .catch((e) => toast({ title: "Couldn't load", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    try {
      await db.testimonials.upsert({ ...editing, rating: Number(editing.rating) || 5 });
      toast({ title: "Testimonial saved" });
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await db.testimonials.remove(id);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't delete", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Testimonials</h1>
          <p className="text-sm text-muted-foreground">Shown in the trust section of the live site.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(empty);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid gap-3">
        {items.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current text-amber-500" />
                  ))}
                </div>
                <p className="text-sm italic">"{t.quote}"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.name}
                  {t.role ? ` — ${t.role}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(t);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
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
            <DialogTitle>{editing.id ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Role (optional)</Label>
                <Input
                  placeholder="Plot Owner, 450sqm"
                  value={editing.role ?? ""}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Quote</Label>
              <Textarea rows={3} value={editing.quote ?? ""} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Rating (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={editing.rating ?? 5}
                  onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Photo URL (optional)</Label>
                <Input value={editing.photo_url ?? ""} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} />
              </div>
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
