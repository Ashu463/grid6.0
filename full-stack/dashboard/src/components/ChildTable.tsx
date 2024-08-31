import React from 'react';

interface ChildTableProps {
  childData: {
    requestType: string;
    apiName: string;
    lastSecurityScanDate: string;
    vulnerabilitiesDetected: string;
    mitigationStatus: string;
  }[];
}

const ChildTable: React.FC<ChildTableProps> = ({ childData }) => {
  // Function to determine the row color based on mitigation status
  const getRowColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'mitigated':
        return 'bg-green-400'; // Green for mitigated
      case 'in progress':
        return 'bg-yellow-300'; // Yellow for in progress
      case 'pending':
        return 'bg-red-400'; // Red for not mitigated
      default:
        return 'bg-gray-700'; // Default background color
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-600">
      <table className="border-collapse w-full text-sm bg-gray-800 rounded-lg table-fixed">
        <thead>
          <tr className="bg-gray-900">
            <th className="border p-2 border-gray-600 w-1/5">Request Type</th>
            <th className="border p-2 border-gray-600 w-1/5">End Point</th>
            <th className="border p-2 border-gray-600 w-1/5">Last Security Scan Date</th>
            <th className="border p-2 border-gray-600 w-1/5">Vulnerabilities Detected</th>
            <th className="border p-2 border-gray-600 w-1/5">Mitigation Status</th>
          </tr>
        </thead>
        <tbody>
          {childData.map((row, index) => (
            <tr
              key={index}
              className={`${getRowColor(row.mitigationStatus)} hover:bg-opacity-75 transition duration-200 ease-in-out font-semibold text-black`}
            >
              <td className="border p-4 border-gray-600">{row.requestType}</td>
              <td className="border p-4 border-gray-600">{row.apiName}</td>
              <td className="border p-4 border-gray-600">{row.lastSecurityScanDate}</td>
              <td className="border p-4 border-gray-600">{row.vulnerabilitiesDetected}</td>
              <td className="border p-4 border-gray-600">{row.mitigationStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChildTable;
