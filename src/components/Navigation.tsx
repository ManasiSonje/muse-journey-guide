import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, Building2, MessageCircle, MapPin, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navigation = () => {
  const location = useLocation();
  
  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Building2 },
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
          <Link to="/" className="flex items-center space-x-3 group">
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

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full glow-hover">
                <Avatar className="h-10 w-10 border border-golden/20">
                  <AvatarFallback className="bg-card text-golden font-semibold">
                    MU
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-card/95 border-border/20 glass mt-2"
              align="end"
            >
              <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/20" />
              <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-destructive">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;