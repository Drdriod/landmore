import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/data";
import type { Plot, PlotStatus } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";

const emptyPlot: Partial<Plot> = {
  size_sqm: "",
  unit_label: "Square Metres",
  price: 0,
  original_price: null,
  status: "available",
  featured: false,
  features: [],
  whatsapp_note: "",
  sort_order: 0,
};

const statusColors: Record<PlotStatus, string> = {
  available: "bg-green-100 text-green-800 border-green-300",
  reserved: "bg-amber-100 text-amber-800 border-amber-300",
  sold: "bg-red-100 text-red-800 border-red-300",
};

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function AdminPlots() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Plot>>(emptyPlot);
  const [featuresText, setFeaturesText] = useState("");

  const load = () => {
    setLoading(true);
    db.plots
      .list()
      .then(setPlots)
      .catch((e) => toast({ title: "Couldn't load plots", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(emptyPlot);
    setFeaturesText("");
    setOpen(true);
  };

  const openEdit = (plot: Plot) => {
    setEditing(plot);
    setFeaturesText(plot.features.join("\n"));
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: Partial<Plot> = {
        ...editing,
        price: Number(editing.price) || 0,
        original_price:
          editing.original_price !== undefined &&
          editing.original_price !== null &&
          String(editing.original_price) !== ""
            ? Number(editing.original_price)
            : null,
        features: featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      };
      await db.plots.upsert(payload);
      toast({ title: "Plot saved" });
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't save plot", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plot? This can't be undone.")) return;
    try {
      await db.plots.remove(id);
      toast({ title: "Plot deleted" });
      load();
    } catch (e: any) {
      toast({ title: "Couldn't delete plot", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plots &amp; Pricing</h1>
          <p className="text-sm text-muted-foreground">
            Add plots, update prices, and mark a plot reserved or sold. Changes appear on the live site immediately.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Plot
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && plots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No plots yet. Add your first one.
                  </TableCell>
                </TableRow>
              )}
              {plots.map((plot) => (
                <TableRow key={plot.id}>
                  <TableCell className="font-medium">
                    {plot.size_sqm} {plot.unit_label !== "Custom Size" ? "sqm" : ""}
                  </TableCell>
                  <TableCell>
                    {plot.price > 0 ? (
                      <div>
                        {plot.original_price && plot.original_price > plot.price && (
                          <span className="line-through text-muted-foreground mr-2 text-xs">
                            {formatNaira(plot.original_price)}
                          </span>
                        )}
                        {formatNaira(plot.price)}
                      </div>
                    ) : (
                      "Contact Us"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[plot.status]} variant="outline">
                      {plot.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{plot.featured ? "Yes" : ""}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(plot)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plot.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Edit Plot" : "Add Plot"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Size (e.g. 300 or Custom)</Label>
                <Input
                  value={editing.size_sqm ?? ""}
                  onChange={(e) => setEditing({ ...editing, size_sqm: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unit Label</Label>
                <Input
                  value={editing.unit_label ?? ""}
                  onChange={(e) => setEditing({ ...editing, unit_label: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Price (₦, 0 = "Contact Us")</Label>
                <Input
                  type="number"
                  value={editing.price ?? 0}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Original Price (optional, for discount)</Label>
                <Input
                  type="number"
                  value={editing.original_price ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      original_price: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editing.status ?? "available"}
                  onValueChange={(v) => setEditing({ ...editing, status: v as PlotStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editing.featured ?? false}
                onCheckedChange={(v) => setEditing({ ...editing, featured: v })}
              />
              <Label>Mark as "Most Popular"</Label>
            </div>
            <div className="space-y-1.5">
              <Label>Features (one per line)</Label>
              <Textarea
                rows={5}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Custom WhatsApp note (optional)</Label>
              <Input
                placeholder="e.g. I'm interested in the 450sqm plot"
                value={editing.whatsapp_note ?? ""}
                onChange={(e) => setEditing({ ...editing, whatsapp_note: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Plot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
