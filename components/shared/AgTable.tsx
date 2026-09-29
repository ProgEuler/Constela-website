"use client"

import {
  type ReactNode,
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react"
import { useTheme } from "next-themes"
import { AgGridProvider, AgGridReact } from "ag-grid-react"
import {
  AllCommunityModule,
  type CellClickedEvent,
  type ColDef,
  type GridOptions,
  type GridReadyEvent,
  type SelectionChangedEvent,
  type RowClickedEvent,
  type GridApi,
  type Theme,
} from "ag-grid-community"
import type { DateRange } from "react-day-picker"
import { createShadcnAgGridTheme } from "@/lib/ag-grid-shadcn-theme"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  renderTableUserCell,
  renderTableUserCellWithEmail,
} from "./table-user-cell"

const modules = [AllCommunityModule]

type AgTableProps<TData extends object> = {
  title?: ReactNode
  rowData?: TData[] | null
  columnDefs: ColDef<TData>[]
  showRowNumberColumn?: boolean
  defaultColDef?: ColDef<TData>
  components?: GridOptions<TData>["components"]
  height?: number | string
  minHeight?: number | string
  pagination?: boolean
  pageSize?: number
  rowSelection?: GridOptions<TData>["rowSelection"]
  onSelectionChanged?: (selectedRows: TData[]) => void
  onRowClicked?: (row: TData) => void
  suppressCellClickAction?: boolean
  onCellValueChanged?: GridOptions<TData>["onCellValueChanged"]
  onGridReady?: (api: GridApi<TData>) => void
  gridOptions?: Omit<GridOptions<TData>, "rowData" | "columnDefs">
  loading?: boolean
  noRowsText?: ReactNode
  theme?: Theme
  className?: string
  context?: GridOptions<TData>["context"]
}

