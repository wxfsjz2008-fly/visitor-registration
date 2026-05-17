import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VisitorTable } from '@/components/visitor/VisitorTable'
import * as storage from '@/utils/storage'

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

vi.mock('@/utils/storage', () => ({
  getVisitorsPaginated: vi.fn(),
  deleteVisitor: vi.fn(),
  exportVisitors: vi.fn(),
  importVisitors: vi.fn(),
  updateVisitor: vi.fn(),
}))

import { toast } from '@/hooks/use-toast'

function createMockVisitors(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    name: `访客${i}`,
    phone: `1391234567${i.toString().padStart(2, '0')}`,
    company: i % 2 === 0 ? `公司${i}` : '',
    purpose: `目的${i}`,
    personToVisit: `被访人${i}`,
    visiteeCompany: i % 2 === 0 ? `被访公司${i}` : '',
    visitTime: `2026-05-${10 + i}T10:00:00.000Z`,
    notes: i % 2 === 0 ? `备注${i}` : '',
    createdAt: `2026-05-0${1 + i}T09:00:00.000Z`,
  }))
}

describe('VisitorTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    } as any)
  })

  it('无数据时应显示暂无访客记录', () => {
    render(<VisitorTable />)
    expect(screen.getByText('暂无访客记录')).toBeInTheDocument()
  })

  it('有数据时应显示表格', () => {
    const visitors = createMockVisitors(2)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as any)
    render(<VisitorTable />)
    expect(screen.getByText('访客0')).toBeInTheDocument()
    expect(screen.getByText('访客1')).toBeInTheDocument()
  })

  it('应渲染筛选区域', () => {
    render(<VisitorTable />)
    expect(screen.getByPlaceholderText('搜索访客姓名...')).toBeInTheDocument()
    expect(screen.getByLabelText('开始日期')).toBeInTheDocument()
    expect(screen.getByLabelText('结束日期')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清除筛选' })).toBeInTheDocument()
  })

  it('应渲染导出和导入按钮', () => {
    render(<VisitorTable />)
    expect(screen.getByRole('button', { name: /导出/ })).toBeInTheDocument()
    expect(screen.getByText('导入')).toBeInTheDocument()
  })

  it('点击删除按钮应弹出确认对话框', async () => {
    const visitors = createMockVisitors(1)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as any)
    const user = userEvent.setup()
    render(<VisitorTable />)

    const deleteButtons = screen.getAllByTitle('删除')
    await user.click(deleteButtons[0])

    // "确认删除" 同时出现在标题(h2)和按钮中，使用 getByRole 精确匹配
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '确认删除' })).toBeInTheDocument()
    })
    expect(screen.getByText(/确定要删除访客 "访客0" 的记录吗/)).toBeInTheDocument()
  })

  it('确认删除应调用 deleteVisitor', async () => {
    const visitors = createMockVisitors(1)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as any)
    vi.mocked(storage.deleteVisitor).mockReturnValue(true)
    const user = userEvent.setup()
    render(<VisitorTable />)

    const deleteButtons = screen.getAllByTitle('删除')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '确认删除' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: '确认删除' }))

    expect(storage.deleteVisitor).toHaveBeenCalledWith('id-0')
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '访客记录已删除' }))
  })

  it('删除失败应显示错误 toast', async () => {
    const visitors = createMockVisitors(1)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as any)
    vi.mocked(storage.deleteVisitor).mockReturnValue(false)
    const user = userEvent.setup()
    render(<VisitorTable />)

    const deleteButtons = screen.getAllByTitle('删除')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '确认删除' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: '确认删除' }))

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '删除失败' }))
  })

  it('点击查看应弹出详情对话框', async () => {
    const visitors = createMockVisitors(1)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as any)
    const user = userEvent.setup()
    render(<VisitorTable />)

    const viewButtons = screen.getAllByTitle('查看详情')
    await user.click(viewButtons[0])

    await waitFor(() => {
      expect(screen.getByText('访客详情')).toBeInTheDocument()
    })
  })

  it('点击编辑应弹出编辑表单', async () => {
    const visitors = createMockVisitors(1)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as any)
    const user = userEvent.setup()
    render(<VisitorTable />)

    const editButtons = screen.getAllByTitle('编辑')
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('编辑访客信息')).toBeInTheDocument()
    })
  })

  it('点击清除筛选应重置搜索', async () => {
    const visitors = createMockVisitors(3)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 3,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as any)
    const user = userEvent.setup()
    render(<VisitorTable />)

    await user.type(screen.getByPlaceholderText('搜索访客姓名...'), '测试')
    await user.click(screen.getByRole('button', { name: '清除筛选' }))

    expect(screen.getByPlaceholderText('搜索访客姓名...')).toHaveValue('')
  })

  it('数据超过一页时应显示分页', () => {
    const visitors = createMockVisitors(10)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 15,
      page: 1,
      pageSize: 10,
      totalPages: 2,
    } as any)
    render(<VisitorTable />)

    expect(screen.getByText(/共 15 条记录/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一页' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一页' })).toBeInTheDocument()
  })

  it('第一页时上一页按钮应禁用', () => {
    const visitors = createMockVisitors(10)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 15,
      page: 1,
      pageSize: 10,
      totalPages: 2,
    } as any)
    render(<VisitorTable />)

    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一页' })).not.toBeDisabled()
  })

  it('点击导出应调用 exportVisitors', async () => {
    vi.mocked(storage.exportVisitors).mockReturnValue('[]')
    const user = userEvent.setup()
    render(<VisitorTable />)

    await user.click(screen.getByRole('button', { name: /导出/ }))
    expect(storage.exportVisitors).toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '导出成功' }))
  })

  it('取消删除应关闭确认对话框', async () => {
    const visitors = createMockVisitors(1)
    vi.mocked(storage.getVisitorsPaginated).mockReturnValue({
      data: visitors,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as any)
    const user = userEvent.setup()
    render(<VisitorTable />)

    const deleteButtons = screen.getAllByTitle('删除')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '确认删除' })).toBeInTheDocument()
    })

    // 按取消按钮关闭
    await user.click(screen.getByRole('button', { name: '取消' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '确认删除' })).not.toBeInTheDocument()
    })
  })
})
