import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import IconWrap from "../common/icon-wrapper"

type StatIconColor = "default" | "success" | "warning" | "destructive" | "muted"

interface Stat {
  label: string
  value: string
  change?: string
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: StatIconColor
}

interface StatCardProps {
  stats: Stat[]
  className?: string
  loading?: boolean
}

export type { Stat, StatIconColor }

const iconColorClasses: Record<StatIconColor, string> = {
  default: "bg-primary text-primary-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
  muted: "bg-muted text-muted-foreground",
}

export default function StatCard({ stats, className, loading = false }: StatCardProps) {
  return (
    <div className={className ?? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"}>
      {stats.map((stat) => {
        const IconComponent = stat.icon
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <IconWrap
                className={iconColorClasses[stat.iconColor ?? "default"]}
              >
                {IconComponent ? <IconComponent /> : null}
              </IconWrap>
            </div>
            {loading ? (
              <Skeleton className="mt-3 h-7 w-20" />
            ) : (
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            )}
            {stat.change && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {stat.change} from last month
              </p>
            )}
          </Card>
        )
      })}
    </div>
  )
}
