import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { db, generateReferralCode } from "@/lib/data";
import type { ReferralReward, Referrer, RewardStatus, RewardType } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

const emptyReferrer: Partial<Referrer> = {
  type: "staff",
  name: "",
  phone: "",
  address: "",
  code: "",
  reward_type: "percent",
  reward_value: 2,
};

const emptyReward: Partial<ReferralReward> = {
  referrer_id: "",
  amount: 0,
  status: "pending",
  note: "",
};

export default function AdminReferrals() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refOpen, setRefOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<Partial<Referrer>>(emptyReferrer);
  const [editingReward, setEditingReward] = useState<Partial<ReferralReward>>(emptyReward);

  const load = () => {
    setLoading(true);
    Promise.all([db.referrers.list(), db.rewards.list()])
      .then(([r, w]) => {
        setReferrers(r);
        setRewards(w);
      })
      .catch((e) => toast({ title: "Couldn't load", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const saveReferrer = async () => {
    if (!editingRef.name || !editingRef.phone) {
      toast({ title: "Name and phone are required", variant: "destructive" });
      return;
    }
    try {
      await db.referrers.upsert({
        ...editingRef,
        code: editingRef.code || generateReferralCode(editingRef.name),
      });
      toast({ title: "Referrer saved" });
      setRefOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    }
  };

  const saveReward = async () => {
    if (!editingReward.referrer_id) {
      toast({ title: "Select a referrer", variant: "destructive" });
      return;
    }
    try {
      await db.rewards.upsert({ ...editingReward, amount: Number(editingReward.amount) || 0 });
      toast({ title: "Reward saved" });
      setRewardOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    }
  };

  const updateRewardStatus = async (r: ReferralReward, status: RewardStatus) => {
    try {
      await db.rewards.upsert({ id: r.id, status });
      load();
    } catch (e: any) {
      toast({ title: "Couldn't update", description: e.message, variant: "destructive" });
    }
  };

  const referrerName = (id: string) => referrers.find((r) => r.id === id)?.name ?? "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Referral Program</h1>
        <p className="text-sm text-muted-foreground">
          Staff earn a commission on plots they refer; customers earn a fixed reward for referring a friend who buys.
        </p>
      </div>

      <Tabs defaultValue="referrers">
        <TabsList>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="rewards">Rewards &amp; Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="referrers" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={() => {
                setEditingRef(emptyReferrer);
                setRefOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Referrer
            </Button>
          </div>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading...</TableCell>
                    </TableRow>
                  )}
                  {!loading && referrers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No referrers yet. Customers can also sign up for a code from the "Refer & Earn" section on the site.
                      </TableCell>
                    </TableRow>
                  )}
                  {referrers.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                        {r.address || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell>
                        {r.reward_type === "percent" ? `${r.reward_value}%` : formatNaira(r.reward_value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={() => {
                setEditingReward(emptyReward);
                setRewardOpen(true);
              }}
              disabled={referrers.length === 0}
            >
              <Plus className="h-4 w-4" /> Record Reward
            </Button>
          </div>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loading && rewards.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No rewards recorded yet. Add one once a referred lead buys a plot.
                      </TableCell>
                    </TableRow>
                  )}
                  {rewards.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{referrerName(r.referrer_id)}</TableCell>
                      <TableCell>{formatNaira(r.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.note}</TableCell>
                      <TableCell>
                        <Select value={r.status} onValueChange={(v) => updateRewardStatus(r, v as RewardStatus)}>
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ADD REFERRER DIALOG */}
      <Dialog open={refOpen} onOpenChange={setRefOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Referrer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={editingRef.name ?? ""} onChange={(e) => setEditingRef({ ...editingRef, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={editingRef.phone ?? ""} onChange={(e) => setEditingRef({ ...editingRef, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address (optional)</Label>
              <Input value={editingRef.address ?? ""} onChange={(e) => setEditingRef({ ...editingRef, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={editingRef.type ?? "staff"}
                  onValueChange={(v) =>
                    setEditingRef({
                      ...editingRef,
                      type: v as Referrer["type"],
                      reward_type: v === "staff" ? "percent" : "fixed",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reward Type</Label>
                <Select
                  value={editingRef.reward_type ?? "fixed"}
                  onValueChange={(v) => setEditingRef({ ...editingRef, reward_type: v as RewardType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed (₦)</SelectItem>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reward Value</Label>
              <Input
                type="number"
                value={editingRef.reward_value ?? 0}
                onChange={(e) => setEditingRef({ ...editingRef, reward_value: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Referral Code (auto-generated if left blank)</Label>
              <Input
                value={editingRef.code ?? ""}
                onChange={(e) => setEditingRef({ ...editingRef, code: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefOpen(false)}>Cancel</Button>
            <Button onClick={saveReferrer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RECORD REWARD DIALOG */}
      <Dialog open={rewardOpen} onOpenChange={setRewardOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Reward</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Referrer</Label>
              <Select
                value={editingReward.referrer_id ?? ""}
                onValueChange={(v) => setEditingReward({ ...editingReward, referrer_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a referrer" />
                </SelectTrigger>
                <SelectContent>
                  {referrers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                value={editingReward.amount ?? 0}
                onChange={(e) => setEditingReward({ ...editingReward, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note (e.g. which plot / buyer)</Label>
              <Input value={editingReward.note ?? ""} onChange={(e) => setEditingReward({ ...editingReward, note: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardOpen(false)}>Cancel</Button>
            <Button onClick={saveReward}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
