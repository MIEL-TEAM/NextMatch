import React from 'react'
import Icon from './Icon'
import { ConfigT } from '.'
import { formatFuncs, getNestedValue } from './funcs'
import Image from 'next/image'

function TBody({ config }: { config: ConfigT }) {
  console.count("TBody render");

  if (config.skeleton) return <Skeleton config={config} />

  const { columns, noCheckboxs, state, moreRows, withIndex } = config
  const funcs = { ...formatFuncs, ...config.funcs }

  function getCell(item: any, col: ConfigT['columns'][number]) {
    const value = getNestedValue(item, col.key)
    if (col.format == 'img') return <Image src={value} alt='' className='size-10 rounded' />
    if (col.format) return funcs[col.format](value, item, col)
    if (typeof value == 'boolean') return value ? <Icon name='check' /> : <Icon name='xmark' className='size-4' />

    return value
  }

  return (
    <tbody className={config.clsBody || ''}>
      {state.map((item, index) => {
        console.log("render row", item.id);
        return (<tr
          key={item.id ?? index}
          onClick={() => config.onRowClick?.(item)}
          className={`${config.onRowClick && 'cursor-pointer'} ${config.addTrCls && config.addTrCls(item)}`}
        >
          {!noCheckboxs && (
            <td>
              <input type='checkbox' name='checkRow' id={item.id} />
            </td>
          )}
          {withIndex && <td>{index + 1 + '#'}</td>}
          {columns.map((col, i) => {
            if (col.noShow) return null
            const cellContent = getCell(item, col)
            return (
              <td
                key={col.key + i}
                className='truncate max-w-64'
                title={typeof cellContent === 'string' ? cellContent : ''}
              >
                {cellContent}
              </td>
            )
          })}

          {moreRows && moreRows(item, index)}
        </tr>);
      })}
    </tbody>
  )
}

export default React.memo(TBody)

function Skeleton({ config }: { config: ConfigT }) {
  const { columns, noCheckboxs, withIndex } = config
  return (
    <tbody>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
        <tr key={index}>
          {!noCheckboxs && (
            <td>
              <input type='checkbox' />
            </td>
          )}
          {withIndex && <td>{index + 1 + '#'}</td>}
          {columns.map((col, i) => {
            if (col.noShow) return null
            return (
              <td key={col.key + i} className='truncate max-w-64 text-gray-500'>
                - - - - - - - -
              </td>
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}

// function Skeleton({ columns }) {
//   return (
//     <tbody>
//       {columns.map((col, i) => {
//         if (col.noShow) return null
//         return (
//           <td key={col.key + i} className='truncate max-w-64'>
//             - - - - - - - -
//           </td>
//         )
//       })}
//     </tbody>
//   )
// }
