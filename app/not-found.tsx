import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-4xl font-display font-bold mb-4">404</h2>
      <p className="text-slate-400 mb-6">Page not found</p>
      <Link href="/" className="text-signal-red hover:underline">
        Return Home
      </Link>
    </div>
  );
}
