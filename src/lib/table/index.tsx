'use client'

import React, { ReactNode } from 'react'
import THead from './THead'
import TBody from './TBody'

function Table({ config, tblCls = '' }: { config: ConfigT; tblCls?: string }) {
  console.count("Table render");
  console.time("Table render time");
  const jsx = (
    <div className={`tbl ${tblCls}`} id={config.tblId}>
      <table>
        <THead config={config} />
        <TBody config={config} />
      </table>
    </div>
  );
  console.timeEnd("Table render time");
  return jsx;
}

export default React.memo(Table)

export type ConfigT = {
  tblId?: string
  state: any[]
  setState: React.Dispatch<React.SetStateAction<any[]>>
  columns: {
    key: string
    label: string
    format?: 'formatDate' | 'formatCurrency' | 'formatDateTime' | 'formatPrecent' | 'formatShortCurrency' | string
    noShow?: boolean
  }[]
  setColumns: (headers: { key: string; label: string; format?: string }[]) => void
  data: any[]
  onRowClick?: (item: any) => void
  noCheckboxs?: boolean
  moreRows?: (item: any, index: number) => ReactNode
  moreHeads?: () => ReactNode
  withIndex?: boolean
  getColumns?: (tblId?: string, columns?: { key: string; label: string; format?: string }[]) => void
  funcs?: { [key: string]: (value?: any, item?: any, col?: any) => any }
  addTrCls?: (item: any) => string
  clsBody?: string
  clsHead?: string
  skeleton?: boolean
}
