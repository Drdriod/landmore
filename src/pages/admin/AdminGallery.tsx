import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/data";
import type { GalleryImage } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const empty: Partial<GalleryImage> = {
  image_url: "",
  caption: "",
  taken_on: "",
  sort_order: 0,
};

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<GalleryImage>>(empty);

  const load = () => {
    setLoading(true);
    db.gallery
      .list()
      .then(setItems)
      .catch((e) => toast({ title: "Couldn't load", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (!editing.image_url) {
      toast({ title: "Image URL is required", variant: "destructive" });
      return;
    }
    try {
      await db.gallery.upsert({ ...editing, taken_on: editing.taken_on || null });
      toast({ title: "Photo added" });
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this photo?")) return;
    try {
      await db.gallery.remove(id);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't delete", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Progress Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Upload photos to an image host (e.g. Cloudinary, Imgur, Supabase Storage) and paste the URL here.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(empty);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Photo
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((g) => (
          <Card key={g.id} className="overflow-hidden">
            <img src={g.image_url} alt={g.caption ?? ""} className="w-full h-32 object-cover" />
            <CardContent className="p-2">
              <p className="text-xs truncate">{g.caption}</p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1 text-destructive gap-1"
                onClick={() => handleDelete(g.id)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                placeholder="https://..."
                value={editing.image_url ?? ""}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Caption</Label>
              <Input
                placeholder="e.g. Road grading complete"
                value={editing.caption ?? ""}
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date Taken</Label>
              <Input
                type="date"
                value={editing.taken_on ?? ""}
                onChange={(e) => setEditing({ ...editing, taken_on: e.target.value })}
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
