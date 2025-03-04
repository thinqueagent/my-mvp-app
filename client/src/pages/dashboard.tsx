import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Book, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import SidebarNav from "@/components/sidebar-nav";
import ContentPreview from "@/components/content-preview";
import AnalyticsCard from "@/components/analytics-card";
import BrandSetupBanner from "@/components/brand-setup-banner";
import type { Content, BrandGuideline } from "@shared/schema";

export default function Dashboard() {
  const { data: content } = useQuery<Content[]>({
    queryKey: ["/api/content"],
  });

  const { data: guidelines } = useQuery<BrandGuideline[]>({
    queryKey: ["/api/guidelines"],
  });

  const recentContent = content?.slice(0, 3) || [];
  const hasGuidelines = guidelines && guidelines.length > 0;
  const hasContent = recentContent.length > 0;

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {!hasGuidelines && <BrandSetupBanner />}

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Brand Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{guidelines?.length || 0}</div>
                <Link href="/brand-guidelines">
                  <Button className="mt-4 w-full" variant="outline">
                    <Book className="mr-2 h-4 w-4" />
                    Manage Guidelines
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <AnalyticsCard
              title="Total Engagement"
              value="2,890"
              change={12.5}
              data={[
                { date: "Mon", value: 145 },
                { date: "Tue", value: 230 },
                { date: "Wed", value: 202 },
                { date: "Thu", value: 190 },
                { date: "Fri", value: 260 },
                { date: "Sat", value: 280 },
                { date: "Sun", value: 310 },
              ]}
            />

            <AnalyticsCard
              title="Reach"
              value="14.2k"
              change={8.2}
              data={[
                { date: "Mon", value: 1200 },
                { date: "Tue", value: 1400 },
                { date: "Wed", value: 1350 },
                { date: "Thu", value: 1500 },
                { date: "Fri", value: 1800 },
                { date: "Sat", value: 2000 },
                { date: "Sun", value: 2200 },
              ]}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Content</h2>
              <Link href="/content">
                <Button>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Create Content
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentContent.map((item) => (
                <ContentPreview key={item.id} content={item} />
              ))}
              {recentContent.length === 0 && hasGuidelines && (
                <Card className="col-span-3">
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <p className="text-muted-foreground">Ready to create your first post?</p>
                    <Link href="/ai-assistant">
                      <Button variant="link">Let AI help you get started</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/analytics">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Full Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}