import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

export default function MediaLibrary() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The Media Library feature is under development. Soon you'll be able to manage all your media assets here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
