// 访客信息接口
export interface Visitor {
  id: string                // 唯一标识符
  name: string              // 访客姓名
  phone: string             // 联系电话
  company: string           // 公司/组织（可选）
  purpose: string           // 来访目的
  personToVisit: string     // 被访人员
  visiteeCompany: string    // 被访者公司（可选）
  visitTime: string         // 来访时间 (ISO 8601)
  notes: string             // 备注（可选）
  createdAt: string         // 创建时间 (ISO 8601)
  updatedAt?: string        // 更新时间 (ISO 8601)
}

// 创建访客时的输入类型（不含自动生成的字段）
export type VisitorInput = Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>

// 更新访客时的输入类型
export type VisitorUpdate = Partial<VisitorInput>

// 访客筛选条件
export interface VisitorFilter {
  searchTerm?: string       // 搜索关键词（按姓名）
  startDate?: string        // 开始日期
  endDate?: string          // 结束日期
}

// 分页参数
export interface PaginationParams {
  page: number              // 当前页码（从 1 开始）
  pageSize: number          // 每页数量
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[]                 // 当前页数据
  total: number             // 总记录数
  page: number              // 当前页码
  pageSize: number          // 每页数量
  totalPages: number        // 总页数
}
