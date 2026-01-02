import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, MoveLeft, SearchX, Layers } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background text-foreground overflow-hidden p-4">
      {/* --- Ambient Background Effects --- */}
      {/* Purple Blob */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      {/* Indigo Blob */}
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* --- Main Content --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glass Card Container */}
        <div className="backdrop-blur-xl bg-zinc-900/40 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl text-center">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 shadow-inner">
              <SearchX className="h-10 w-10 text-indigo-400" />
              {/* Floating Badge */}
              <div className="absolute -top-2 -right-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 shadow-lg">
                <Layers className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Typography */}
          <h1 className="text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
            404
          </h1>
          <h2 className="text-xl font-semibold text-white mb-3">
            Lost in the Stash?
          </h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            The page you are looking for doesn't exist, or it might have been archived into a folder we can't find.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="h-11 border-zinc-700 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white rounded-full px-6 transition-all"
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            <Button
              onClick={() => navigate("/dashboard")}
              className="h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 rounded-full px-6 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </div>
        </div>
        
        {/* Footer Text */}
        <div className="mt-8 text-center">
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">
                Stash
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;