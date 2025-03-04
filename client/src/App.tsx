import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import Dashboard from "@/pages/dashboard";
import BrandGuidelines from "@/pages/brand-guidelines";
import BrandSetup from "@/pages/brand-setup";
import ContentManager from "@/pages/content-manager";
import Analytics from "@/pages/analytics";
import MediaLibrary from "@/pages/media-library";
import Campaigns from "@/pages/campaigns";
import AIAssistant from "@/pages/ai-assistant";
import Settings from "@/pages/settings";
import Help from "@/pages/help";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/brand-setup" component={BrandSetup} />
      <ProtectedRoute path="/brand-guidelines" component={BrandGuidelines} />
      <ProtectedRoute path="/content" component={ContentManager} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/media" component={MediaLibrary} />
      <ProtectedRoute path="/campaigns" component={Campaigns} />
      <ProtectedRoute path="/ai-assistant" component={AIAssistant} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;