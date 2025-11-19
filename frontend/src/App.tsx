import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client for React Query
const queryClient = new QueryClient();

// Example pages
function HomePage() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold text-foreground">AI Paper Partner</h1>
        <p className="mb-4 text-muted-foreground">Frontend is successfully configured with:</p>
        <ul className="mb-6 list-inside list-disc space-y-2 text-foreground">
          <li>React + TypeScript</li>
          <li>Vite</li>
          <li>Tailwind CSS</li>
          <li>React Router</li>
          <li>React Query</li>
        </ul>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            API Base URL: <code className="rounded bg-muted px-2 py-1">{apiBaseUrl}</code>
          </p>
        </div>
        <nav className="mt-6">
          <Link
            to="/about"
            className="inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Go to About
          </Link>
        </nav>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold text-foreground">About</h1>
        <p className="mb-4 text-muted-foreground">
          This is a demo page to show React Router is working.
        </p>
        <nav>
          <Link
            to="/"
            className="inline-block rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:opacity-90"
          >
            Back to Home
          </Link>
        </nav>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
