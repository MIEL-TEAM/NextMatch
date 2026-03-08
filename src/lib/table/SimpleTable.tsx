import React from 'react'

type SimpleCol = { key: string; label: string; className?: string; render?: (row: any) => React.ReactNode }

export default function SimpleTable({ columns, data, className = '' }: { columns: SimpleCol[]; data: any[]; className?: string }) {
  return (
    <div className={`tbl ${className}`}>
      <table>
        <thead className='tblHead'>
          <tr>
            {columns.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className='tblBody'>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.label} className={col.className || ''}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
