import {
    FaWhatsapp,
    FaInstagram,
    FaLinkedinIn,
    FaFacebookF,
} from "react-icons/fa";
import logo from "../assets/removebg.png";

const HeroSection = () => {
    return (
        <div className="relative min-h-screen w-full">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1470&q=80')`,
                }}
            />

            {/* Overlay sombre */}
            <div className="absolute inset-0 bg-black/60 z-0" />

            {/* Contenu principal */}
            <div className="relative z-10 flex flex-col justify-between min-h-screen">
                {/* Header */}
                <header className="w-full flex items-center justify-between px-6 lg:px-16 py-4">
                    <div className="flex items-center space-x-2">
                        <img
                            src={logo}
                            alt="Konnect House Logo"
                            className="h-14 w-auto object-contain"
                        />
                    </div>
                </header>

                {/* Section Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center w-full flex-1">
                    {/* Texte à gauche */}
                    <div className="px-6 lg:px-16 space-y-6 py-8">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
                            Fini le casse-tête de la recherche de logements à
                            Kinshasa
                            {/* <span className="text-purple-400">is real</span> */}
                        </h2>

                        <p className="text-white/90 text-base leading-relaxed">
                            Que ce soit pour une soirée, un court séjour ou une
                            longue durée, Konnect House vous facilite la vie en
                            vous aidant à trouver rapidement l’espace idéal.
                        </p>

                        <div className="flex items-center gap-4">
                            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-purple-700 transition">
                                Démarrer le chat
                            </button>
                        </div>
                    </div>

                    {/* Image stylisée à droite */}
                    <div className="relative w-full h-full hidden lg:block pb-8">
                        <div className="clip-polygon overflow-hidden h-full">
                            <img
                                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
                                alt="Beautiful house"
                                className="object-cover w-full h-full"
                                style={{
                                    clipPath:
                                        "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-black/30 text-white py-4 px-6 flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0 border-t border-white/20 w-full">
                    {/* Langue */}
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">🌐</span>
                        <select className="bg-transparent text-white outline-none">
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    {/* Liens */}
                    <div className="flex flex-wrap items-center justify-center space-x-4 text-xs">
                        <a href="#" className="hover:underline">
                            Politique de confidentialité
                        </a>
                        <a href="#" className="hover:underline">
                            Conditions
                        </a>
                        <span>© 2025 Konnect House</span>
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="flex items-center space-x-4">
                        <a
                            href="https://wa.me/243829790981?text=Salut"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-white rounded-full hover:bg-white hover:text-[#0d1b2a] transition"
                            title="Chat WhatsApp"
                        >
                            <FaWhatsapp />
                        </a>
                        <a
                            href="https://www.instagram.com/konnecthouse_rdc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-white rounded-full hover:bg-white hover:text-[#0d1b2a] transition"
                            title="Instagram"
                        >
                            <FaInstagram />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/konnecthouse-rdc/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-white rounded-full hover:bg-white hover:text-[#0d1b2a] transition"
                            title="LinkedIn"
                        >
                            <FaLinkedinIn />
                        </a>
                        <a
                            href="https://web.facebook.com/people/KonnectHouse/61576937339756/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-white rounded-full hover:bg-white hover:text-[#0d1b2a] transition"
                            title="Facebook"
                        >
                            <FaFacebookF />
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default HeroSection;
