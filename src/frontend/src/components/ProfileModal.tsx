import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, User, Mail, Hash, Calendar } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Profile</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">
                      {user?.email ? getInitials(user.email) : <User className="h-10 w-10" />}
                    </span>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      value={user?.email || ""}
                      readOnly
                      className="bg-secondary/50 border-border cursor-default opacity-70"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      User ID
                    </Label>
                    <Input
                      value={user?.id || ""}
                      readOnly
                      className="bg-secondary/50 border-border cursor-default opacity-70 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <Input
                      value={formatDate(user?.created_at)}
                      readOnly
                      className="bg-secondary/50 border-border cursor-default opacity-70"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    onClick={onClose}
                    className="w-full bg-secondary text-foreground hover:bg-secondary/80"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
