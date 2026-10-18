import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AdminAuthProvider } from './context/AdminAuthContext';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0EB] p-8 text-center">
          <div className="max-w-md">
            <div className="text-[#D32F2F] text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[#0D0D0D] mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6 text-sm">{this.state.error?.message}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-6 py-3 bg-[#D32F2F] text-white rounded-full font-semibold hover:bg-[#9A0007] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <RouterProvider router={router} />
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}