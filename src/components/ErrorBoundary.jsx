import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#F6F9FF] text-[#172033]">
          <h1 className="text-xl font-extrabold text-[#011A66]">
            Une erreur est survenue
          </h1>
          <p className="text-sm text-[#172033]/80 max-w-md">
            Impossible d’afficher cette page. Rechargez ou revenez à l’accueil.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="px-5 py-2.5 rounded-full font-bold text-white"
              style={{
                background: "linear-gradient(90deg, #011A66, #3478AB)",
              }}
              onClick={() => window.location.reload()}
            >
              Recharger
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-full font-bold border-2 border-[#3478AB] text-[#011A66]"
            >
              Accueil
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
