// pages/index.tsx
import React from 'react';
import Layout from '../components/Layout';
import Table from '../components/ChildTable';
import ParentTable from '../components/ParentTable';

const Home: React.FC = () => {
  return (
    <div className=''>
      <Layout>
        <h1 className="text-4xl font-bold mb-4">Home Page</h1>
        <p className="text-lg">Welcome to the home page!</p>
        <div className="container mx-auto p-4">
          
          <ParentTable />
        </div>
      </Layout>
      
    </div>
  );
};

export default Home;
