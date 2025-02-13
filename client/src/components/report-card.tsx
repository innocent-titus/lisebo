import { Report } from "@shared/schema";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ClipboardCheck,
} from "lucide-react";
import { format } from "date-fns";

interface ReportCardProps {
  report: Report;
  showActions?: boolean;
  onStatusChange?: (id: string, status: string) => void;
}

const statusIcons = {
  pending: Clock,
  under_review: AlertCircle,
  verified: CheckCircle2,
  closed: XCircle,
  rejected: XCircle,
};

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500",
  under_review: "bg-blue-500/10 text-blue-500",
  verified: "bg-green-500/10 text-green-500",
  closed: "bg-gray-500/10 text-gray-500",
  rejected: "bg-red-500/10 text-red-500",
};

export default function ReportCard({
  report,
  showActions = false,
  onStatusChange,
}: ReportCardProps) {
  const StatusIcon = statusIcons[report.status as keyof typeof statusIcons];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{report.title}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(report.createdAt), "PPP")}
          </p>
        </div>
        <Badge 
          variant="secondary"
          className={statusColors[report.status as keyof typeof statusColors]}
        >
          <StatusIcon className="w-4 h-4 mr-1" />
          {report.status.replace("_", " ").toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">{report.description}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Category: {report.category}</span>
            {report.location && <span>Location: {report.location}</span>}
          </div>
        </div>
      </CardContent>
      {showActions && onStatusChange && (
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(report.id, "under_review")}
            disabled={report.status !== "pending"}
          >
            <ClipboardCheck className="w-4 h-4 mr-1" />
            Review
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(report.id, "verified")}
            disabled={report.status !== "under_review"}
            className="text-green-500"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Verify
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(report.id, "rejected")}
            disabled={report.status === "closed" || report.status === "rejected"}
            className="text-red-500"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
