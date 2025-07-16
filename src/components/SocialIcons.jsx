import React from 'react';
import { FaLinkedin, FaBehance, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function SocialIcons() {
  return (
    <div className="flex space-x-4 mb-4">
      <FaLinkedin className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
      <FaBehance className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
      <FaTwitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
      <FaInstagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
    </div>
  );
}
