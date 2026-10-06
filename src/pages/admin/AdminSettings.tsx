import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/data";
import type { SiteSettings } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { defaultSettings } from "@/lib/defaults";

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.settings
      .get()
      .then(setSettings)
      .catch((e) => toast({ title: "Couldn't load settings", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const set = (patch: Partial<SiteSettings>) => setSettings({ ...settings, ...patch });

  const handleSave = async () => {
    setSaving(true);
    try {
      await db.settings.update(settings);
      toast({ title: "Settings saved" });
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Global text and contact details shown across the site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Badge Text</Label>
            <Input value={settings.hero_badge} onChange={(e) => set({ hero_badge: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Textarea rows={2} value={settings.hero_title} onChange={(e) => set({ hero_title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Subtitle</Label>
            <Input value={settings.hero_subtitle} onChange={(e) => set({ hero_subtitle: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={3} value={settings.hero_description} onChange={(e) => set({ hero_description: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact &amp; Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Estate Address</Label>
            <Textarea rows={2} value={settings.address} onChange={(e) => set({ address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={settings.phone} onChange={(e) => set({ phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp Number (with country code, no +)</Label>
              <Input value={settings.whatsapp_number} onChange={(e) => set({ whatsapp_number: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={settings.email} onChange={(e) => set({ email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Advisor Name</Label>
              <Input value={settings.advisor_name} onChange={(e) => set({ advisor_name: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Google Maps Embed URL (optional)</Label>
            <Input
              placeholder="https://www.google.com/maps/embed?..."
              value={settings.map_embed_url ?? ""}
              onChange={(e) => set({ map_embed_url: e.target.value || null })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company &amp; Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>RC Number</Label>
            <Input value={settings.rc_number} onChange={(e) => set({ rc_number: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Bank Account Name</Label>
              <Input value={settings.bank_account_name} onChange={(e) => set({ bank_account_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Bank Account Number</Label>
              <Input value={settings.bank_account_number} onChange={(e) => set({ bank_account_number: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Bank Name</Label>
              <Input value={settings.bank_name} onChange={(e) => set({ bank_name: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Proof</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Google Rating (e.g. 4.8)</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.google_rating ?? ""}
              onChange={(e) => set({ google_rating: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Google Review Count</Label>
            <Input
              type="number"
              value={settings.google_review_count ?? ""}
              onChange={(e) => set({ google_review_count: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral Program Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Customer Referral Reward (₦)</Label>
            <Input
              type="number"
              value={settings.customer_referral_reward}
              onChange={(e) => set({ customer_referral_reward: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Given automatically to customers who sign up in the "Refer &amp; Earn" section on the site.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Default Staff Commission (%)</Label>
            <Input
              type="number"
              value={settings.staff_referral_commission_percent}
              onChange={(e) => set({ staff_referral_commission_percent: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Suggested default when adding a new staff member under Staff.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg">
        {saving ? "Saving..." : "Save All Settings"}
      </Button>
    </div>
  );
}
