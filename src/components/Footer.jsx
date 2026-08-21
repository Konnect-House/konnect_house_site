import {
    FaInstagram,
    FaFacebookF,
    FaLinkedinIn,
    FaWhatsapp,
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-[#0d1b2a] text-white py-4 px-6 flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0 border-t border-white/20 w-full">
            {/* Left - Langue */}

            <div className="flex items-center space-x-2">
                <span className="text-lg">🌐</span>
                <select className="bg-transparent text-white outline-none">
                    <option value="en">Français</option>
                    <option value="fr">English</option>
                </select>
            </div>

            {/* Center - Liens */}
            <div className="flex flex-wrap items-center justify-center space-x-4 text-xs">
                <a href="#" className="hover:underline">
                    Politique de confidentialité
                </a>
                <a href="#" className="hover:underline">
                    Conditions
                </a>
                <span>Copyright © 2026 Konnect House</span>
            </div>

            {/* Right - Réseaux sociaux */}
            <div className="flex items-center space-x-4">
                <a
                    href="https://wa.me/243821616193?text=Menu"
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
                    title="Chat Messenger"
                >
                    <FaFacebookF />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
