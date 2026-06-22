"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Video,
  X,
  Circle,
  MonitorPlay,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDriveStore } from "@/stores/drive-store";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Record", href: "/record", icon: MonitorPlay },
  { label: "History", href: "/history", icon: Clock },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { isConnected } = useDriveStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/40 bg-card/40 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border/40 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-purple-500/20">
              <Video className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">RecStudio</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-foreground border border-indigo-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className={cn("h-4.5 w-4.5", isActive && "text-indigo-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Drive Status */}
        <div className="px-3 pb-3">
          <div className="rounded-xl border border-border/40 bg-card/40 p-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75",
                  isConnected ? "animate-ping bg-emerald-500" : "bg-muted-foreground/40"
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isConnected ? "bg-emerald-500" : "bg-muted-foreground/40"
                )} />
              </span>
              <p className="text-xs font-semibold">Google Drive</p>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {isConnected ? "Connected & ready to upload" : "Not connected"}
            </p>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-border/40 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9 border border-border">
              {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
              <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600">
            <Video className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">RecStudio</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-border/40">
                <span className="font-bold">Menu</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-border/40 p-3">
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar className="h-9 w-9">
                    {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                    <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="pt-14 lg:pt-0 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
