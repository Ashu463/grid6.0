// pages/about.tsx
import React from 'react';
import Layout from '../components/Layout';

const About: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-4xl font-bold mb-4">About Page</h1>
      <p className="text-lg">This is the about page.</p>
    </Layout>
  );
};

export default About;
