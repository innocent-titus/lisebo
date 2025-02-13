import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Wifi, WifiOff, Menu, X, Download } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const { connected } = useNotifications();
  const { isInstallable, install } = usePWA();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-semibold cursor-pointer">
            Lisebo
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Desktop and Mobile Menu */}
        <div className={`
          absolute md:relative top-16 md:top-0 left-0 right-0
          bg-background md:bg-transparent
          border-b md:border-0
          p-4 md:p-0
          ${isMenuOpen ? 'flex' : 'hidden'} md:flex
          flex-col md:flex-row
          items-start md:items-center
          gap-4
          md:gap-4
          z-50
        `}>
          <Badge 
            variant={connected ? "default" : "destructive"}
            className="gap-1"
          >
            {connected ? (
              <>
                <Wifi className="w-3 h-3" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Disconnected
              </>
            )}
          </Badge>

          {isInstallable && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={install}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Install App
            </Button>
          )}

          {user ? (
            <>
              <Link href="/admin/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/submit">
                <Button variant="ghost">Submit Report</Button>
              </Link>
              <Link href="/track">
                <Button variant="ghost">Track Report</Button>
              </Link>
              <Link href="/auth">
                <Button>Admin Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}