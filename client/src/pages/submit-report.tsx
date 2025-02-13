import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertReportSchema, REPORT_CATEGORIES } from "@shared/schema";
import MultiStepForm from "@/components/multi-step-form";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload } from "lucide-react";
import CopyButton from "@/components/copy-button"; // Added import

export default function SubmitReport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    // Validate file size
    const invalidFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Some files exceed the 5MB limit",
        variant: "destructive",
      });
      return;
    }
    setFiles(selectedFiles);
    setSelectedFiles(selectedFiles.map(f => f.name));
  };

  const onSubmit = async (formData: any) => {
    try {
      setIsUploading(true);
      setUploadProgress("Submitting report...");

      // Submit report first
      const reportResponse = await apiRequest("POST", "/api/reports", formData);
      const report = await reportResponse.json();

      // Upload evidence if files exist
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress(`Uploading file ${i + 1} of ${files.length}: ${file.name}`);

          const formData = new FormData();
          formData.append("file", file);
          formData.append("reportId", report.id);

          try {
            await apiRequest("POST", "/api/evidence/upload", formData);
          } catch (error: any) {
            toast({
              title: `Failed to upload ${file.name}`,
              description: error.message,
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Report submitted successfully",
        description: (
          <div className="space-y-2">
            <p>Your tracking token is:</p>
            <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <code className="text-sm">{report.anonymousToken}</code>
              <CopyButton value={report.anonymousToken} />
            </div>
            <p className="text-sm">Please save this to track your report.</p>
          </div>
        ),
      });
      setLocation("/track");
    } catch (error: any) {
      toast({
        title: "Error submitting report",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const steps = [
    {
      title: "Basic Info",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input {...form.register("title")} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => form.setValue("category", value)}
              value={form.watch("category")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      isValid: !!form.watch("title") && !!form.watch("category"),
    },
    {
      title: "Details",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea {...form.register("description")} className="h-32" />
          </div>
          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input {...form.register("location")} />
          </div>
        </div>
      ),
      isValid: !!form.watch("description"),
    },
    {
      title: "Evidence",
      content: (
        <div className="space-y-4">
          <Label>Upload Evidence (Optional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Input
              type="file"
              onChange={handleFileSelect}
              multiple
              accept="image/jpeg,image/png,application/pdf,text/plain"
              className="hidden"
              id="file-upload"
            />
            <Label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to select files or drag and drop
              </span>
            </Label>
            {selectedFiles.length > 0 && (
              <div className="mt-4 text-sm text-left">
                <p className="font-medium mb-2">Selected files:</p>
                <ul className="space-y-1">
                  {selectedFiles.map((filename, index) => (
                    <li key={index} className="text-muted-foreground">
                      {filename}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Accepted file types: JPEG, PNG, PDF, TXT (Max 5MB each)
          </p>
        </div>
      ),
      isValid: true, // Allow proceeding even without files
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Submit a Report</h1>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MultiStepForm
          steps={steps}
          onComplete={form.handleSubmit(onSubmit)}
          isSubmitting={isUploading}
        />
        {isUploading && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>{uploadProgress || "Uploading..."}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}