## Overview

本次变更在访客登记系统中新增「被访者公司」字段，用于记录被访人员所属的公司信息，以满足多公司入驻场景下的访客管理需求。

## Current State

当前 `Visitor` 类型定义：

```typescript
export interface Visitor {
  id: string                // 唯一标识符
  name: string              // 访客姓名
  phone: string             // 联系电话
  company: string           // 公司/组织（访客的公司）
  purpose: string           // 来访目的
  personToVisit: string     // 被访人员
  visitTime: string         // 来访时间 (ISO 8601)
  notes: string             // 备注（可选）
  createdAt: string         // 创建时间 (ISO 8601)
  updatedAt?: string        // 更新时间 (ISO 8601)
}
```

当前表单字段顺序：
1. 访客姓名 (name) *
2. 手机号码 (phone) *
3. 公司/组织 (company) - 访客的公司
4. 来访时间 (visitTime)
5. 被访人员 (personToVisit) *
6. 来访目的 (purpose) *
7. 备注 (notes)

## Target State

新增 `visiteeCompany` 字段后的类型定义：

```typescript
export interface Visitor {
  id: string                // 唯一标识符
  name: string              // 访客姓名
  phone: string             // 联系电话
  company: string           // 公司/组织（访客的公司）
  purpose: string           // 来访目的
  personToVisit: string     // 被访人员
  visiteeCompany: string    // 被访者公司（新增）
  visitTime: string         // 来访时间 (ISO 8601)
  notes: string             // 备注（可选）
  createdAt: string         // 创建时间 (ISO 8601)
  updatedAt?: string        // 更新时间 (ISO 8601)
}
```

调整后表单字段顺序：
1. 访客姓名 (name) *
2. 手机号码 (phone) *
3. 公司/组织 (company) - 访客的公司
4. 来访时间 (visitTime)
5. 被访人员 (personToVisit) *
6. **被访者公司 (visiteeCompany)** ← 新增，选填
7. 来访目的 (purpose) *
8. 备注 (notes)

## Implementation Details

### 1. 修改类型定义

**File**: `src/types/visitor.ts`

在 `Visitor` 接口中添加 `visiteeCompany` 字段：

```typescript
export interface Visitor {
  // ... 现有字段
  personToVisit: string     // 被访人员
  visiteeCompany: string    // 被访者公司（新增）
  visitTime: string         // 来访时间
  // ... 其他字段
}
```

### 2. 修改表单组件

**File**: `src/components/visitor/VisitorRegistrationForm.tsx`

#### 2.1 更新 formData 初始状态

```typescript
const [formData, setFormData] = useState<VisitorInput>({
  name: '',
  phone: '',
  company: '',
  purpose: '',
  personToVisit: '',
  visiteeCompany: '',  // 新增
  visitTime: getLocalDateTimeString(),
  notes: '',
})
```

#### 2.2 添加新字段 UI

在「被访人员」字段之后添加「被访者公司」字段：

```tsx
{/* 被访者公司 */}
<div className="space-y-2">
  <Label htmlFor="visiteeCompany">被访者公司</Label>
  <Input
    id="visiteeCompany"
    value={formData.visiteeCompany}
    onChange={(e) => handleChange('visiteeCompany', e.target.value)}
    placeholder="请输入被访者所属公司（选填）"
  />
</div>
```

#### 2.3 更新 resetForm 函数

```typescript
const resetForm = () => {
  setFormData({
    // ... 其他字段
    visiteeCompany: '',  // 新增
    // ...
  })
}
```

#### 2.4 更新提交数据处理

```typescript
const visitorData: VisitorInput = {
  // ... 其他字段
  visiteeCompany: formData.visiteeCompany.trim(),  // 新增
  // ...
}
```

### 3. 修改访客列表展示

**File**: `src/components/visitor/VisitorTable.tsx`

在表格中添加「被访者公司」列，位于「被访人员」列之后。

## Data Migration

由于使用 LocalStorage 存储，已有数据不包含 `visiteeCompany` 字段。需要确保代码兼容旧数据：

- 读取数据时，如果 `visiteeCompany` 不存在，默认为空字符串
- 显示时，空字符串显示为 "-" 或不显示

## Testing

- 验证新字段在表单中正确显示
- 验证新字段可以正常输入和清空
- 验证表单提交后数据正确保存
- 验证访客列表正确显示新字段
- 验证旧数据（无 visiteeCompany 字段）能正常加载和显示
- 验证响应式布局在移动端正常显示
