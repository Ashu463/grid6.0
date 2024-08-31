import React, { useState } from 'react';
import TableRow from './TableRow';
import ChildTable from './ChildTable';

interface ParentTableProps {}

const ParentTable: React.FC<ParentTableProps> = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const data: string[][] = [
    ['Cart Management'],
    ['Order Management'],
    ['Product Management'],
    ['Shipping Management'],
    ['User Management'],
    ['Payment Processing'],
  ];

  const childData = [
  // Child data for "Cart Management"
  [
    {
      requestType:'POST',
      apiName: '/cart',
      lastSecurityScanDate: '2024-08-28',
      vulnerabilitiesDetected: '2',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'GET',
      apiName: '/cart',
      lastSecurityScanDate: '2024-08-25',
      vulnerabilitiesDetected: '5',
      mitigationStatus: 'Pending',
    },
    {
      requestType:'POST',
      apiName: '/cart/items',
      lastSecurityScanDate: '2024-08-25',
      vulnerabilitiesDetected: '5',
      mitigationStatus: 'In Progress',
    },
    {
      requestType:'PUT',
      apiName: '/cart/items/:itemId',
      lastSecurityScanDate: '2024-08-28',
      vulnerabilitiesDetected: '2',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'DELETE',
      apiName: '/cart/items/:itemId',
      lastSecurityScanDate: '2024-08-25',
      vulnerabilitiesDetected: '5',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'DELETE',
      apiName: '/cart',
      lastSecurityScanDate: '2024-08-25',
      vulnerabilitiesDetected: '5',
      mitigationStatus: 'In Progress',
    },
  ],
  // Child data for "Order Management"
  [
    {
      requestType:'POST',
      apiName: '/orders',
      lastSecurityScanDate: '2024-08-20',
      vulnerabilitiesDetected: '0',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'GET',
      apiName: '/orders/:orderId',
      lastSecurityScanDate: '2024-08-18',
      vulnerabilitiesDetected: '3',
      mitigationStatus: 'In Progress',
    },
    {
      requestType:'GET',
      apiName: '/orders/user/:userId',
      lastSecurityScanDate: '2024-08-18',
      vulnerabilitiesDetected: '3',
      mitigationStatus: 'In Progress',
    },
    {
      requestType:'PUT',
      apiName: '/orders/:orderId',
      lastSecurityScanDate: '2024-08-20',
      vulnerabilitiesDetected: '6',
      mitigationStatus: 'Pending',
    },
    {
      requestType:'DELETE',
      apiName: '/orders/:orderId',
      lastSecurityScanDate: '2024-08-20',
      vulnerabilitiesDetected: '0',
      mitigationStatus: 'Mitigated',
    },
  ],
  // Child data for "Product Management"
  [
    {
      requestType:'POST',
      apiName: '/products',
      lastSecurityScanDate: '2024-08-22',
      vulnerabilitiesDetected: '1',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'GET',
      apiName: 'products',
      lastSecurityScanDate: '2024-08-21',
      vulnerabilitiesDetected: '4',
      mitigationStatus: 'Pending',
    },
    {
      requestType:'GET',
      apiName: 'products/:id',
      lastSecurityScanDate: '2024-08-21',
      vulnerabilitiesDetected: '4',
      mitigationStatus: 'In Progress',
    },
    {
      requestType:'PUT',
      apiName: '/products/:id',
      lastSecurityScanDate: '2024-08-22',
      vulnerabilitiesDetected: '1',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'DELETE',
      apiName: '/products/:id',
      lastSecurityScanDate: '2024-08-22',
      vulnerabilitiesDetected: '9',
      mitigationStatus: 'Pending',
    },
  ],
  // Child data for "Shipping Management"
  [
    {
      requestType:'GET',
      apiName: '/shipping/methods',
      lastSecurityScanDate: '2024-08-15',
      vulnerabilitiesDetected: '0',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'POST',
      apiName: '/shipping/estimate',
      lastSecurityScanDate: '2024-08-13',
      vulnerabilitiesDetected: '2',
      mitigationStatus: 'In Progress',
    },
  ],
  // Child data for "User Management"
  [
    {
      requestType:'POST',
      apiName: '/auth/register',
      lastSecurityScanDate: '2024-08-19',
      vulnerabilitiesDetected: '3',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'POST',
      apiName: '/auth/login',
      lastSecurityScanDate: '2024-08-17',
      vulnerabilitiesDetected: '1',
      mitigationStatus: 'Pending',
    },
    {
      requestType:'POST',
      apiName: '/auth/logout',
      lastSecurityScanDate: '2024-08-17',
      vulnerabilitiesDetected: '2',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'GET',
      apiName: '/auth/users/:userId',
      lastSecurityScanDate: '2024-08-17',
      vulnerabilitiesDetected: '1',
      mitigationStatus: 'Pending',
    },
    {
      requestType:'PUT',
      apiName: '/auth/users/:userId',
      lastSecurityScanDate: '2024-08-17',
      vulnerabilitiesDetected: '0',
      mitigationStatus: 'In Progress',
    },
    {
      requestType:'DELETE',
      apiName: '/auth/users/:userId',
      lastSecurityScanDate: '2024-08-17',
      vulnerabilitiesDetected: '1',
      mitigationStatus: 'Mitigated',
    },
  ],
  // Child data for "Payment Processing"
  [
    {
      requestType:'POST',
      apiName: '/payments',
      lastSecurityScanDate: '2024-08-16',
      vulnerabilitiesDetected: '6',
      mitigationStatus: 'In Progress',
    },
    {
      requestType:'GET',
      apiName: '/payments/:paymentId',
      lastSecurityScanDate: '2024-08-14',
      vulnerabilitiesDetected: '2',
      mitigationStatus: 'Mitigated',
    },
    {
      requestType:'POST',
      apiName: '/payments/refund',
      lastSecurityScanDate: '2024-08-14',
      vulnerabilitiesDetected: '2',
      mitigationStatus: 'Mitigated',
    },
  ],
];


  const handleRowClick = (index: number) => {
    setSelectedRow((prevSelectedRow) =>
      prevSelectedRow === index ? null : index
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <table className="border-collapse border border-gray-600 w-full text-sm">
        <thead>
          <tr className="bg-gray-900">
            <th className="border p-2 text-gray-300 border-gray-600 w-32">Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <React.Fragment key={index}>
              <TableRow data={row} onClick={() => handleRowClick(index)} />
              {selectedRow === index && (
                <tr className="relative">
                  <td colSpan={1} className="p-0">
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out transform ${
                        selectedRow === index ? 'max-h-screen scale-100' : 'max-h-0 scale-95'
                      }`}
                    >
                      <ChildTable childData={childData[index] || []} />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParentTable;
