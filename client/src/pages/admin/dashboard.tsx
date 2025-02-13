import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ReportCard from "@/components/report-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/reports/${id}/status`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Status updated",
        description: "The report status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    },
  });

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    verified: reports.filter((r) => r.status === "verified").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  const statusGroups = {
    pending: reports.filter((r) => r.status === "pending"),
    under_review: reports.filter((r) => r.status === "under_review"),
    verified: reports.filter((r) => r.status === "verified"),
    closed: reports.filter((r) => r.status === "closed"),
    rejected: reports.filter((r) => r.status === "rejected"),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              showActions
              onStatusChange={(id, status) =>
                updateStatusMutation.mutate({ id, status })
              }
            />
          ))}
        </TabsContent>

        {Object.entries(statusGroups).map(([status, reports]) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                showActions
                onStatusChange={(id, status) =>
                  updateStatusMutation.mutate({ id, status })
                }
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
