import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, LogOut, Trash2, LayoutGrid, Moon } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  compactView: boolean;
  onCompactViewChange: (value: boolean) => void;
}

const SettingsModal = ({ isOpen, onClose, compactView, onCompactViewChange }: SettingsModalProps) => {
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    navigate("/auth");
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
              <h2 className="text-xl font-semibold text-foreground">Settings</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Section A: General */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                General
              </h3>
              
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-foreground font-medium">Compact View</Label>
                    <p className="text-xs text-muted-foreground">Hide images in the grid</p>
                  </div>
                </div>
                <Switch
                  checked={compactView}
                  onCheckedChange={onCompactViewChange}
                />
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/30 border border-border opacity-60">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-foreground font-medium">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Stash is designed in dark mode</p>
                  </div>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>

            {/* Section B: Account (Danger Zone) */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-medium text-destructive uppercase tracking-wider">
                Account
              </h3>
              
              <Button
                onClick={handleSignOut}
                disabled={signingOut}
                variant="destructive"
                className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
              >
                {signingOut ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Sign Out
              </Button>

              <button className="w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Stash v1.0.0 (Beta)
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
