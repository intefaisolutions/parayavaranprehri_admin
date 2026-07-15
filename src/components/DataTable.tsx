import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchPlaceholder?: string;
}

export default function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = "Search...",
}: DataTableProps<TData>) {

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});
const finalColumns = useMemo(
  () => [
    {
      id: "serial",
      header: "S.No.",
      cell: ({ row }: any) => row.index + 1
    },
    ...columns,
  ],
  [columns, pagination]
);

  const table = useReactTable({
  data,
  columns: finalColumns,
  state: {
    globalFilter,
    sorting,
    pagination,
  },
  onGlobalFilterChange: setGlobalFilter,
  onSortingChange: setSorting,
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

  return (
    <div>
  <div style={{
display:"flex",
justifyContent:"space-between",
marginBottom:"15px"
}}>
    <div className="form-group"> Show : <select value={pagination.pageSize} onChange={(e)=>{ table.setPageSize(Number(e.target.value)); }} > <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select> records </div>
  </div>
  <div className="search-bar" style={{
        width:"100%",
        marginBottom:"24px"
      }}>
    <input type="text" placeholder={searchPlaceholder} value={globalFilter} onChange={(e)=>setGlobalFilter(e.target.value)} />
  </div>
  <table className="data-table">
    <thead> {table.getHeaderGroups().map(headerGroup=>( <tr key={headerGroup.id}> {headerGroup.headers.map(header=>( <th key={header.id} onClick={ header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined } style={{
 cursor: header.column.getCanSort()
 ? "pointer"
 : "default"
}}> { flexRender( header.column.columnDef.header, header.getContext() ) } { header.column.getIsSorted()==="asc" ? " 🔼" : header.column.getIsSorted()==="desc" ? " 🔽" : "" } </th> ))} </tr> ))} </thead>
    <tbody> {table.getRowModel().rows.length ? ( table.getRowModel().rows.map(row=>( <tr key={row.id}> {row.getVisibleCells().map(cell=>( <td key={cell.id}> {flexRender( cell.column.columnDef.cell, cell.getContext() )} </td> ))} </tr> )) ) : ( <tr>
        <td colSpan={columns.length}> No records found </td>
      </tr> )} </tbody>
  </table>
  <div style={{
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginTop: "20px"
  }}>
    <button className="btn-primary" onClick={()=> table.previousPage()} disabled={!table.getCanPreviousPage()} > Prev </button> { Array.from( { length: table.getPageCount() }, (_, index) => index ) .slice(0, 5) .map(pageIndex => ( <button key={pageIndex} className={ pagination.pageIndex===pageIndex ? "btn-primary" : "icon-btn" } onClick={()=> table.setPageIndex(pageIndex)} > {pageIndex + 1} </button> )) } { table.getPageCount() > 5 && ( <>
      <span>...</span>
      <button className="icon-btn" onClick={()=> table.setPageIndex(table.getPageCount() - 1) } > {table.getPageCount()} </button>
    </> ) } <button className="btn-primary" onClick={()=> table.nextPage()} disabled={!table.getCanNextPage()} > Next </button>
  </div>undefined
</div>
  );
}