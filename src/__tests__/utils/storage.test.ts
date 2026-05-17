import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  addVisitor,
  getVisitors,
  getVisitorById,
  updateVisitor,
  deleteVisitor,
  filterVisitors,
  getVisitorsPaginated,
  importVisitors,
  exportVisitors,
  clearAllVisitors,
  generateId,
} from '@/utils/storage'
import type { VisitorInput } from '@/types'

const mockInput: VisitorInput = {
  name: '张三',
  phone: '13912345678',
  company: '测试公司',
  purpose: '商务洽谈',
  personToVisit: '李四',
  visiteeCompany: '目标公司',
  visitTime: '2026-05-17T10:00:00.000Z',
  notes: '测试备注',
}

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('generateId', () => {
    it('应返回包含连字符的字符串', () => {
      const id = generateId()
      expect(id).toContain('-')
    })

    it('每次调用应返回不同的 ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('getVisitors', () => {
    it('空数据应返回空数组', () => {
      expect(getVisitors()).toEqual([])
    })

    it('有数据应返回解析后的数组', () => {
      addVisitor(mockInput)
      const visitors = getVisitors()
      expect(visitors).toHaveLength(1)
      expect(visitors[0].name).toBe('张三')
    })

    it('JSON 格式错误应返回空数组并 console.error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('visitor_registration_data', 'invalid-json')
      expect(getVisitors()).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('addVisitor', () => {
    it('应成功添加访客并返回完整对象', () => {
      const result = addVisitor(mockInput)
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeDefined()
      expect(result.name).toBe('张三')
      expect(result.phone).toBe('13912345678')
      expect(result.company).toBe('测试公司')
      expect(result.purpose).toBe('商务洽谈')
      expect(result.personToVisit).toBe('李四')
      expect(result.visiteeCompany).toBe('目标公司')
      expect(result.notes).toBe('测试备注')
    })

    it('新记录应放在最前面', () => {
      addVisitor({ ...mockInput, name: '第一个' })
      addVisitor({ ...mockInput, name: '第二个' })
      const visitors = getVisitors()
      expect(visitors[0].name).toBe('第二个')
      expect(visitors[1].name).toBe('第一个')
    })

    it('应自动生成 id 和 createdAt', () => {
      const result = addVisitor(mockInput)
      expect(typeof result.id).toBe('string')
      expect(result.id.length).toBeGreaterThan(0)
      expect(typeof result.createdAt).toBe('string')
      expect(new Date(result.createdAt).getTime()).not.toBeNaN()
    })
  })

  describe('getVisitorById', () => {
    it('存在的 ID 应返回访客对象', () => {
      const visitor = addVisitor(mockInput)
      const found = getVisitorById(visitor.id)
      expect(found).not.toBeNull()
      expect(found!.name).toBe('张三')
    })

    it('不存在的 ID 应返回 null', () => {
      expect(getVisitorById('non-existent-id')).toBeNull()
    })
  })

  describe('updateVisitor', () => {
    it('应正常更新访客信息', () => {
      const visitor = addVisitor(mockInput)
      const updated = updateVisitor(visitor.id, { name: '李四更新' })
      expect(updated).not.toBeNull()
      expect(updated!.name).toBe('李四更新')
    })

    it('应自动添加 updatedAt 字段', () => {
      const visitor = addVisitor(mockInput)
      const updated = updateVisitor(visitor.id, { name: '李四更新' })
      expect(updated!.updatedAt).toBeDefined()
      expect(typeof updated!.updatedAt).toBe('string')
    })

    it('不存在的 ID 应返回 null', () => {
      expect(updateVisitor('non-existent', { name: '测试' })).toBeNull()
    })

    it('更新后数据应持久化', () => {
      const visitor = addVisitor(mockInput)
      updateVisitor(visitor.id, { name: '持久化测试' })
      const found = getVisitorById(visitor.id)
      expect(found!.name).toBe('持久化测试')
    })
  })

  describe('deleteVisitor', () => {
    it('存在的 ID 应删除成功返回 true', () => {
      const visitor = addVisitor(mockInput)
      expect(deleteVisitor(visitor.id)).toBe(true)
      expect(getVisitors()).toHaveLength(0)
    })

    it('不存在的 ID 应返回 false', () => {
      expect(deleteVisitor('non-existent')).toBe(false)
    })

    it('删除后不应影响其他记录', () => {
      const v1 = addVisitor({ ...mockInput, name: '访客1' })
      const v2 = addVisitor({ ...mockInput, name: '访客2' })
      deleteVisitor(v1.id)
      const visitors = getVisitors()
      expect(visitors).toHaveLength(1)
      expect(visitors[0].name).toBe('访客2')
      expect(getVisitorById(v2.id)).not.toBeNull()
    })
  })

  describe('filterVisitors', () => {
    beforeEach(() => {
      addVisitor({ ...mockInput, name: '张三', visitTime: '2026-05-10T10:00:00.000Z' })
      addVisitor({ ...mockInput, name: '李四', visitTime: '2026-05-15T10:00:00.000Z' })
      addVisitor({ ...mockInput, name: '王五', visitTime: '2026-05-20T10:00:00.000Z' })
    })

    it('无筛选条件应返回全部', () => {
      const visitors = getVisitors()
      expect(filterVisitors(visitors, {})).toHaveLength(3)
    })

    it('按姓名搜索应不区分大小写', () => {
      const visitors = getVisitors()
      const result = filterVisitors(visitors, { searchTerm: '张' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('张三')
    })

    it('搜索词匹配不到应返回空', () => {
      const visitors = getVisitors()
      expect(filterVisitors(visitors, { searchTerm: '赵六' })).toHaveLength(0)
    })

    it('按开始日期筛选', () => {
      const visitors = getVisitors()
      const result = filterVisitors(visitors, { startDate: '2026-05-13' })
      expect(result).toHaveLength(2)
    })

    it('按结束日期筛选', () => {
      const visitors = getVisitors()
      const result = filterVisitors(visitors, { endDate: '2026-05-13' })
      expect(result).toHaveLength(1)
    })

    it('按日期范围筛选', () => {
      const visitors = getVisitors()
      const result = filterVisitors(visitors, {
        startDate: '2026-05-13',
        endDate: '2026-05-18',
      })
      // 5月15和5月20 -> 5月15在范围内，5月20超出endDate
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('李四')
    })

    it('组合搜索词和日期筛选', () => {
      const visitors = getVisitors()
      const result = filterVisitors(visitors, {
        searchTerm: '张',
        startDate: '2026-05-09',
        endDate: '2026-05-11',
      })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('张三')
    })
  })

  describe('getVisitorsPaginated', () => {
    it('空数据应返回空结果', () => {
      const result = getVisitorsPaginated()
      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })

    it('默认分页参数（第1页，10条/页）', () => {
      for (let i = 0; i < 15; i++) {
        addVisitor({ ...mockInput, name: `访客${i}` })
      }
      const result = getVisitorsPaginated({}, { page: 1, pageSize: 10 })
      expect(result.data).toHaveLength(10)
      expect(result.total).toBe(15)
      expect(result.totalPages).toBe(2)
      expect(result.page).toBe(1)
    })

    it('第2页应返回剩余数据', () => {
      for (let i = 0; i < 15; i++) {
        addVisitor({ ...mockInput, name: `访客${i}` })
      }
      const result = getVisitorsPaginated({}, { page: 2, pageSize: 10 })
      expect(result.data).toHaveLength(5)
    })

    it('超出范围的页码应返回空数据', () => {
      addVisitor(mockInput)
      const result = getVisitorsPaginated({}, { page: 999, pageSize: 10 })
      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(1)
    })

    it('结合筛选条件分页', () => {
      addVisitor({ ...mockInput, name: '张三' })
      addVisitor({ ...mockInput, name: '李四' })
      addVisitor({ ...mockInput, name: '张三丰' })
      const result = getVisitorsPaginated({ searchTerm: '张' }, { page: 1, pageSize: 10 })
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('数据应按创建时间降序排列', () => {
      addVisitor({ ...mockInput, name: '最早' })
      addVisitor({ ...mockInput, name: '最晚' })
      const result = getVisitorsPaginated({}, { page: 1, pageSize: 10 })
      expect(result.data[0].name).toBe('最晚')
    })
  })

  describe('exportVisitors', () => {
    it('应返回格式化的 JSON 字符串', () => {
      addVisitor(mockInput)
      const exported = exportVisitors()
      const parsed = JSON.parse(exported)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(1)
    })

    it('空数据应返回空数组', () => {
      const exported = exportVisitors()
      expect(JSON.parse(exported)).toEqual([])
    })
  })

  describe('importVisitors', () => {
    it('无效 JSON 应返回错误', () => {
      const result = importVisitors('not-json')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('非数组 JSON 应返回错误', () => {
      const result = importVisitors(JSON.stringify({ name: 'test' }))
      expect(result.success).toBe(false)
      expect(result.error).toContain('格式无效')
    })

    it('有效数据应成功导入', () => {
      const data = JSON.stringify([{
        id: 'test-id',
        name: '导入用户',
        phone: '13900000000',
        purpose: '测试',
        personToVisit: '某人',
        visitTime: '2026-05-17T10:00:00.000Z',
        createdAt: '2026-05-17T10:00:00.000Z',
      }])
      const result = importVisitors(data)
      expect(result.success).toBe(true)
      expect(result.count).toBe(1)
    })

    it('导入的数据应合并到现有数据', () => {
      addVisitor({ ...mockInput, name: '现有用户' })
      const data = JSON.stringify([{
        id: 'import-1',
        name: '导入用户',
        phone: '13900000000',
        purpose: '测试',
        personToVisit: '某人',
        visitTime: '2026-05-17T10:00:00.000Z',
        createdAt: '2026-05-17T10:00:00.000Z',
      }])
      importVisitors(data)
      expect(getVisitors()).toHaveLength(2)
    })

    it('部分有效部分无效应只导入有效的', () => {
      const data = JSON.stringify([
        { id: '1', name: '有效', phone: '13900000000', purpose: '测试', personToVisit: '某人', visitTime: '2026-05-17T10:00:00.000Z', createdAt: '2026-05-17T10:00:00.000Z' },
        { id: '2' },
        { name: '缺少字段' },
      ])
      const result = importVisitors(data)
      expect(result.success).toBe(true)
      expect(result.count).toBe(1)
    })

    it('全部无效应返回错误', () => {
      const data = JSON.stringify([{ id: '1' }, { name: '不完整' }])
      const result = importVisitors(data)
      expect(result.success).toBe(false)
      expect(result.error).toContain('没有有效')
    })

    it('空数组应返回错误', () => {
      const result = importVisitors('[]')
      expect(result.success).toBe(false)
      expect(result.error).toContain('没有有效')
    })

    it('导入的记录应生成新 ID 避免冲突', () => {
      const data = JSON.stringify([{
        id: 'duplicate-id',
        name: '导入用户',
        phone: '13900000000',
        purpose: '测试',
        personToVisit: '某人',
        visitTime: '2026-05-17T10:00:00.000Z',
        createdAt: '2026-05-17T10:00:00.000Z',
      }])
      importVisitors(data)
      const visitors = getVisitors()
      expect(visitors[0].id).not.toBe('duplicate-id')
    })

    it('缺少可选字段应使用默认值', () => {
      const data = JSON.stringify([{
        id: '1',
        name: '最小字段',
        phone: '13900000000',
        purpose: '测试',
        personToVisit: '某人',
        visitTime: '2026-05-17T10:00:00.000Z',
        createdAt: '2026-05-17T10:00:00.000Z',
      }])
      const result = importVisitors(data)
      expect(result.success).toBe(true)
      const visitors = getVisitors()
      expect(visitors[0].company).toBe('')
      expect(visitors[0].visiteeCompany).toBe('')
      expect(visitors[0].notes).toBe('')
    })
  })

  describe('clearAllVisitors', () => {
    it('清除后 localStorage 应为空', () => {
      addVisitor(mockInput)
      addVisitor({ ...mockInput, name: '第二个' })
      expect(getVisitors()).toHaveLength(2)
      clearAllVisitors()
      expect(getVisitors()).toEqual([])
    })

    it('空数据时调用不应出错', () => {
      expect(() => clearAllVisitors()).not.toThrow()
    })
  })

  describe('saveVisitors (通过其他函数间接测试)', () => {
    it('localStorage 满时应抛出错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      // 模拟 localStorage 满的情况
      const originalSetItem = localStorage.setItem.bind(localStorage)
      localStorage.setItem = () => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError')
      }

      expect(() => addVisitor(mockInput)).toThrow('保存数据失败')

      // 恢复
      localStorage.setItem = originalSetItem
      consoleSpy.mockRestore()
    })
  })
})
