import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SidebarNav from "@/components/sidebar-nav";
import AnalyticsCard from "@/components/analytics-card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import type { Content, ContextHistory } from "@shared/schema";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("7d");
  const [platform, setPlatform] = useState<"all" | "twitter" | "instagram" | "tiktok">("all");

  const { data: content } = useQuery<Content[]>({
    queryKey: ["/api/content"],
  });

  // Get context history for performance analysis
  const { data: contextHistory } = useQuery<ContextHistory[]>({
    queryKey: ["/api/content/context"],
  });

  // Filter content by platform if selected
  const filteredContent = content?.filter(
    (item) => platform === "all" || item.platform === platform
  );

  // Calculate platform-specific metrics
  const platformMetrics = content?.reduce((acc, item) => {
    const platform = item.platform;
    acc[platform] = acc[platform] || { posts: 0, engagement: 0, effectiveness: 0 };
    acc[platform].posts += 1;

    const engagement = item.engagement as Record<string, number>;
    acc[platform].engagement += Object.values(engagement).reduce((sum, val) => sum + val, 0);

    // Get effectiveness from context history
    const itemContext = contextHistory?.find(c => c.contentId === item.id);
    if (itemContext?.performance) {
      acc[platform].effectiveness += (itemContext.performance as any).effectiveness || 0;
    }

    return acc;
  }, {} as Record<string, { posts: number; engagement: number; effectiveness: number }>);

  // Calculate engagement over time
  const timelineData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayContent = filteredContent?.filter(
      (item) => new Date(item.created).toDateString() === date.toDateString()
    );

    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      engagement: dayContent?.reduce((sum, item) => {
        const engagement = item.engagement as Record<string, number>;
        return sum + Object.values(engagement).reduce((total, val) => total + val, 0);
      }, 0) || 0,
      posts: dayContent?.length || 0,
    };
  });

  // Calculate content performance distribution
  const performanceData = contextHistory?.reduce((acc, context) => {
    const performance = context.performance as any;
    if (performance?.effectiveness) {
      const score = Math.floor(performance.effectiveness * 100);
      acc[score] = (acc[score] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <div className="flex gap-4">
              <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="twitter">X (Twitter)</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnalyticsCard
              title="Content Effectiveness"
              value={`${Math.round((platformMetrics?.[platform]?.effectiveness || 0) * 100)}%`}
              change={15.8}
              data={timelineData.map(d => ({ date: d.date, value: d.posts }))}
            />
            <AnalyticsCard
              title="Total Engagement"
              value={platformMetrics?.[platform]?.engagement.toLocaleString() || "0"}
              change={12.5}
              data={timelineData.map(d => ({ date: d.date, value: d.engagement }))}
            />
            <AnalyticsCard
              title="Content Published"
              value={platformMetrics?.[platform]?.posts || 0}
              change={8.2}
              data={timelineData.map(d => ({ date: d.date, value: d.posts }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="engagement"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(platformMetrics || {}).map(([platform, data]) => ({
                      platform: platform === "twitter" ? "X" : platform.charAt(0).toUpperCase() + platform.slice(1),
                      engagement: data.engagement,
                      posts: data.posts,
                      effectiveness: Math.round(data.effectiveness * 100)
                    }))}>
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="engagement" fill="hsl(var(--primary))" name="Engagement" />
                      <Bar dataKey="posts" fill="hsl(var(--primary)/0.3)" name="Posts" />
                      <Bar dataKey="effectiveness" fill="hsl(var(--primary)/0.6)" name="Effectiveness %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(performanceData || {}).map(([score, count]) => ({
                      score: `${score}%`,
                      count
                    }))}>
                      <XAxis dataKey="score" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="Content Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredContent?.sort((a, b) => {
                    const aEngagement = Object.values(a.engagement as Record<string, number>).reduce((sum, val) => sum + val, 0);
                    const bEngagement = Object.values(b.engagement as Record<string, number>).reduce((sum, val) => sum + val, 0);
                    return bEngagement - aEngagement;
                  }).slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm truncate">{item.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.platform === "twitter" ? "X" : item.platform.charAt(0).toUpperCase() + item.platform.slice(1)} • {new Date(item.created).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium">
                          {Object.values(item.engagement as Record<string, number>).reduce((sum, val) => sum + val, 0).toLocaleString()} total engagement
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(contextHistory?.find(c => c.contentId === item.id)?.performance as any)?.effectiveness
                            ? `${Math.round(((contextHistory?.find(c => c.contentId === item.id)?.performance as any)?.effectiveness || 0) * 100)}% effective`
                            : 'No effectiveness data'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}