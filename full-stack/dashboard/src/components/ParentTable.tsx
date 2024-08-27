import React, { useState } from 'react';
import TableRow from './tableRow';
import ChildTable from './ChildTable';

interface ParentTableProps {}

const ParentTable: React.FC<ParentTableProps> = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const data: string[][] = [
    ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3', 'Row 1, Col 4', 'Row 1, Col 5'],
    ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3', 'Row 2, Col 4', 'Row 2, Col 5'],
    // Add more rows as needed
  ];

  const childData = [
    {
      apiName: 'API 1',
      lastSecurityScanDate: '2024-08-28',
      vulnerabilitiesDetected: '2',
      mitigationStatus: 'Mitigated',
    },
    {
      apiName: 'API 2',
      lastSecurityScanDate: '2024-08-25',
      vulnerabilitiesDetected: '5',
      mitigationStatus: 'In Progress',
    },
    // Add more child rows as needed
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
            <th className="border p-2 text-gray-300 border-gray-600 w-32">Column 1</th>
            <th className="border p-2 text-gray-300 border-gray-600">Column 2</th>
            <th className="border p-2 text-gray-300 border-gray-600">Column 3</th>
            <th className="border p-2 text-gray-300 border-gray-600">Column 4</th>
            <th className="border p-2 text-gray-300 border-gray-600">Column 5</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <React.Fragment key={index}>
              <TableRow data={row} onClick={() => handleRowClick(index)} />
              {selectedRow === index && (
                <tr className="relative">
                  {/* Empty space under the first column */}
                  <td className="p-0" />

                  {/* Child table spanning columns 2 to 5 */}
                  <td colSpan={4} className="p-0">
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out transform ${
                        selectedRow === index ? 'max-h-screen scale-100' : 'max-h-0 scale-95'
                      }`}
                    >
                      <ChildTable childData={childData} />
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
