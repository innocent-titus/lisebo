import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import ReportCard from "@/components/report-card";
import { getQueryFn } from "@/lib/queryClient";
import { Report } from "@shared/schema";

export default function TrackReport() {
  const [token, setToken] = useState<string>("");
  const form = useForm({
    defaultValues: {
      token: "",
    },
  });

  const { data: report, isLoading } = useQuery<Report>({
    queryKey: ["/api/reports/track/" + token, token],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!token,
  });

  const onSubmit = (data: { token: string }) => {
    setToken(data.token.trim());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Track Your Report</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="token">Anonymous Token</Label>
                <div className="flex gap-2">
                  <Input
                    {...form.register("token")}
                    placeholder="Enter your tracking token"
                  />
                  <Button type="submit" className="gap-2" disabled={isLoading}>
                    <Search className="w-4 h-4" />
                    Track
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center text-muted-foreground">
            Loading report...
          </div>
        )}

        {token && !isLoading && !report && (
          <div className="text-center text-muted-foreground">
            No report found with this token. Please check the token and try again.
          </div>
        )}

        {report && <ReportCard report={report} />}
      </div>
    </div>
  );
}