import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { Visitor } from '@/types'

interface VisitorDetailProps {
  visitor: Visitor
}

// 格式化日期时间
function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function VisitorDetail({ visitor }: VisitorDetailProps) {
  const fields = [
    { label: '访客姓名', value: visitor.name },
    { label: '手机号码', value: visitor.phone },
    { label: '公司/组织', value: visitor.company || '-' },
    { label: '来访目的', value: visitor.purpose },
    { label: '被访人员', value: visitor.personToVisit },
    { label: '被访者公司', value: visitor.visiteeCompany || '-' },
    { label: '来访时间', value: formatDateTime(visitor.visitTime) },
    { label: '备注', value: visitor.notes || '-' },
    { label: '登记时间', value: formatDateTime(visitor.createdAt) },
    ...(visitor.updatedAt
      ? [{ label: '最后更新', value: formatDateTime(visitor.updatedAt) }]
      : []),
  ]

  return (
    <>
      <DialogHeader>
        <DialogTitle>访客详情</DialogTitle>
        <DialogDescription>查看访客的详细信息</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {fields.map((field) => (
          <div key={field.label} className="grid grid-cols-3 gap-4">
            <span className="text-muted-foreground text-right">{field.label}</span>
            <span className="col-span-2 font-medium">{field.value}</span>
          </div>
        ))}
      </div>
    </>
  )
}
