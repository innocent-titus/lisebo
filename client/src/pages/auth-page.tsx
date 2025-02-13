import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    return <Redirect to="/admin/dashboard" />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 p-6">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input {...loginForm.register("username")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input type="password" {...loginForm.register("password")} />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form
                onSubmit={registerForm.handleSubmit((data) =>
                  registerMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input {...registerForm.register("username")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input type="password" {...registerForm.register("password")} />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  Register
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-muted">
        <div className="max-w-md text-center">
          <Shield className="h-16 w-16 mx-auto text-primary mb-6" />
          <h2 className="text-2xl font-bold mb-4">Admin Portal</h2>
          <p className="text-muted-foreground">
            Secure access for authorized personnel to manage and review submitted
            reports.
          </p>
        </div>
      </div>
    </div>
  );
}
