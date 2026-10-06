import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { InspectionRequest, InspectionStatus } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export default function AdminInspections() {
  const [items, setItems] = useState<InspectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    db.inspections
      .list()
      .then(setItems)
      .catch((e) => toast({ title: "Couldn't load", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id: string, status: InspectionStatus) => {
    try {
      await db.inspections.updateStatus(id, status);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't update", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Every inspection request submitted on the site is saved here, in addition to being sent to WhatsApp — so
          nothing gets lost if a message is missed. A referral code appears if the visitor came through a referral
          link.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Plot Size</TableHead>
                <TableHead>Preferred</TableHead>
                <TableHead>Referral</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No inspection requests yet.
                  </TableCell>
                </TableRow>
              )}
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.email}</div>
                  </TableCell>
                  <TableCell>
                    <a href={`tel:${i.phone}`} className="underline">
                      {i.phone}
                    </a>
                  </TableCell>
                  <TableCell>{i.plot_size}</TableCell>
                  <TableCell>
                    {i.preferred_date} {i.preferred_time}
                  </TableCell>
                  <TableCell>
                    {i.referral_code ? (
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{i.referral_code}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select value={i.status} onValueChange={(v) => updateStatus(i.id, v as InspectionStatus)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
