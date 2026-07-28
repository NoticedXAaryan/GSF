'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-3xl font-serif text-white mb-3">Something went wrong</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center space-x-2 bg-white text-black px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-white/10 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
