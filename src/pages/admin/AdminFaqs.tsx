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
import type { Faq } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";

const empty: Partial<Faq> = { question: "", answer: "", sort_order: 0 };

export default function AdminFaqs() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Faq>>(empty);

  const load = () => {
    setLoading(true);
    db.faqs
      .list()
      .then(setItems)
      .catch((e) => toast({ title: "Couldn't load", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    try {
      await db.faqs.upsert(editing);
      toast({ title: "FAQ saved" });
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await db.faqs.remove(id);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't delete", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">FAQs</h1>
          <p className="text-sm text-muted-foreground">
            Answer real buyer questions in plain language. These also feed the site's FAQ schema, which helps AI
            search tools and Google answer questions about your estate directly.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(empty);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid gap-3">
        {items.map((f) => (
          <Card key={f.id}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-medium">{f.question}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(f);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}>
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
            <DialogTitle>{editing.id ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Question</Label>
              <Input value={editing.question ?? ""} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Answer</Label>
              <Textarea rows={4} value={editing.answer ?? ""} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
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
