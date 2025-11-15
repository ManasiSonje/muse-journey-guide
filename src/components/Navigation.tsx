import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, Building2, MessageCircle, ChevronDown, Shield, Sparkles } from 'lucide-react';
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
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 bg-background/95 border-b border-border backdrop-blur-xl shadow-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-md"
            >
              <Building2 className="w-5 h-5 text-background" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-foreground">
                ExhibitLink
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider">
                MUSEUM EXPLORER
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              
              return (
                <Link
                  key={link.href}
                  to={link.href}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      active
                        ? 'bg-foreground text-background shadow-md'
                        : 'text-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="relative z-10">{link.label}</span>
                    {active && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute inset-0 rounded-xl border-2 border-muted-foreground/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Authentication Controls */}
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
              <div className="hidden sm:block w-20 h-4 rounded bg-muted animate-pulse" />
            </div>
          ) : user ? (
            /* Profile Dropdown */
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-muted/50 border border-border hover:border-foreground/30 transition-all duration-300 hover:shadow-md"
                >
                  <Avatar className="w-9 h-9 border-2 border-border">
                    <AvatarFallback className="bg-foreground text-background font-bold text-sm">
                      {profile?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold text-foreground">
                      {profile?.full_name?.split(' ')[0] || 'User'}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Admin
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-background/98 border-border backdrop-blur-xl shadow-xl z-[100]"
              >
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold text-foreground mb-0.5">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {isAdmin && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center text-xs text-foreground font-medium mt-2 px-2 py-1 rounded-md bg-muted border border-border"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Administrator
                    </motion.span>
                  )}
                </div>
                <div className="py-1">
                  <DropdownMenuItem className="hover:bg-muted cursor-pointer mx-1 rounded-lg transition-colors">
                    <User className="w-4 h-4 mr-3 text-foreground" />
                    <span className="font-medium">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-muted cursor-pointer mx-1 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 mr-3 text-foreground" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="hover:bg-muted cursor-pointer mx-1 rounded-lg transition-colors">
                      <Shield className="w-4 h-4 mr-3 text-foreground" />
                      <span className="font-medium">Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-border my-1" />
                <div className="py-1">
                  <DropdownMenuItem 
                    className="hover:bg-destructive/10 cursor-pointer mx-1 rounded-lg transition-colors text-destructive focus:text-destructive"
                    onClick={signOut}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Login/Signup Buttons */
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <EnhancedButton 
                  variant="ghost" 
                  size="sm" 
                  className="border border-border hover:border-foreground/30 hover:bg-muted"
                >
                  Login
                </EnhancedButton>
              </Link>
              <Link to="/signup">
                <EnhancedButton 
                  variant="default" 
                  size="sm"
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
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