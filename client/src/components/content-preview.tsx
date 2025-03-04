import { type Content } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ThumbsUp, MessageSquare, RefreshCw, Image as ImageIcon } from "lucide-react";

interface ContentPreviewProps {
  content: Content;
  onApprove?: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

export default function ContentPreview({ content, onApprove, onRegenerate, isLoading }: ContentPreviewProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      posted: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {content.platform.charAt(0).toUpperCase() + content.platform.slice(1)}
        </CardTitle>
        <Badge className={getStatusColor(content.status)}>{content.status}</Badge>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm">{content.content}</p>

        {content.mediaUrl && (
          <div className="mt-4 relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={content.mediaUrl} 
              alt="Content media" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        {content.scheduledFor && (
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Scheduled for {formatDate(new Date(content.scheduledFor))}</span>
          </div>
        )}

        {content.engagement && (
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>{content.engagement.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{content.engagement.comments || 0}</span>
            </div>
          </div>
        )}
      </CardContent>

      {(onApprove || onRegenerate) && (
        <CardFooter className="flex justify-end gap-2">
          {onRegenerate && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
          )}
          {onApprove && content.status === "pending" && (
            <Button 
              size="sm"
              onClick={onApprove}
              disabled={isLoading}
            >
              Approve
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}