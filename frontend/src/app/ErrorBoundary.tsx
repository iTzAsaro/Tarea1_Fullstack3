import type React from 'react';
import { Component } from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">Ocurrió un error</h1>
            <p className="text-gray-600 mt-2">
              Intenta recargar la página. Si el problema persiste, revisa la consola.
            </p>
            <button
              className="mt-4 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition"
              onClick={() => window.location.reload()}
              type="button"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
