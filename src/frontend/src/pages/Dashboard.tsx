import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import ContentCard, { ContentItem } from "@/components/ContentCard";
import AddItemModal from "@/components/AddItemModal";
import ProfileModal from "@/components/ProfileModal";
import SettingsModal from "@/components/SettingsModal";
import { useToast } from "@/hooks/use-toast";
import ItemCard from "@/components/ItemCard";

import { MOCK_ITEMS, StashItem } from "@/lib/mockData";

type FilterType = "All" | "Videos" | "Articles" | "Code" | "Social";

const filterConfig: {
  label: FilterType;
  icon: React.ElementType;
  type?: ContentItem["type"];
}[] = [
  { label: "All", icon: LayoutGrid },
  { label: "Videos", icon: Video, type: "Video" },
  { label: "Articles", icon: FileText, type: "Article" },
  { label: "Code", icon: Code, type: "Code" },
  { label: "Social", icon: Share2, type: "Social" },
];

const Dashboard = () => {
  const [items, setItems] = useState<StashItem[]>(MOCK_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Videos" && item.type === "video") ||
        (activeFilter === "Articles" && item.type === "article") ||
        (activeFilter === "Code" && item.type === "code") ||
        (activeFilter === "Social" && item.type === "social");

      return matchesSearch && matchesFilter;
    });
  }, [items, searchQuery, activeFilter]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Item deleted",
      description: "The item has been removed from your stash.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                <Layers className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xl font-semibold gradient-text">Stash</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search your stash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gradient-primary text-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add New</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-2 ring-border hover:ring-primary transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-secondary text-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-card border-border"
                >
                  <DropdownMenuItem
                    onClick={() => setIsProfileOpen(true)}
                    className="text-foreground focus:bg-secondary cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-foreground focus:bg-secondary cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="pb-4 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search your stash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border focus:border-primary"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {filterConfig.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveFilter(label)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilter === label
                  ? "gradient-primary text-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"} in your stash
            {activeFilter !== "All" && ` • Filtered by ${activeFilter}`}
            {searchQuery && ` • Searching "${searchQuery}"`}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* <AnimatePresence mode="popLayout"> */}
            {filteredItems.map((item, index) => (
              <ItemCard
                index={index}
                key={item.id}
                item={item}
                // onDelete={handleDeleteItem}
              />
            ))}
          {/* </AnimatePresence> */}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No items found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Start adding items to your stash"}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gradient-primary text-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </motion.div>
        )}
      </main>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Profile Modal */}
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
