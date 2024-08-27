import React from 'react';

interface TableRowProps {
  data: string[];
  onClick: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ data, onClick }) => {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer hover:bg-gray-700 transition duration-200 ease-in-out"
    >
      {data.map((item, index) => (
        <td key={index} className="border p-4 text-white border-gray-600">
          {item}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
