import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-serif text-white/10 mb-6">404</div>

        <h1 className="text-3xl font-serif text-white mb-3">Page not found</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-white text-black px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to home</span>
        </Link>
      </div>
    </div>
  );
}
