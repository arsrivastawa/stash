import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Layers,
  LogOut,
  Settings,
  User,
  Video,
  FileText,
  Code,
  Share2,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import AddItemModal from "@/components/AddItemModal"; 
// Note: Ensure ItemCard is imported correctly based on where you saved it
import ItemCard from "@/components/ItemCard"; 
import { useToast } from "@/hooks/use-toast";
import SettingsModal from "@/components/SettingsModal";
import ProfileModal from "@/components/ProfileModal";

// --- Types ---
export type FilterType = "All" | "Videos" | "Articles" | "Code" | "Social";

// We use snake_case here to match Supabase DB columns and ItemCard props
export interface StashItem {
  id: string;
  title: string | null;
  description: string | null;
  original_url: string; 
  image_url: string | null;
  created_at: string;
  is_processed: boolean;
  type: "Video" | "Article" | "Code" | "Social"; // Inferred type for filtering
}

// --- Configuration ---
const filterConfig: {
  label: FilterType;
  icon: React.ElementType;
  type?: StashItem["type"];
}[] = [
  { label: "All", icon: LayoutGrid },
  { label: "Videos", icon: Video, type: "Video" },
  { label: "Articles", icon: FileText, type: "Article" },
  { label: "Code", icon: Code, type: "Code" },
  { label: "Social", icon: Share2, type: "Social" },
];

// --- Helper: Auto-determine content type from URL ---
const determineType = (url: string): StashItem["type"] => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerUrl.includes("vimeo")) return "Video";
  if (lowerUrl.includes("github.com") || lowerUrl.includes("gitlab") || lowerUrl.includes("stackoverflow")) return "Code";
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com") || lowerUrl.includes("instagram") || lowerUrl.includes("linkedin") || lowerUrl.includes("reddit")) return "Social";
  return "Article"; // Default fallback
};

const Dashboard = () => {
  const [items, setItems] = useState<StashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [compactView, setCompactView] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- 1. Fetch Items (Supabase) ---
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth"); // Redirect if not logged in
        return;
      }

      // FIX #1: Cast supabase to 'any' to bypass the type error
      const { data, error } = await (supabase as any)
        .from('items')
        .select('*')
        .eq('user_id', user.id) // Only fetch my items
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map DB data and add the 'type' field for filtering
      const formattedItems: StashItem[] = (data || []).map((item: any) => ({
        ...item,
        type: determineType(item.original_url) // Infer type on the fly
      }));

      setItems(formattedItems);

    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error loading stash",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchItems();
  }, []);

  // --- 2. Filtering Logic ---
  const filteredItems = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    return items.filter((item) => {
      // Search Logic (safe check for nulls)
      const matchesSearch =
        (item.title || "").toLowerCase().includes(lowerQuery) ||
        (item.description || "").toLowerCase().includes(lowerQuery) ||
        (item.original_url || "").toLowerCase().includes(lowerQuery);

      // Filter Logic (Tabs)
      const targetType = filterConfig.find(f => f.label === activeFilter)?.type;
      const matchesFilter = activeFilter === "All" || item.type === targetType;

      return matchesSearch && matchesFilter;
    });
  }, [items, searchQuery, activeFilter]);

  // --- 3. Actions ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteItem = async (id: string) => {
    // 1. Optimistic Update: Remove from UI immediately for speed
    const previousItems = [...items];
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      // FIX #2: Cast supabase to 'any' to bypass the type error
      const { error } = await (supabase as any)
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item removed",
        description: "The item has been permanently deleted.",
      });

    } catch (error) {
      console.error("Error deleting item:", error);
      // 3. Revert if failed
      setItems(previousItems);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleItemAdded = () => {
    // Refresh list when new item is added via modal
    fetchItems();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Stash
              </span>
            </div>

            {/* Desktop Search */}
            <div className="flex-1 max-w-xl hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="search"
                  placeholder="Search your stash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* FIX #3: Separated the Button from the Modal */}
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="gradient-primary text-white font-medium hover:opacity-90 transition-opacity rounded-full shadow-lg shadow-indigo-500/20"
              >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add New</span>
              </Button>

              {/* The Modal lives outside the button now */}
              <AddItemModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onItemAdded={handleItemAdded} 
              />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-2 ring-zinc-800 hover:ring-indigo-500 transition-colors overflow-hidden h-9 w-9">
                    <Avatar className="h-full w-full">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200">
                  <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer focus:bg-zinc-800">
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="cursor-pointer focus:bg-zinc-800">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="pb-4 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {filterConfig.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveFilter(label)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeFilter === label
                  ? "gradient-primary text-white shadow-lg shadow-indigo-500/25"
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            {activeFilter !== "All" && <span className="text-indigo-400"> • {activeFilter}</span>}
          </p>
        </div>

        {/* Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item} 
                index={index}
                deleteHandler={handleDeleteItem}
                isCompact={compactView}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900 border border-zinc-800">
              <Search className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-200 mb-2">
              No items found
            </h3>
            <p className="text-zinc-500 max-w-sm mb-8">
              {searchQuery
                ? `No results found for "${searchQuery}". Try a different keyword.`
                : "Your stash is looking empty. Add your first link to get started!"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gradient-primary text-white rounded-full px-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </motion.div>
        )}
      </main>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        compactView={compactView}
        onCompactViewChange={setCompactView}
      />
    </div>
  );
};

export default Dashboard;