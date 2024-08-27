import React from 'react';

interface ChildTableProps {
  childData: {
    apiName: string;
    lastSecurityScanDate: string;
    vulnerabilitiesDetected: string;
    mitigationStatus: string;
  }[];
}

const ChildTable: React.FC<ChildTableProps> = ({ childData }) => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-600">
      <table className="border-collapse w-full text-sm bg-gray-800 text-white rounded-lg table-fixed">
  <thead>
    <tr className="bg-gray-900">
      <th className="border p-2 border-gray-600 w-1/4">API Name</th>
      <th className="border p-2 border-gray-600 w-1/4">Last Security Scan Date</th>
      <th className="border p-2 border-gray-600 w-1/4">Vulnerabilities Detected</th>
      <th className="border p-2 border-gray-600 w-1/4">Mitigation Status</th>
    </tr>
  </thead>
  <tbody>
    {childData.map((row, index) => (
      <tr
        key={index}
        className="hover:bg-gray-700 transition duration-200 ease-in-out"
      >
        <td className="border p-4 border-gray-600 w-1/4">{row.apiName}</td>
        <td className="border p-4 border-gray-600 w-1/4">{row.lastSecurityScanDate}</td>
        <td className="border p-4 border-gray-600 w-1/4">{row.vulnerabilitiesDetected}</td>
        <td className="border p-4 border-gray-600 w-1/4">{row.mitigationStatus}</td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
};

export default ChildTable;
