// import React from 'react';
// import Navbar from './components/Navbar';
// import Hero from './components/Hero';

// function App() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <Hero />
//     </div>
//   );
// }

// export default App;
import Header from './components/Header';
import HeroSection from './components/HeroSection';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* <Header /> */}
      <HeroSection />
    </div>
  );
}
