// components/Sidebar.tsx
import Link from 'next/link';
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <>
    <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0 p-5">
      <h2 className="text-2xl font-semibold mb-8">Navigation</h2>
      <ul>
        <li className="mb-4">
          <Link href="/" className="text-lg hover:underline">Home</Link>
        </li>
        <li className="mb-4">
          <Link href="/about" className="text-lg hover:underline">About</Link>
        </li>
        <li className="mb-4">
          <Link href="/services" className="text-lg hover:underline">Services</Link>
        </li>
        <li className="mb-4">
          <Link href="/contact" className="text-lg hover:underline">Contact</Link>
        </li>
      </ul>
    </div>
    </>
  );
};

export default Sidebar;
