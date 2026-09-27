import { Link } from "@tanstack/react-router";
import { LayoutDashboard, UsersRound, Sparkles, Plus, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Pipeline", icon: UsersRound },
  { to: "/leads/new", label: "Add lead", icon: Plus },
  { to: "/ask", label: "Ask CRM", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar px-4 py-7 lg:flex">
        <Link to="/" className="flex items-center gap-3 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><Sparkles className="size-5" /></span>
          <span className="font-semibold text-sidebar-foreground">LeadPilot <span className="text-primary">AI</span></span>
        </Link>
        <div className="mt-12 px-3 text-[11px] font-semibold uppercase text-muted-foreground">Workspace</div>
        <nav className="mt-3 space-y-1" aria-label="Main navigation">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring [&.active]:bg-sidebar-accent [&.active]:text-primary">
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-sidebar-border px-2 pt-5">
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-primary" /> Workspace ready <ArrowUpRight className="ml-auto size-3" /></div>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-5 lg:hidden">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>LeadPilot <span className="text-primary">AI</span></Link>
        <Button asChild size="sm"><Link to="/leads/new"><Plus /> Add lead</Link></Button>
      </header>
      <main className="mx-auto w-full max-w-[1500px] px-5 pb-28 pt-8 sm:px-8 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Mobile navigation">
        {nav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&.active]:text-primary"><Icon className="size-5" />{label}</Link>)}
      </nav>
    </div>
  );
}
