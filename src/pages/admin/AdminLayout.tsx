import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Home,
  Tag,
  MessageSquareQuote,
  Images,
  HelpCircle,
  Inbox,
  Settings,
  LogOut,
  Users,
  Gift,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/plots", label: "Plots & Pricing", icon: Home },
  { href: "/admin/promos", label: "Promos & Discounts", icon: Tag },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/gallery", label: "Progress Gallery", icon: Images },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/inspections", label: "Leads", icon: Inbox },
  { href: "/admin/referrals", label: "Referral Program", icon: Gift },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

const staffNavItems = [
  { href: "/admin/inspections", label: "Leads", icon: Inbox },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { session, profile, loading, isAdmin, isStaff, signOut } = useAuth();
  const [location, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    navigate("/admin/login");
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm space-y-3">
          <p className="font-medium">Your account isn't set up yet.</p>
          <p className="text-sm text-muted-foreground">
            You're signed in, but no role has been assigned to this login. Ask
            the site admin to add you under Staff, or check{" "}
            <code>supabase/migration_staff_referrals.sql</code> if you're
            setting up the first admin account.
          </p>
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const navItems = isAdmin ? adminNavItems : staffNavItems;
  const currentPath = location;

  if (isStaff && !staffNavItems.some((item) => item.href === currentPath)) {
    navigate("/admin/inspections");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background hidden md:flex flex-col">
        <div className="p-5 border-b">
          <div className="font-semibold">Land &amp; More Reality</div>
          <div className="text-xs text-muted-foreground">
            {profile.full_name} · {isAdmin ? "Admin" : "Staff"}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <a
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            <Home className="h-4 w-4" /> View Live Site
          </a>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden border-b bg-background sticky top-0 z-10">
          <div className="p-3 flex items-center justify-between">
            <div className="font-semibold text-sm">
              L&amp;M {isAdmin ? "Admin" : "Staff"}
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 -mt-1">
            {navItems.map((item) => {
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 md:p-8 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
