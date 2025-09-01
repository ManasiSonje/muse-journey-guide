import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background bg-museum-pattern flex items-center justify-center">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="glass-strong rounded-3xl p-12 border border-golden/20 shadow-elevated">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="space-y-8"
            >
              {/* 404 Text with Glow Effect */}
              <h1 className="font-display text-8xl font-bold text-glow-golden">
                404
              </h1>
              
              {/* Error Message */}
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-semibold text-foreground">
                  Oops! Exhibit Not Found
                </h2>
                <p className="text-xl text-muted-foreground">
                  This page seems to have gone missing from our museum collection. 
                  Let's get you back to exploring amazing cultural experiences.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <EnhancedButton variant="hero" size="lg">
                    <Home className="w-5 h-5 mr-2" />
                    Return to Dashboard
                  </EnhancedButton>
                </Link>
                
                <EnhancedButton 
                  variant="museum" 
                  size="lg"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </EnhancedButton>
              </div>

              {/* Helpful Links */}
              <div className="pt-6 border-t border-border/20">
                <p className="text-sm text-muted-foreground mb-4">
                  Or explore these popular sections:
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/">
                    <EnhancedButton variant="ghost" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search Museums
                    </EnhancedButton>
                  </Link>
                  <Link to="/chatbot">
                    <EnhancedButton variant="ghost" size="sm">
                      Chat with MuseMate
                    </EnhancedButton>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
