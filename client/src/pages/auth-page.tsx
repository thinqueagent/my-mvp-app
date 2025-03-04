import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter"; // Change from Redirect to useLocation
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiX } from "react-icons/si";
import { FaInstagram, FaLinkedin, FaPinterest } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const loginForm = useForm({
    defaultValues: { username: "", password: "" },
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true }))
  });

  const registerForm = useForm({
    defaultValues: { username: "", password: "", role: "editor" as const },
    resolver: zodResolver(insertUserSchema)
  });

  // Use effect to handle navigation when user is logged in
  if (user) {
    navigate("/brand-setup");
    return null;
  }

  const handleRegistrationError = (error: Error) => {
    toast({
      title: "Registration failed",
      description: error.message || "Please try again with a different username",
      variant: "destructive",
    });
  };

  const handleLoginError = (error: Error) => {
    toast({
      title: "Login failed",
      description: "Invalid username or password",
      variant: "destructive",
    });
  };

  const handleLoginSuccess = () => {
    navigate("/brand-setup");
  };

  const handleRegisterSuccess = () => {
    navigate("/brand-setup");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form 
                    onSubmit={loginForm.handleSubmit(
                      data => loginMutation.mutate(data, {
                        onSuccess: handleLoginSuccess,
                        onError: handleLoginError
                      })
                    )} 
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form 
                    onSubmit={registerForm.handleSubmit(
                      data => registerMutation.mutate(data, {
                        onSuccess: handleRegisterSuccess,
                        onError: handleRegistrationError
                      })
                    )} 
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
        <h1 className="text-4xl font-bold mb-6">Thinque Smarter. Not Harder.</h1>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FaInstagram className="w-6 h-6" />
            <SiX className="w-6 h-6" />
            <FaLinkedin className="w-6 h-6" />
            <FaPinterest className="w-6 h-6" />
          </div>
          <p className="text-lg">Your AI-powered content strategist—creating, scheduling, and optimizing so you can focus on what's next.</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-primary-foreground/90">•</span>
              <span>Smart content generation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-foreground/90">•</span>
              <span>Brand voice consistency</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-foreground/90">•</span>
              <span>Automated scheduling</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-foreground/90">•</span>
              <span>Performance analytics</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}