import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquarePlus,
  BarChart,
  LogOut,
  Image as ImageIcon,
  Flag,
  Bot,
  Settings,
  HelpCircle,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Brand Guidelines", href: "/brand-guidelines", icon: BookOpen },
  { name: "Content Manager", href: "/content", icon: MessageSquarePlus },
  { name: "Media Library", href: "/media", icon: ImageIcon },
  { name: "Campaigns", href: "/campaigns", icon: Flag },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Resources", href: "/help", icon: HelpCircle },
];

export default function SidebarNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex h-screen flex-col gap-y-5 bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-lg font-semibold">Social AI Manager</span>
      </div>
      <ScrollArea className="flex grow flex-col gap-y-5 overflow-y-auto border-t border-sidebar-border px-6">
        <nav className="flex flex-1 flex-col pt-5">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          location === item.href
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold"
                        )}
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </ScrollArea>

      <div className="flex shrink-0 p-6 border-t border-sidebar-border">
        <div className="flex items-center gap-x-4 w-full">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate capitalize">
              {user?.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}