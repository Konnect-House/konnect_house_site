import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProblemSolution from "./components/ProblemSolution";
import HowItWorks from "./components/HowItWorks";
import ListingTypes from "./components/ListingTypes";
import Partners from "./components/Partners";
import Testimonials from "./components/Testimonials";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import OnboardingModal from "./components/OnboardingModal";

function App() {
  return (
    <div className="bg-[var(--kh-bg)] text-[var(--kh-text)] overflow-x-hidden transition-colors duration-300">
      <OnboardingModal />
      <Navbar />
      <main className="snap-container">
        <section className="snap-section">
          <Hero />
        </section>
        <section className="snap-section">
          <ProblemSolution />
        </section>
        <section className="snap-section">
          <HowItWorks />
        </section>
        <section className="snap-section">
          <ListingTypes />
        </section>
        <section className="snap-section">
          <Partners />
        </section>
        <section className="snap-section">
          <Testimonials />
        </section>
        <section className="snap-section">
          <FinalCTA />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
