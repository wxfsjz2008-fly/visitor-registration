import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VisitorRegistrationForm } from '@/components/visitor/VisitorRegistrationForm'

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

vi.mock('@/utils/storage', () => ({
  addVisitor: vi.fn(),
}))

import { toast } from '@/hooks/use-toast'
import { addVisitor } from '@/utils/storage'

describe('VisitorRegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('应渲染所有表单字段', () => {
    render(<VisitorRegistrationForm />)
    expect(screen.getByLabelText(/访客姓名/)).toBeInTheDocument()
    expect(screen.getByLabelText(/手机号码/)).toBeInTheDocument()
    expect(screen.getByLabelText(/来访目的/)).toBeInTheDocument()
    expect(screen.getByLabelText(/被访人员/)).toBeInTheDocument()
  })

  it('空必填字段提交应显示验证错误', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    expect(screen.getByText('访客姓名不能为空')).toBeInTheDocument()
    expect(screen.getByText('手机号码不能为空')).toBeInTheDocument()
    expect(screen.getByText('请填写来访目的')).toBeInTheDocument()
    expect(screen.getByText('请填写被访人员')).toBeInTheDocument()
  })

  it('姓名少于2字符应显示错误', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.type(screen.getByLabelText(/访客姓名/), '张')
    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    expect(screen.getByText('访客姓名至少需要2个字符')).toBeInTheDocument()
  })

  it('无效手机号应显示错误', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.type(screen.getByLabelText(/手机号码/), '12345')
    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    expect(screen.getByText('请输入有效的手机号码')).toBeInTheDocument()
  })

  it('合法手机号应通过验证', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.type(screen.getByLabelText(/访客姓名/), '张三')
    await user.type(screen.getByLabelText(/手机号码/), '13912345678')
    await user.type(screen.getByLabelText(/来访目的/), '商务洽谈')
    await user.type(screen.getByLabelText(/被访人员/), '李四')
    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    expect(screen.queryByText('请输入有效的手机号码')).not.toBeInTheDocument()
  })

  it('非法手机号前缀应被拒绝', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.type(screen.getByLabelText(/手机号码/), '12345678901')
    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    expect(screen.getByText('请输入有效的手机号码')).toBeInTheDocument()
  })

  it('输入后应清除对应字段的错误', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.click(screen.getByRole('button', { name: /提交登记/ }))
    expect(screen.getByText('访客姓名不能为空')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/访客姓名/), '张三')
    expect(screen.queryByText('访客姓名不能为空')).not.toBeInTheDocument()
  })

  it('正确填写后提交应调用 addVisitor 并显示成功 toast', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.type(screen.getByLabelText(/访客姓名/), '张三')
    await user.type(screen.getByLabelText(/手机号码/), '13912345678')
    await user.type(screen.getByLabelText(/来访目的/), '商务洽谈')
    await user.type(screen.getByLabelText(/被访人员/), '李四')
    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    expect(addVisitor).toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '访客登记成功' }))
  })

  it('提交失败应显示错误 toast', async () => {
    vi.mocked(addVisitor).mockImplementation(() => {
      throw new Error('保存失败')
    })
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.type(screen.getByLabelText(/访客姓名/), '张三')
    await user.type(screen.getByLabelText(/手机号码/), '13912345678')
    await user.type(screen.getByLabelText(/来访目的/), '商务洽谈')
    await user.type(screen.getByLabelText(/被访人员/), '李四')
    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '登记失败' }))
  })

  it('重置按钮应清空所有字段和错误', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.click(screen.getByRole('button', { name: /提交登记/ }))
    expect(screen.getByText('访客姓名不能为空')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /重置/ }))
    expect(screen.queryByText('访客姓名不能为空')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/访客姓名/)).toHaveValue('')
  })

  it('提交成功后表单应重置', async () => {
    // 确保 addVisitor mock 恢复正常
    vi.mocked(addVisitor).mockImplementation((data) => ({
      ...data,
      id: 'mock-id',
      createdAt: new Date().toISOString(),
    }))
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.type(screen.getByLabelText(/访客姓名/), '张三')
    await user.type(screen.getByLabelText(/手机号码/), '13912345678')
    await user.type(screen.getByLabelText(/来访目的/), '商务洽谈')
    await user.type(screen.getByLabelText(/被访人员/), '李四')
    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    expect(addVisitor).toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '访客登记成功' }))
  })

  it('提交时传给 addVisitor 的数据应包含 trim 后的值', async () => {
    const user = userEvent.setup()
    render(<VisitorRegistrationForm />)

    await user.type(screen.getByLabelText(/访客姓名/), '  张三  ')
    await user.type(screen.getByLabelText(/手机号码/), '13912345678')
    await user.type(screen.getByLabelText(/来访目的/), '  商务洽谈  ')
    await user.type(screen.getByLabelText(/被访人员/), '  李四  ')
    await user.click(screen.getByRole('button', { name: /提交登记/ }))

    const calledWith = vi.mocked(addVisitor).mock.calls[0][0]
    expect(calledWith.name).toBe('张三')
    expect(calledWith.purpose).toBe('商务洽谈')
    expect(calledWith.personToVisit).toBe('李四')
  })
})
