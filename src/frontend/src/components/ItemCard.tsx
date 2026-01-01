import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trash2, Play, Code, MessageCircle, FileText } from 'lucide-react';
import type { ItemType } from '@/lib/mockData';
import { StashItem } from '@/pages/Dashboard';

interface ItemCardProps {
  item: StashItem;
  index: number;
  isCompact?: boolean;
  deleteHandler: (id: string) => void;
}

const typeIcons: Record<ItemType, React.ReactNode> = {
  video: <Play className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  social: <MessageCircle className="w-4 h-4" />,
  article: <FileText className="w-4 h-4" />,
  stashDefault: <FileText className="w-4 h-4" />,
};

const typeColors: Record<ItemType, string> = {
  video: 'from-red-500/20 to-orange-500/20',
  code: 'from-emerald-500/20 to-teal-500/20',
  social: 'from-blue-500/20 to-cyan-500/20',
  article: 'from-violet-500/20 to-purple-500/20',
  stashDefault: 'from-foreground/10 to-foreground/5',
};

const sourceColors: Record<string, string> = {
  YouTube: 'text-red-400',
  GitHub: 'text-emerald-400',
  Twitter: 'text-blue-400',
  Medium: 'text-foreground',
  Substack: 'text-orange-400',
};

const parseDate = (dateString: string) =>{
  const date = new Date(dateString);
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if(diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if(diffInSeconds < 3600){
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    return `${diffInMinutes} minutes ago`;
  }
  if(diffInSeconds < 86400){
    const diffInHours = Math.floor(diffInSeconds / 3600);
    return `${diffInHours} hours ago`;
  }
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if(diffInDays < 7) return `${diffInDays} days ago`;
  if(diffInDays < 30){
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if(diffInMonths < 12) return `${diffInMonths} months ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} years ago`;
}

const ItemCard = ({ item, index, deleteHandler, isCompact }: ItemCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        // delay: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-border-subtle transition-all duration-300 card-glow hover:card-glow-hover break-inside-avoid mb-4"
    >
      {/* Image or Gradient Placeholder */}
      {item.image_url && !isCompact ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      ) : (
        <div className={`relative h-32 bg-gradient-to-br ${typeColors[item.type]}`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="text-foreground scale-150">
              {item.type !== undefined ? typeIcons[item.type] : typeIcons.stashDefault}
            </div>
          </div>
          {/* Subtle pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '20px 20px',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h2 className="text-foreground font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h2>
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-4">
          {item.description}
        </p>

        {/* Meta */}
        
      </div>

      {/* Hover Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute top-3 right-3 flex items-center gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open(item.original_url, "_blank")}
          className="w-8 h-8 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border-subtle transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => deleteHandler(item.id)}
          className="w-8 h-8 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Type Badge */}
      <div className="absolute top-3 left-3">
        <div className="px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border text-xs text-muted-foreground capitalize">
          {item.type !== undefined ? item.type : 'Unknown'}
        </div>
      </div>
    </motion.article>
  );
};

export default ItemCard;
