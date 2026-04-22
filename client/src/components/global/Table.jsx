import React from 'react';

const Table = ({ headers, data, renderRow, className = "table table-hover" }) => {
  return (
    <div className="table-responsive">
      <table className={className}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;