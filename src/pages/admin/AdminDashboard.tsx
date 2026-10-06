import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/data";
import type { InspectionRequest, Plot } from "@/lib/types";

export default function AdminDashboard() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [inspections, setInspections] = useState<InspectionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([db.plots.list(), db.inspections.list()])
      .then(([p, i]) => {
        setPlots(p);
        setInspections(i);
      })
      .catch((e) => setError(e.message));
  }, []);

  const available = plots.filter((p) => p.status === "available").length;
  const reserved = plots.filter((p) => p.status === "reserved").length;
  const sold = plots.filter((p) => p.status === "sold").length;
  const newLeads = inspections.filter((i) => i.status === "new").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Quick overview of your inventory and leads.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Plots
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{available}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reserved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{reserved}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sold
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{sold}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Inspection Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{newLeads}</CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/plots">
          <Card className="hover-elevate cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Update prices &amp; availability</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Mark a plot sold, change its price, or add a new plot size.
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/promos">
          <Card className="hover-elevate cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Launch a promo or discount</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Turn on a site-wide banner with a discount and end date.
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
