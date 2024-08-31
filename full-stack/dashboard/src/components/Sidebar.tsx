// components/Sidebar.tsx
import Link from 'next/link';
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <>
    <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0 p-5 flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-8">Navigation</h2>
      <ul className='w-full flex flex-col items-center'>
        <li className="mb-4 cursor-pointer hover:bg-gray-700 transition duration-200 ease-in-out px-14">
          <Link href="/" className="text-lg">Home</Link>
        </li>
        <li className="mb-4 cursor-pointer hover:bg-gray-700 transition duration-200 ease-in-out px-14">
          <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">Swagger</a>
        </li>
        <li className="mb-4 cursor-pointer hover:bg-gray-700 transition duration-200 ease-in-out px-14">
          <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">Documentation</a>
        </li>
      </ul>
    </div>
    </>
  );
};

export default Sidebar;
