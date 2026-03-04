import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { auth } from "@/integrations/firebase/client";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "ADOPT", path: "/adopt" },
    { name: "PET HOSTING", path: "/hosting" },
    { name: "LOST & FOUND", path: "/lost-found" },
    { name: "Services", path: "/features" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 text-white">
      <nav
        className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-300 ${isScrolled ? "bg-background/90 backdrop-blur-md border-b border-white/10" : "bg-transparent"
          }`}
      >
        {/* LOGO */}
        <Link to="/" className="group">
          <span className="font-display text-3xl tracking-tighter uppercase relative z-10">
            Paws<span className="text-primary font-script lowercase text-4xl ml-1">Home</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-bold tracking-widest hover:text-primary transition-colors uppercase ${location.pathname === link.path ? "text-primary border-b-2 border-primary" : "text-white"
                }`}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-none border-white text-white hover:bg-primary hover:text-background hover:border-primary transition-all font-bold uppercase tracking-wider gap-2"
                >
                  <User className="h-4 w-4" />
                  {user.displayName?.split(' ')[0] || "User"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-zinc-950 border-white/10 text-white">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => navigate('/admin')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer"
                  onClick={() => {
                    signOut(auth);
                    toast.success("Logged out successfully");
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button
                variant="outline"
                className="rounded-none border-white text-white hover:bg-primary hover:text-background hover:border-primary transition-all font-bold uppercase tracking-wider"
              >
                Sign In
              </Button>
            </Link>
          )}

          <button className="text-white hover:text-primary transition-colors">
            <ShoppingBag className="w-6 h-6" />
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden text-white hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-40 flex flex-col justify-center items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-display text-5xl text-white hover:text-primary hover:italic transition-all uppercase"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <Button
              className="rounded-none bg-red-600/20 text-red-500 border border-red-500/50 px-8 py-6 text-xl font-bold uppercase"
              onClick={() => {
                signOut(auth);
                setIsMobileMenuOpen(false);
                toast.success("Logged out successfully");
              }}
            >
              Sign Out
            </Button>
          ) : (
            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="rounded-none bg-primary text-background px-8 py-6 text-xl font-bold uppercase">
                Sign In Account
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Navigation;