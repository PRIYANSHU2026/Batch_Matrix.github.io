import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4">404 - Page Not Found</h1>
      <p className="mb-8 text-muted-foreground max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
