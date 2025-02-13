import { Link } from "wouter";
import { Github, Shield, FileText, Phone, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">About Lisebo</h3>
            <p className="text-sm text-muted-foreground">
              A secure and anonymous whistleblowing platform designed to facilitate
              report submissions while protecting informant identities.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/submit">
                  <a className="text-muted-foreground hover:text-primary flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Submit Report
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/track">
                  <a className="text-muted-foreground hover:text-primary flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Track Report
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/auth">
                  <a className="text-muted-foreground hover:text-primary flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy">
                  <a className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-muted-foreground hover:text-primary">
                    Terms of Use
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-muted-foreground hover:text-primary">
                    FAQ
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                Emergency Hotline
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                support@lisebo.org
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Lisebo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
