import { motion } from "framer-motion";
import { ExternalLink, Trash2, Clock, Play, FileText, Code, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "Video" | "Article" | "Code" | "Social";
  thumbnail?: string;
  source: string;
  savedAt: Date;
}

interface ContentCardProps {
  item: ContentItem;
  onDelete?: (id: string) => void;
}

const typeIcons = {
  Video: Play,
  Article: FileText,
  Code: Code,
  Social: Share2,
};

const typeGradients = {
  Video: "from-rose-500/20 via-orange-500/20 to-amber-500/20",
  Article: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  Code: "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
  Social: "from-blue-500/20 via-indigo-500/20 to-violet-500/20",
};

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

const ContentCard = ({ item, onDelete }: ContentCardProps) => {
  const Icon = typeIcons[item.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group glass-card rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Thumbnail/Gradient Header */}
      <div
        className={cn(
          "relative h-32 bg-gradient-to-br",
          typeGradients[item.type]
        )}
      >
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-foreground">
            <Icon className="h-3 w-3" />
            {item.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-foreground line-clamp-2 mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>
        
        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[60%]">{item.source}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(item.savedAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
