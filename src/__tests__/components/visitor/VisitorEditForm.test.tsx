import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { VisitorEditForm } from '@/components/visitor/VisitorEditForm'
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

function renderWithDialog(ui: React.ReactElement) {
  return render(
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        {ui}
      </DialogContent>
    </Dialog>
  )
}

describe('VisitorEditForm', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应预填当前访客信息', () => {
    renderWithDialog(<VisitorEditForm visitor={mockVisitor} onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByDisplayValue('张三')).toBeInTheDocument()
    expect(screen.getByDisplayValue('13912345678')).toBeInTheDocument()
    expect(screen.getByDisplayValue('商务洽谈')).toBeInTheDocument()
    expect(screen.getByDisplayValue('李四')).toBeInTheDocument()
  })

  it('应显示编辑访客信息标题', () => {
    renderWithDialog(<VisitorEditForm visitor={mockVisitor} onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByText('编辑访客信息')).toBeInTheDocument()
  })

  it('空必填字段提交应显示验证错误', async () => {
    const user = userEvent.setup()
    renderWithDialog(<VisitorEditForm visitor={mockVisitor} onSave={mockOnSave} onCancel={mockOnCancel} />)

    const nameInput = screen.getByDisplayValue('张三')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /保存/ }))

    expect(screen.getByText('访客姓名不能为空')).toBeInTheDocument()
  })

  it('无效手机号应显示错误', async () => {
    const user = userEvent.setup()
    renderWithDialog(<VisitorEditForm visitor={mockVisitor} onSave={mockOnSave} onCancel={mockOnCancel} />)

    const phoneInput = screen.getByDisplayValue('13912345678')
    await user.clear(phoneInput)
    await user.type(phoneInput, '12345')
    await user.click(screen.getByRole('button', { name: /保存/ }))

    expect(screen.getByText('请输入有效的手机号码')).toBeInTheDocument()
  })

  it('姓名少于2字符应显示错误', async () => {
    const user = userEvent.setup()
    renderWithDialog(<VisitorEditForm visitor={mockVisitor} onSave={mockOnSave} onCancel={mockOnCancel} />)

    const nameInput = screen.getByDisplayValue('张三')
    await user.clear(nameInput)
    await user.type(nameInput, '张')
    await user.click(screen.getByRole('button', { name: /保存/ }))

    expect(screen.getByText('访客姓名至少需要2个字符')).toBeInTheDocument()
  })

  it('验证通过应调用 onSave 传入更新后的 Visitor', async () => {
    const user = userEvent.setup()
    renderWithDialog(<VisitorEditForm visitor={mockVisitor} onSave={mockOnSave} onCancel={mockOnCancel} />)

    const nameInput = screen.getByDisplayValue('张三')
    await user.clear(nameInput)
    await user.type(nameInput, '王五')
    await user.click(screen.getByRole('button', { name: /保存/ }))

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: '王五', id: 'test-id' })
    )
  })

  it('取消应调用 onCancel', async () => {
    const user = userEvent.setup()
    renderWithDialog(<VisitorEditForm visitor={mockVisitor} onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.click(screen.getByRole('button', { name: /取消/ }))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('保存数据应 trim 后传入', async () => {
    const user = userEvent.setup()
    renderWithDialog(<VisitorEditForm visitor={mockVisitor} onSave={mockOnSave} onCancel={mockOnCancel} />)

    const nameInput = screen.getByDisplayValue('张三')
    await user.clear(nameInput)
    await user.type(nameInput, '  王五  ')
    await user.click(screen.getByRole('button', { name: /保存/ }))

    const calledWith = mockOnSave.mock.calls[0][0] as Visitor
    expect(calledWith.name).toBe('王五')
  })
})
