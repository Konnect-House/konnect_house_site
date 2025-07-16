import teamworkImage from '../assets/teamwork.png';
import logo from '../assets/removebg.png'; 
import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaLinkedin } from 'react-icons/fa';

function HeroSection() {
  return (
    <div
      className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen font-sans text-white bg-cover bg-center p-5 overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1470&q=80')`, // image maison
      }}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>

      {/* Header/Logo */}
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Konnect House Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl pt-24 pb-12 lg:py-0 relative z-10">
        <div className="flex-1 max-w-xl pr-0 lg:pr-10 text-center lg:text-left mb-10 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight my-4">
            Fini le casse-tête de la recherche de logements à Kinshasa
          </h1>
          {/* Premier paragraphe */}
          <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-4">
            Que ce soit pour une soirée, un court séjour ou une longue durée, Konnect House vous facilite la vie en vous aidant à trouver rapidement l’espace idéal.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4 flex-wrap gap-y-4"> 

             <a
            href="https://wa.me/243829790981?text=Salut"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-green-500 text-4xl"
            title="Chat WhatsApp"
          >
            <FaWhatsapp />
          </a>
           <a
            href="https://web.facebook.com/people/KonnectHouse/61576937339756/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 text-4xl"
            title="Chat Messenger"
          >
            <FaFacebookMessenger />
          </a>
          <a
            href="https://www.instagram.com/konnecthouse_rdc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-pink-500 text-4xl"
            title="Instagram DM"
          >
            <FaInstagram />
          </a>
          <a
                href="https://www.linkedin.com/company/konnecthouse-rdc/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-500 text-4xl"
                title="LinkedIn"
                >
            <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Image à droite */}
        <div className="flex-1 flex justify-center lg:justify-end relative w-full lg:w-auto mt-10 lg:mt-0">
          <img
            src={teamworkImage}
            alt="Des personnes se serrant la main, symbolisant la facilité et la confiance de trouver un logement avec Konnect House à Kinshasa" // Alt text mis à jour
            className="max-w-full h-auto rounded-lg shadow-2xl
                       transform origin-bottom-left skew-x-[-8deg]
                       lg:ml-[-100px] xl:ml-[-150px]
                       w-[600px] md:w-[700px] lg:w-[800px] xl:w-[900px]
                       object-cover"
            style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;