import React from 'react';

export default function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-6 bg-gray-900">
      <h1 className="text-white text-xl font-bold">Miranda</h1>
      <nav className="space-x-6 text-sm hidden md:flex">
        <a href="#" className="hover:text-pink-500">WHAT I DO</a>
        <a href="#" className="hover:text-pink-500">PORTFOLIO</a>
        <a href="#" className="hover:text-pink-500">SKILLS</a>
        <a href="#" className="hover:text-pink-500">TESTIMONIAL</a>
        <a href="#" className="hover:text-pink-500">BLOG</a>
      </nav>
      <button className="bg-pink-600 px-4 py-2 text-sm rounded">Hire me</button>
    </header>
  );
}
