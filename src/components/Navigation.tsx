import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, Building2, MessageCircle, MapPin, Calendar, ChevronDown, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, isAdmin, loading } = useAuth();
  
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Building2 },
    { href: '/chatbot', label: 'MuseMate', icon: MessageCircle },
    { href: '/museums', label: 'Museums', icon: MapPin },
    { href: '/trips', label: 'My Trips', icon: Calendar },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 glass border-b border-border/20"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center"
            >
              <Building2 className="w-5 h-5 text-black" />
            </motion.div>
            <span className="font-display text-xl font-bold text-glow-golden">
              ExhibitLink
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative font-medium transition-smooth ${
                  isActive(link.href)
                    ? 'text-golden text-glow-golden'
                    : 'text-foreground hover:text-golden'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive(link.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-golden glow-golden"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Authentication Controls */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            /* Profile Dropdown */
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 p-2 rounded-xl glass border border-border/20 hover:border-golden/50 transition-all duration-300 hover:glow-golden"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-primary text-black font-semibold">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 glass border-border/20 bg-background/95 backdrop-blur-sm"
              >
                <div className="px-3 py-2 border-b border-border/20">
                  <p className="text-sm font-medium text-foreground">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {isAdmin && (
                    <span className="inline-flex items-center text-xs text-golden font-medium mt-1">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </span>
                  )}
                </div>
                <DropdownMenuItem className="hover:bg-accent/50">
                  <User className="w-4 h-4 mr-2" />
                  My Trips
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent/50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem className="hover:bg-accent/50 text-golden">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border/20" />
                <DropdownMenuItem 
                  className="hover:bg-accent/50 text-red-400"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Login/Signup Buttons */
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <EnhancedButton variant="ghost" size="sm" className="glass border-border/20 hover:border-golden/50 hover:glow-golden">
                  Login
                </EnhancedButton>
              </Link>
              <Link to="/signup">
                <EnhancedButton variant="hero" size="sm">
                  Sign Up
                </EnhancedButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;