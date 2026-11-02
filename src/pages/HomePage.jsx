import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProblemSolution from "../components/ProblemSolution";
import HowItWorks from "../components/HowItWorks";
import ListingTypes from "../components/ListingTypes";
import Partners from "../components/Partners";
import Testimonials from "../components/Testimonials";
import SeoFaq from "../components/SeoFaq";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import OnboardingModal from "../components/OnboardingModal";

export default function HomePage() {
  return (
    <div className="bg-[var(--kh-bg)] text-[var(--kh-text)] overflow-x-hidden transition-colors duration-300">
      <OnboardingModal />
      <Navbar />
      <main className="snap-container">
        <section className="snap-section" aria-label="Accueil Konnect House">
          <Hero />
        </section>
        <section className="snap-section" aria-label="Problème et solution">
          <ProblemSolution />
        </section>
        <section className="snap-section" aria-label="Comment ça marche">
          <HowItWorks />
        </section>
        <section className="snap-section" aria-label="Types de logements">
          <ListingTypes />
        </section>
        <section className="snap-section" aria-label="Partenaires propriétaires">
          <Partners />
        </section>
        <section className="snap-section" aria-label="Témoignages">
          <Testimonials />
        </section>
        <section className="snap-section" aria-label="Questions fréquentes">
          <SeoFaq />
        </section>
        <section className="snap-section" aria-label="Commencer">
          <FinalCTA />
        </section>
      </main>
      <Footer />
    </div>
  );
}
