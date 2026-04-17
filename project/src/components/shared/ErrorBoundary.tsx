import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628] text-white p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-serif text-[#c9a96e]">Algo correu mal</h1>
          <p className="text-sm text-white/70">
            Ocorreu um erro inesperado. Pode tentar recarregar a página.
          </p>
          <pre className="text-xs text-left bg-black/30 p-3 rounded overflow-auto max-h-40 text-white/60">
            {this.state.error.message}
          </pre>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={this.reset}
              className="px-5 py-2 border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a1628] transition"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-[#c9a96e] text-[#0a1628] hover:bg-[#b59356] transition"
            >
              Recarregar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
