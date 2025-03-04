import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag } from "lucide-react";

export default function Campaigns() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Campaign management features are coming soon. You'll be able to organize and plan your content campaigns here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