export function AgTable<TData extends object>({
  title,
  rowData,
  columnDefs,
  showRowNumberColumn = true,
  defaultColDef,
  components,
  height = "70vh",
  minHeight = 520,
  pagination = false,
  pageSize = 20,
  rowSelection,
  onSelectionChanged,
  onRowClicked,
  suppressCellClickAction = false,
  onCellValueChanged,
  onGridReady,
  gridOptions,
  loading = false,
  noRowsText = "No records found",
  theme,
  className,
  context,
}: AgTableProps<TData>) {
  const gridApiRef = useRef<GridApi<TData> | null>(null)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [dateField, setDateField] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme: colorScheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const gridTheme = useMemo(() => {
    if (theme) return theme
    if (!mounted) return createShadcnAgGridTheme()
    return createShadcnAgGridTheme()
  }, [theme, mounted, colorScheme])

  const gridComponents = useMemo<GridOptions<TData>["components"]>(
    () => ({
      tableUserCell: renderTableUserCell,
      tableUserCellWithEmail: renderTableUserCellWithEmail,
      ...components,
    }),
    [components]
  )

  const hasExplicitNoColumn = useMemo(() => {
    const isNoHeader = (value: unknown) => {
      const text = typeof value === "string" ? value.trim().toLowerCase() : ""
      return text === "no" || text === "no." || text === "#"
    }

    return columnDefs.some((column) => {
      const field = typeof column.field === "string" ? column.field : ""
      const colId = typeof column.colId === "string" ? column.colId : ""
      const normalizedField = field.trim().toLowerCase()
      const normalizedColId = colId.trim().toLowerCase()

      return (
        normalizedField === "no" ||
        normalizedColId === "no" ||
        isNoHeader(column.headerName)
      )
    })
  }, [columnDefs])

  const rowNumberColumnDef = useMemo<ColDef<TData>>(
    () => ({
      headerName: "No.",
      colId: "__rowNumber",
      flex: 0,
      minWidth: 60,
      width: 60,
      maxWidth: 70,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      cellClass: "text-center",
      headerClass: "text-center",
      valueGetter: (params) => {
        const rowIndex = params.node?.rowIndex
        if (rowIndex === null || rowIndex === undefined) return ""
        return rowIndex + 1
      },
    }),
    []
  )

  const resolvedColumnDefs = useMemo(() => {
    if (!showRowNumberColumn || hasExplicitNoColumn) return columnDefs
    return [rowNumberColumnDef, ...columnDefs]
  }, [columnDefs, hasExplicitNoColumn, rowNumberColumnDef, showRowNumberColumn])

  const mergedDefaultColDef = useMemo<ColDef<TData>>(
    () => ({
      flex: 1,
      minWidth: 150,
      cellClass: "text-left",
      headerClass: "text-left",
      resizable: true,
      filter: false,
      sortable: true,
      wrapHeaderText: true,
      autoHeaderHeight: true,
      ...defaultColDef,
    }),
    [defaultColDef]
  )

  const exportableColumns = useMemo(
    () => columnDefs.filter((column) => Boolean(column.field) && !column.hide),
    [columnDefs]
  )

  const dateColumns = useMemo(
    () =>
      exportableColumns
        .map((column) => column.field)
        .filter(Boolean)
        .map((field) => String(field))
        .filter((field) => /date/i.test(field)),
    [exportableColumns]
  )

  const csvEscape = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value)
    return `"${text.replaceAll('"', '""')}"`
  }

  const buildCsv = (rows: TData[]) => {
    const headers = exportableColumns.map((column) =>
      csvEscape(column.headerName || String(column.field || ""))
    )

    const body = rows.map((row) =>
      exportableColumns
        .map((column) => {
          const field = column.field
          if (!field) return csvEscape("")
          return csvEscape((row as Record<string, unknown>)[String(field)])
        })
        .join(",")
    )

    return [headers.join(","), ...body].join("\n")
  }

  const downloadCsv = (rows: TData[]) => {
    const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    const timestamp = new Date().toISOString().slice(0, 10)

    anchor.href = url
    anchor.download = `table-export-${timestamp}.csv`
    anchor.click()

    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    const rows = rowData ?? []
    let exportRows: TData[] = []

    if (!dateField) {
      setExportMessage("Choose a date field.")
      return
    }

    if (!dateRange?.from || !dateRange?.to) {
      setExportMessage("Choose a date range.")
      return
    }

    const startDate = new Date(dateRange.from)
    const endDate = new Date(dateRange.to)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setExportMessage("Choose a valid date range.")
      return
    }

    const startTime = startDate.getTime()
    const endTime = endDate.getTime()
    const fieldName = dateField as string

    exportRows = rows.filter((row) => {
      const rawValue = (row as Record<string, unknown>)[fieldName]
      if (!rawValue) return false
      const valueDate = new Date(String(rawValue))
      const valueTime = valueDate.getTime()
      return (
        !Number.isNaN(valueTime) &&
        valueTime >= startTime &&
        valueTime <= endTime
      )
    })

    if (!exportRows.length) {
      setExportMessage("No rows matched the selected filter.")
      return
    }

    downloadCsv(exportRows)
    setExportMessage(
      `Exported ${exportRows.length} row${exportRows.length === 1 ? "" : "s"}.`
    )
    setIsExportDialogOpen(false)
  }

  const handleGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      gridApiRef.current = event.api
      if (loading) event.api.showLoadingOverlay()
      onGridReady?.(event.api)
    },
    [loading, onGridReady]
  )

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<TData>) => {
      if (!onSelectionChanged) return
      const selected = event.api.getSelectedRows()
      onSelectionChanged(selected)
    },
    [onSelectionChanged]
  )

  const handleRowClicked = useCallback(
    (event: RowClickedEvent<TData>) => {
      if (event.data) onRowClicked?.(event.data)
    },
    [onRowClicked]
  )

  const handleCellClicked = useCallback(
    (event: CellClickedEvent<TData>) => {
      if (suppressCellClickAction) return

      const target = event.event?.target
      if (target instanceof HTMLElement) {
        const interactiveElement = target.closest(
          "button, input, select, textarea, a, label, [role='switch'], [data-cell-click-ignore]"
        )

        if (interactiveElement) return
      }

      if (dateColumns.length > 0) {
        setDateField(String(dateColumns[0]))
      }

      setExportMessage(null)
      setDateRange(undefined)
      setIsExportDialogOpen(true)
    },
    [dateColumns, suppressCellClickAction]
  )

  const isAutoHeight = height === "auto"
  const containerStyle = isAutoHeight
    ? { width: "100%" }
    : {
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      }

  return (
    <AgGridProvider modules={modules}>
      <div>
      {title ? (
        <h2 className="mb-3 text-base font-medium text-foreground">{title}</h2>
      ) : null}
      <div
        className={cn("ag-table-shadcn relative w-full", className)}
        style={containerStyle}
      >
        <AgGridReact<TData>
          rowData={rowData}
          columnDefs={resolvedColumnDefs}
          defaultColDef={mergedDefaultColDef}
          theme={gridTheme}
          domLayout={isAutoHeight ? "autoHeight" : "normal"}
          components={gridComponents}
          context={context}
          rowSelection={rowSelection}
          onSelectionChanged={handleSelectionChanged}
          onGridReady={handleGridReady}
          onRowClicked={handleRowClicked}
          onCellClicked={handleCellClicked}
          onCellValueChanged={onCellValueChanged}
          pagination={pagination}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          animateRows
          suppressMovableColumns={false}
          enableCellTextSelection
          noRowsOverlayComponent={() => (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              {noRowsText}
            </div>
          )}
          {...gridOptions}
        />
        {loading ? (
          <div
            className="absolute inset-x-px bottom-px top-[49px] z-20 overflow-hidden rounded-b-[inherit] bg-background p-4"
            role="status"
            aria-label="Loading table data"
          >
            <div className="space-y-4">
              {Array.from({ length: 8 }, (_, row) => (
                <div key={row} className="grid grid-cols-[4rem_1.3fr_1.6fr_1fr_1fr] gap-6">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      </div>
    </AgGridProvider>
  )
}
