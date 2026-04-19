import { useState, useEffect, useCallback } from 'react'
import { Eye, Pencil, Trash2, FileDown, FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { 
  getVisitorsPaginated, 
  deleteVisitor, 
  exportVisitors, 
  importVisitors,
  updateVisitor 
} from '@/utils/storage'
import { VisitorDetail } from './VisitorDetail'
import { VisitorEditForm } from './VisitorEditForm'
import type { Visitor, VisitorFilter, PaginatedResult } from '@/types'

// 防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
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
  })
}

export function VisitorTable() {
  const [result, setResult] = useState<PaginatedResult<Visitor>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  })
  const [filter, setFilter] = useState<VisitorFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // 对话框状态
  const [viewVisitor, setViewVisitor] = useState<Visitor | null>(null)
  const [editVisitor, setEditVisitor] = useState<Visitor | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // 加载数据
  const loadData = useCallback(() => {
    const data = getVisitorsPaginated(filter, {
      page: result.page,
      pageSize: result.pageSize,
    })
    setResult(data)
  }, [filter, result.page, result.pageSize])

  // 初始加载和筛选变化时重新加载
  useEffect(() => {
    loadData()
  }, [loadData])

  // 搜索词变化时更新筛选
  useEffect(() => {
    setFilter(prev => ({ ...prev, searchTerm: debouncedSearchTerm || undefined }))
    setResult(prev => ({ ...prev, page: 1 })) // 重置到第一页
  }, [debouncedSearchTerm])

  // 处理日期筛选
  const handleDateFilter = (field: 'startDate' | 'endDate', value: string) => {
    setFilter(prev => ({ ...prev, [field]: value || undefined }))
    setResult(prev => ({ ...prev, page: 1 }))
  }

  // 清除筛选
  const clearFilters = () => {
    setSearchTerm('')
    setFilter({})
    setResult(prev => ({ ...prev, page: 1 }))
  }

  // 分页
  const goToPage = (page: number) => {
    if (page >= 1 && page <= result.totalPages) {
      setResult(prev => ({ ...prev, page }))
    }
  }

  // 删除访客
  const handleDelete = (id: string) => {
    const success = deleteVisitor(id)
    if (success) {
      toast({
        title: '访客记录已删除',
        variant: 'success',
      })
      loadData()
    } else {
      toast({
        title: '删除失败',
        description: '未找到该访客记录',
        variant: 'destructive',
      })
    }
    setDeleteConfirmId(null)
  }

  // 编辑访客
  const handleEdit = (visitor: Visitor) => {
    const updated = updateVisitor(visitor.id, visitor)
    if (updated) {
      toast({
        title: '访客信息已更新',
        variant: 'success',
      })
      loadData()
    } else {
      toast({
        title: '更新失败',
        description: '未找到该访客记录',
        variant: 'destructive',
      })
    }
    setEditVisitor(null)
  }

  // 导出数据
  const handleExport = () => {
    const data = exportVisitors()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visitors_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: '导出成功',
      description: '访客数据已导出',
      variant: 'success',
    })
  }

  // 导入数据
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const result = importVisitors(content)
      
      if (result.success) {
        toast({
          title: '导入成功',
          description: `已导入 ${result.count} 条访客记录`,
          variant: 'success',
        })
        loadData()
      } else {
        toast({
          title: '导入失败',
          description: result.error,
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
    
    // 重置文件输入
    e.target.value = ''
  }

  const visitorToDelete = result.data.find(v => v.id === deleteConfirmId)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>访客记录</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-1" />
              导出
            </Button>
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <FileUp className="h-4 w-4 mr-1" />
                  导入
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 筛选区域 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">搜索访客姓名</Label>
            <Input
              id="search"
              placeholder="搜索访客姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center">
            <Label htmlFor="startDate" className="whitespace-nowrap">开始日期</Label>
            <Input
              id="startDate"
              type="date"
              value={filter.startDate || ''}
              onChange={(e) => handleDateFilter('startDate', e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Label htmlFor="endDate" className="whitespace-nowrap">结束日期</Label>
            <Input
              id="endDate"
              type="date"
              value={filter.endDate || ''}
              onChange={(e) => handleDateFilter('endDate', e.target.value)}
              className="w-40"
            />
          </div>
          <Button variant="ghost" onClick={clearFilters}>
            清除筛选
          </Button>
        </div>

        {/* 表格 */}
        {result.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {filter.searchTerm || filter.startDate || filter.endDate
              ? '未找到匹配的访客记录'
              : '暂无访客记录'}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>访客姓名</TableHead>
                    <TableHead>手机号码</TableHead>
                    <TableHead>公司/组织</TableHead>
                    <TableHead>被访人员</TableHead>
                    <TableHead>被访者公司</TableHead>
                    <TableHead>来访时间</TableHead>
                    <TableHead>登记时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-medium">{visitor.name}</TableCell>
                      <TableCell>{visitor.phone}</TableCell>
                      <TableCell>{visitor.company || '-'}</TableCell>
                      <TableCell>{visitor.personToVisit}</TableCell>
                      <TableCell>{visitor.visiteeCompany || '-'}</TableCell>
                      <TableCell>{formatDateTime(visitor.visitTime)}</TableCell>
                      <TableCell>{formatDateTime(visitor.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewVisitor(visitor)}
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditVisitor(visitor)}
                            title="编辑"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmId(visitor.id)}
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 分页 */}
            {result.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  共 {result.total} 条记录，第 {result.page}/{result.totalPages} 页
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(result.page - 1)}
                    disabled={result.page <= 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(result.page + 1)}
                    disabled={result.page >= result.totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 查看详情对话框 */}
        <Dialog open={!!viewVisitor} onOpenChange={() => setViewVisitor(null)}>
          <DialogContent>
            {viewVisitor && <VisitorDetail visitor={viewVisitor} />}
          </DialogContent>
        </Dialog>

        {/* 编辑对话框 */}
        <Dialog open={!!editVisitor} onOpenChange={() => setEditVisitor(null)}>
          <DialogContent className="max-w-2xl">
            {editVisitor && (
              <VisitorEditForm
                visitor={editVisitor}
                onSave={handleEdit}
                onCancel={() => setEditVisitor(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>
                确定要删除访客 "{visitorToDelete?.name}" 的记录吗？此操作不可撤销。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              >
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
