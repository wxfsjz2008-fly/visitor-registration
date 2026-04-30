import type { Visitor, VisitorInput, VisitorUpdate, VisitorFilter, PaginationParams, PaginatedResult } from '@/types'

const STORAGE_KEY = 'visitor_registration_data'

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 获取所有访客记录
 */
export function getVisitors(): Visitor[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data) as Visitor[]
  } catch (error) {
    console.error('Failed to load visitors from localStorage:', error)
    return []
  }
}

/**
 * 保存所有访客记录
 */
function saveVisitors(visitors: Visitor[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors))
  } catch (error) {
    console.error('Failed to save visitors to localStorage:', error)
    throw new Error('保存数据失败，请检查浏览器存储空间')
  }
}

/**
 * 添加新访客
 */
export function addVisitor(input: VisitorInput): Visitor {
  const visitors = getVisitors()
  const now = new Date().toISOString()
  
  const newVisitor: Visitor = {
    ...input,
    id: generateId(),
    createdAt: now,
  }
  
  visitors.unshift(newVisitor) // 新记录放在最前面
  saveVisitors(visitors)
  
  return newVisitor
}

/**
 * 根据 ID 获取访客
 */
export function getVisitorById(id: string): Visitor | null {
  const visitors = getVisitors()
  return visitors.find(v => v.id === id) || null
}

/**
 * 更新访客信息
 */
export function updateVisitor(id: string, updates: VisitorUpdate): Visitor | null {
  const visitors = getVisitors()
  const index = visitors.findIndex(v => v.id === id)
  
  if (index === -1) return null
  
  const updatedVisitor: Visitor = {
    ...visitors[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  visitors[index] = updatedVisitor
  saveVisitors(visitors)
  
  return updatedVisitor
}

/**
 * 删除访客记录
 */
export function deleteVisitor(id: string): boolean {
  const visitors = getVisitors()
  const index = visitors.findIndex(v => v.id === id)
  
  if (index === -1) return false
  
  visitors.splice(index, 1)
  saveVisitors(visitors)
  
  return true
}

/**
 * 筛选访客记录
 */
export function filterVisitors(
  visitors: Visitor[],
  filter: VisitorFilter
): Visitor[] {
  let result = [...visitors]
  
  // 按姓名搜索（不区分大小写）
  if (filter.searchTerm) {
    const term = filter.searchTerm.toLowerCase()
    result = result.filter(v => 
      v.name.toLowerCase().includes(term)
    )
  }
  
  // 按日期范围筛选
  if (filter.startDate) {
    const startDate = new Date(filter.startDate)
    startDate.setHours(0, 0, 0, 0)
    result = result.filter(v => new Date(v.visitTime) >= startDate)
  }
  
  if (filter.endDate) {
    const endDate = new Date(filter.endDate)
    endDate.setHours(23, 59, 59, 999)
    result = result.filter(v => new Date(v.visitTime) <= endDate)
  }
  
  return result
}

/**
 * 分页获取访客记录
 */
export function getVisitorsPaginated(
  filter: VisitorFilter = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): PaginatedResult<Visitor> {
  const allVisitors = getVisitors()
  const filteredVisitors = filterVisitors(allVisitors, filter)
  
  // 按创建时间降序排序（最新的在前）
  filteredVisitors.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  const total = filteredVisitors.length
  const totalPages = Math.ceil(total / pagination.pageSize)
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  
  return {
    data: filteredVisitors.slice(start, end),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  }
}

/**
 * 导出所有访客数据为 JSON
 */
export function exportVisitors(): string {
  const visitors = getVisitors()
  return JSON.stringify(visitors, null, 2)
}

/**
 * 从 JSON 导入访客数据
 */
export function importVisitors(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const importedData = JSON.parse(jsonString)
    
    if (!Array.isArray(importedData)) {
      return { success: false, count: 0, error: '文件格式无效，请选择正确的导出文件' }
    }
    
    // 验证数据格式
    const validVisitors: Visitor[] = []
    for (const item of importedData) {
      if (
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.phone === 'string' &&
        typeof item.purpose === 'string' &&
        typeof item.personToVisit === 'string' &&
        typeof item.visitTime === 'string' &&
        typeof item.createdAt === 'string'
      ) {
        validVisitors.push({
          id: generateId(), // 生成新 ID 避免冲突
          name: item.name,
          phone: item.phone,
          company: item.company || '',
          purpose: item.purpose,
          personToVisit: item.personToVisit,
          visiteeCompany: item.visiteeCompany || '',
          visitTime: item.visitTime,
          notes: item.notes || '',
          createdAt: new Date().toISOString(),
        })
      }
    }
    
    if (validVisitors.length === 0) {
      return { success: false, count: 0, error: '文件中没有有效的访客记录' }
    }
    
    // 合并到现有数据
    const existingVisitors = getVisitors()
    const mergedVisitors = [...validVisitors, ...existingVisitors]
    saveVisitors(mergedVisitors)
    
    return { success: true, count: validVisitors.length }
  } catch {
    return { success: false, count: 0, error: '文件格式无效，请选择正确的导出文件' }
  }
}

/**
 * 清空所有访客数据（谨慎使用）
 */
export function clearAllVisitors(): void {
  localStorage.removeItem(STORAGE_KEY)
}
