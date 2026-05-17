import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { VisitorDetail } from '@/components/visitor/VisitorDetail'
import type { Visitor } from '@/types'

const mockVisitor: Visitor = {
  id: 'test-id',
  name: '张三',
  phone: '13912345678',
  company: '测试公司',
  purpose: '商务洽谈',
  personToVisit: '李四',
  visiteeCompany: '目标公司',
  visitTime: '2026-05-17T10:00:00.000Z',
  notes: '测试备注',
  createdAt: '2026-05-17T09:00:00.000Z',
}

// 包裹在 Dialog 中渲染
function renderWithDialog(ui: React.ReactElement) {
  return render(
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent>
        {ui}
      </DialogContent>
    </Dialog>
  )
}

describe('VisitorDetail', () => {
  it('应渲染访客详情标题', () => {
    renderWithDialog(<VisitorDetail visitor={mockVisitor} />)
    expect(screen.getByText('访客详情')).toBeInTheDocument()
  })

  it('应渲染所有字段标签', () => {
    renderWithDialog(<VisitorDetail visitor={mockVisitor} />)
    expect(screen.getByText('访客姓名')).toBeInTheDocument()
    expect(screen.getByText('手机号码')).toBeInTheDocument()
    expect(screen.getByText('公司/组织')).toBeInTheDocument()
    expect(screen.getByText('来访目的')).toBeInTheDocument()
    expect(screen.getByText('被访人员')).toBeInTheDocument()
    expect(screen.getByText('被访者公司')).toBeInTheDocument()
    expect(screen.getByText('来访时间')).toBeInTheDocument()
    expect(screen.getByText('备注')).toBeInTheDocument()
    expect(screen.getByText('登记时间')).toBeInTheDocument()
  })

  it('应渲染访客的值', () => {
    renderWithDialog(<VisitorDetail visitor={mockVisitor} />)
    expect(screen.getByText('张三')).toBeInTheDocument()
    expect(screen.getByText('13912345678')).toBeInTheDocument()
    expect(screen.getByText('测试公司')).toBeInTheDocument()
    expect(screen.getByText('商务洽谈')).toBeInTheDocument()
    expect(screen.getByText('李四')).toBeInTheDocument()
    expect(screen.getByText('目标公司')).toBeInTheDocument()
    expect(screen.getByText('测试备注')).toBeInTheDocument()
  })

  it('空的可选字段应显示短横线', () => {
    const visitorNoOptional: Visitor = {
      ...mockVisitor,
      company: '',
      visiteeCompany: '',
      notes: '',
    }
    renderWithDialog(<VisitorDetail visitor={visitorNoOptional} />)
    const dashes = screen.getAllByText('-')
    expect(dashes.length).toBeGreaterThanOrEqual(3)
  })

  it('有 updatedAt 应显示最后更新字段', () => {
    const visitorWithUpdate: Visitor = {
      ...mockVisitor,
      updatedAt: '2026-05-18T10:00:00.000Z',
    }
    renderWithDialog(<VisitorDetail visitor={visitorWithUpdate} />)
    expect(screen.getByText('最后更新')).toBeInTheDocument()
  })

  it('无 updatedAt 不应显示最后更新字段', () => {
    renderWithDialog(<VisitorDetail visitor={mockVisitor} />)
    expect(screen.queryByText('最后更新')).not.toBeInTheDocument()
  })
})
