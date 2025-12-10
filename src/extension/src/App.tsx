import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Link2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

declare const chrome: any; // For Chrome extension environment

type StatusState =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const App: React.FC = () => {
  const [currentTabUrl, setCurrentTabUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [status, setStatus] = useState<StatusState>({ type: "idle" });

  // Grab current active tab URL
  useEffect(() => {
    async function fetchActiveTab() {
      try {
        if (!chrome?.tabs?.query) return;
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab && tab.url) {
          console.log(tab)
          setCurrentTabUrl(tab.url);
        }
      } catch (err) {
        // Silent fail – user can still paste manually
        console.error("Unable to fetch active tab", err);
      }
    }

    fetchActiveTab();
  }, []);

  const postUrlToStash = async (url: string, source: "quick" | "manual") => {
    if (!url) {
      setStatus({
        type: "error",
        message: "No URL found. Please provide a valid link.",
      });
      return;
    }

    // Very light validation – enough for UX
    const isProbablyUrl = /^https?:\/\/\S+$/i.test(url);
    if (!isProbablyUrl) {
      setStatus({
        type: "error",
        message: "That doesn’t look like a valid URL.",
      });
      return;
    }

    setStatus({ type: "idle" });
    if (source === "quick") setIsQuickSaving(true);
    if (source === "manual") setIsManualSaving(true);

    try {
      console.log(url)
      const res = await axios.post("http://localhost:3000/save", { url });

      if (!res.status || res.status < 200 || res.status >= 300) {
        throw new Error(`Server responded with ${res.status}`);
      }

      setStatus({
        type: "success",
        message: "Saved to your Stash.",
      });

      if (source === "manual") {
        setManualUrl("");
      }
    } catch (err) {
      console.log(err);
      setStatus({
        type: "error",
        message:
          "Couldn’t reach Stash. Is the server running on localhost:3000?",
      });
    } finally {
      setIsQuickSaving(false);
      setIsManualSaving(false);
    }
  };

  const handleQuickStash = () => {
    if (!currentTabUrl) {
      setStatus({
        type: "error",
        message: "No active tab URL found. Try using manual entry.",
      });
      return;
    }
    postUrlToStash(currentTabUrl, "quick");
  };

  const handleManualSave = () => {
    postUrlToStash(manualUrl.trim(), "manual");
  };

  const isBusy = isQuickSaving || isManualSaving;

  return (
    <div className="min-w-[360px] max-w-[420px] bg-zinc-950 text-zinc-100 font-inter p-4 pb-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
            Stash
          </h1>
          <p className="text-[11px] text-zinc-500">
            A calm inbox for things you don’t want to lose.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-800/80 bg-zinc-900/70 px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">
            Popup
          </span>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Section A: Quick Action */}
        <motion.div
          className="card relative overflow-hidden"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {/* Subtle gradient sheen */}
          <div className="pointer-events-none absolute inset-x-0 -top-12 h-20 bg-linear-to-b from-indigo-500/10 via-violet-500/5 to-transparent blur-2xl" />
          <div className="relative p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-zinc-100">
                  Quick Stash
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  Save the current tab instantly with one click.
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-2 py-1">
                <Link2 className="h-3 w-3 text-zinc-500" />
                <span className="max-w-[170px] truncate text-[10px] text-zinc-400">
                  {currentTabUrl || "Fetching active tab…"}
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleQuickStash}
              disabled={!currentTabUrl || isBusy}
              whileHover={
                !(!currentTabUrl || isBusy)
                  ? { scale: 1.01, y: -1 }
                  : undefined
              }
              whileTap={
                !(!currentTabUrl || isBusy)
                  ? { scale: 0.99, y: 0 }
                  : undefined
              }
              className={[
                "group relative flex h-9 w-full items-center justify-center overflow-hidden rounded-xl text-xs font-medium transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                !currentTabUrl || isBusy
                  ? "cursor-not-allowed bg-zinc-800/80 text-zinc-500"
                  : "bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-zinc-50 shadow-[0_18px_40px_rgba(88,28,135,0.55)] hover:shadow-[0_18px_50px_rgba(129,140,248,0.85)]",
              ].join(" ")}
            >
              {/* Gradient sheen */}
              {!(!currentTabUrl || isBusy) && (
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(244,244,245,0.26)_0,transparent_50%),radial-gradient(circle_at_100%_0%,rgba(219,234,254,0.26)_0,transparent_55%)]" />
                </span>
              )}
              <span className="relative inline-flex items-center gap-1.5">
                {isQuickSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Stashing…</span>
                  </>
                ) : status.type === "success" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Stashed</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" />
                    <span>Stash Current Tab</span>
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Section B: Manual Entry */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut", delay: 0.04 }}
        >
          <div className="p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-100">
                Manual Entry
              </p>
              <div className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                <ExternalLink className="h-3 w-3" />
                <span>Paste any link</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-zinc-800/80 bg-zinc-900/80 px-2.5 py-1.5 text-xs shadow-inner shadow-black/40 focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/50">
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Paste a URL manually..."
                  className="w-full bg-transparent text-[11px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                  spellCheck={false}
                />
              </div>

              <motion.button
                type="button"
                onClick={handleManualSave}
                disabled={!manualUrl.trim() || isBusy}
                whileHover={
                  !(!manualUrl.trim() || isBusy)
                    ? { scale: 1.03, y: -1 }
                    : undefined
                }
                whileTap={
                  !(!manualUrl.trim() || isBusy)
                    ? { scale: 0.97, y: 0 }
                    : undefined
                }
                className={[
                  "inline-flex h-8 items-center justify-center rounded-xl px-3 text-[11px] font-medium transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                  !manualUrl.trim() || isBusy
                    ? "cursor-not-allowed border border-zinc-800 bg-zinc-900 text-zinc-500"
                    : "border border-indigo-500/60 bg-zinc-900 text-indigo-100 hover:bg-indigo-500/10",
                ].join(" ")}
              >
                {isManualSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Save"
                )}
              </motion.button>
            </div>
            <p className="text-[10px] text-zinc-500">
              Stash works best with article links, tweets, docs, and GitHub
              URLs.
            </p>
          </div>
        </motion.div>

        {/* Status / Error message */}
        <AnimatePresence initial={false}>
          {status.type === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="rounded-lg border border-red-500/40 bg-red-500/5 px-2.5 py-2"
            >
              <div className="flex items-start gap-1.5">
                <AlertCircle className="mt-px h-3.5 w-3.5 text-red-400" />
                <p className="text-[11px] leading-snug text-red-200">
                  {status.message}
                </p>
              </div>
            </motion.div>
          )}

          {status.type === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-2"
            >
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-px h-3.5 w-3.5 text-emerald-300" />
                <p className="text-[11px] leading-snug text-emerald-100">
                  {status.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
