import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, FileText } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Speak Up Safely
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          A secure platform for reporting wrongdoing while protecting your identity.
          Your voice matters in making positive change.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/submit">
            <Button size="lg" className="gap-2">
              <FileText className="h-5 w-5" />
              Submit Report
            </Button>
          </Link>
          <Link href="/track">
            <Button size="lg" variant="outline" className="gap-2">
              <Shield className="h-5 w-5" />
              Track Report
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-24 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col items-center text-center">
          <Shield className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Anonymous Reporting</h3>
          <p className="text-muted-foreground">
            Submit reports without revealing your identity. Your privacy is our priority.
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <FileText className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Evidence Upload</h3>
          <p className="text-muted-foreground">
            Securely upload supporting documents and files to strengthen your report.
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <Shield className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure Tracking</h3>
          <p className="text-muted-foreground">
            Monitor the status of your report using a secure anonymous token.
          </p>
        </div>
      </div>
    </div>
  );
}
