type TableUserCellProps = {
  name: string
  description?: string
}

type TableUserCellRendererParams = {
  value?: unknown
  data?: {
    email?: unknown
  } | null
}

export function TableUserCell({ name, description }: TableUserCellProps) {
  return (
    <div className="flex h-full min-w-0 flex-col justify-center text-left">
      <div className="truncate text-sm font-medium text-foreground">
        {name}
      </div>
      {description ? (
        <div className="truncate text-sm text-muted-foreground">
          {description}
        </div>
      ) : null}
    </div>
  )
}

export function renderTableUserCell(params: TableUserCellRendererParams) {
  return <TableUserCell name={String(params.value ?? "")} />
}

export function renderTableUserCellWithEmail(
  params: TableUserCellRendererParams
) {
  return (
    <TableUserCell
      name={String(params.value ?? "")}
      description={String(params.data?.email ?? "")}
    />
  )
}
