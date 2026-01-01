import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

const AddItemModal = ({ isOpen, onClose, onItemAdded }: AddItemModalProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);

    try {
      // 1. Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "You must be logged in to save items.",
        });
        return;
      }

      // 2. Insert into Supabase (Instant Save)
      // FIX: Cast 'supabase' to 'any' to completely bypass the missing type definition error
      const { error } = await (supabase as any)
        .from('items') 
        .insert({
          original_url: url,
          user_id: user.id,
          is_processed: false 
        });

      if (error) throw error;

      // 3. Success Handler
      toast({
        title: "Saved to Stash",
        description: "Link saved! We're fetching its details in the background.",
      });

      setUrl(""); // Clear input
      onItemAdded?.(); // Refresh the list if needed
      onClose(); // Close modal

    } catch (error: any) {
      console.error("Error saving item:", error);
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card glow-border w-full max-w-lg rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <Sparkles className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Add to Stash</h2>
                  <p className="text-sm text-muted-foreground">Save a link for later</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Paste URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  autoFocus 
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-border bg-secondary/30 text-foreground hover:bg-secondary/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="flex-1 gradient-primary text-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save to Stash"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddItemModal;