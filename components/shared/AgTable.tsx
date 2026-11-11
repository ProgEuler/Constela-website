"use client"

import {
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react"
import { useTheme } from "next-themes"
import { AgGridProvider, AgGridReact } from "ag-grid-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  renderTableUserCell,
  renderTableUserCellWithEmail,
} from "./table-user-cell"

const modules = [AllCommunityModule]

function getFieldValue(row: unknown, field?: string | string[]): unknown {
  if (!field) return undefined
  const path = Array.isArray(field) ? field : String(field).split(".")
  return path.reduce<unknown>((value, key) => {
    if (value === null || value === undefined || typeof value !== "object") {
      return undefined
    }
    return (value as Record<string, unknown>)[key]
  }, row)
}

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
  pagination = true,
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
  const mobileListRef = useRef<HTMLDivElement | null>(null)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [dateField, setDateField] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme: colorScheme } = useTheme()
  const isMobile = useIsMobile()
  const safeRowData = useMemo(
    () => (Array.isArray(rowData) ? rowData : []),
    [rowData]
  )
  const [mobilePage, setMobilePage] = useState(1)
  const [mobilePageSize, setMobilePageSize] = useState(pageSize)
  const [mobileRowsRef, setMobileRowsRef] = useState(rowData)

  // Reset the card list back to the first page whenever the data changes.
  if (rowData !== mobileRowsRef) {
    setMobileRowsRef(rowData)
    if (mobilePage !== 1) setMobilePage(1)
  }

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
    if (!showRowNumberColumn || hasExplicitNoColumn || isMobile) return columnDefs
    return [rowNumberColumnDef, ...columnDefs]
  }, [columnDefs, hasExplicitNoColumn, isMobile, rowNumberColumnDef, showRowNumberColumn])

  const mergedDefaultColDef = useMemo<ColDef<TData>>(
    () => ({
      flex: 1,
      minWidth: isMobile ? 120 : 150,
      cellClass: "text-left",
      headerClass: "text-left",
      resizable: true,
      filter: false,
      sortable: true,
      wrapHeaderText: true,
      autoHeaderHeight: true,
      ...defaultColDef,
    }),
    [defaultColDef, isMobile]
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
    const rows = safeRowData
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
        height: isMobile
          ? "calc(100dvh - 12rem)"
          : typeof height === "number"
            ? `${height}px`
            : height,
        minHeight: isMobile
          ? 360
          : typeof minHeight === "number"
            ? `${minHeight}px`
            : minHeight,
      }

  const mobileColumns = useMemo(
    () => resolvedColumnDefs.filter((column) => !column.hide),
    [resolvedColumnDefs]
  )

  const renderMobileCell = (
    column: ColDef<TData>,
    row: TData,
    rowIndex: number
  ) => {
    const value =
      typeof column.valueGetter === "function"
        ? column.valueGetter({
            data: row,
            value: undefined,
            node: { rowIndex, data: row },
            column,
            colDef: column,
            context,
          } as never)
        : getFieldValue(row, column.field)

    const params = {
      data: row,
      value,
      node: { rowIndex, data: row },
      rowIndex,
      column,
      colDef: column,
      context,
    }

    const renderer = column.cellRenderer
    if (typeof renderer === "function") {
      return renderer(params as never)
    }

    if (typeof renderer === "string") {
      const Component = gridComponents?.[
        renderer as keyof typeof gridComponents
      ] as ComponentType<Record<string, unknown>> | undefined
      if (Component) return <Component {...params} />
    }

    const formatted =
      typeof column.valueFormatter === "function"
        ? column.valueFormatter(params as never)
        : value

    if (formatted === null || formatted === undefined || formatted === "") {
      return <span className="text-muted-foreground">—</span>
    }
    if (typeof formatted === "object") return null
    return String(formatted)
  }

  const mobileRows = (() => {
    const total = safeRowData.length
    const totalPages = Math.max(1, Math.ceil(total / mobilePageSize))
    const currentPage = Math.min(mobilePage, totalPages)
    const start = (currentPage - 1) * mobilePageSize
    const rows = safeRowData.slice(start, start + mobilePageSize)
    return { rows, total, totalPages, currentPage, start, end: start + rows.length }
  })()

  const goToMobilePage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), mobileRows.totalPages)
    setMobilePage(clamped)
    requestAnimationFrame(() => {
      mobileListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }

  const handleMobileCardClick = (
    event: ReactMouseEvent<HTMLDivElement>,
    row: TData
  ) => {
    if (!onRowClicked) return
    const target = event.target
    if (
      target instanceof HTMLElement &&
      target.closest(
        "button, a, input, select, textarea, label, [role='switch'], [data-cell-click-ignore]"
      )
    ) {
      return
    }
    onRowClicked(row)
  }

  if (isMobile) {
    return (
      <div className="min-w-0">
        {title ? (
          <h2 className="mb-3 text-base font-medium text-foreground">{title}</h2>
        ) : null}

        {loading ? (
          <div className="space-y-3" role="status" aria-label="Loading table data">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, row) => (
                    <div key={row} className="grid grid-cols-[6.5rem_1fr] gap-3">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : mobileRows.rows.length === 0 ? (
          <div className="rounded-2xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            {noRowsText}
          </div>
        ) : (
          <div ref={mobileListRef} className="space-y-3">
            {mobileRows.rows.map((row, rowIndex) => (
              <div
                key={String(
                  (row as Record<string, unknown>).id ?? rowIndex
                )}
                onClick={
                  onRowClicked
                    ? (event) => handleMobileCardClick(event, row)
                    : undefined
                }
                className={cn(
                  "rounded-2xl border bg-card p-4 shadow-sm",
                  onRowClicked && "cursor-pointer transition-colors active:bg-muted/50"
                )}
              >
                <div className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] items-start gap-x-3 gap-y-2.5">
                  {mobileColumns.map((column, columnIndex) => {
                    const label =
                      column.headerName ?? String(column.field ?? "")
                    if (!label) return null
                    return (
                      <div
                        key={`${String(column.colId ?? column.field ?? columnIndex)}-${columnIndex}`}
                        className="contents"
                      >
                        <span className="pt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {label}
                        </span>
                        <div className="min-w-0 text-sm break-words">
                          {renderMobileCell(column, row, rowIndex)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {mobileRows.total > 0 && (pagination || mobileRows.totalPages > 1) ? (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={mobileRows.currentPage <= 1}
                onClick={() => goToMobilePage(mobileRows.currentPage - 1)}
              >
                <ChevronLeft />
                Previous
              </Button>
              <span className="text-xs font-medium text-muted-foreground">
                Page {mobileRows.currentPage} of {mobileRows.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={mobileRows.currentPage >= mobileRows.totalPages}
                onClick={() => goToMobilePage(mobileRows.currentPage + 1)}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
            <div className="flex w-full items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span>
                Showing {mobileRows.start + 1}–{mobileRows.end} of {mobileRows.total}
              </span>
              <label className="flex items-center gap-1.5">
                <span>Rows</span>
                <select
                  aria-label="Rows per page"
                  value={mobilePageSize}
                  onChange={(event) => {
                    setMobilePageSize(Number(event.target.value))
                    setMobilePage(1)
                  }}
                  className="h-7 rounded-md border border-input bg-background px-1.5 text-[11px] text-foreground"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}
      </div>
    )
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
          rowData={safeRowData}
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
          pagination={pagination && safeRowData.length > 0}
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
