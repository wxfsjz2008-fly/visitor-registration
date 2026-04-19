## Overview

本次变更仅涉及 UI 布局调整，将访客登记表单中「被访人员」和「来访时间」两个字段的显示位置互换。

## Current State

当前 `VisitorRegistrationForm.tsx` 中表单字段的渲染顺序：

1. 访客姓名 (name)
2. 手机号码 (phone)
3. 公司/组织 (company)
4. **被访人员 (personToVisit)** ← 当前第4位
5. **来访时间 (visitTime)** ← 当前第5位
6. 来访目的 (purpose)
7. 备注 (notes)

## Target State

调整后的表单字段渲染顺序：

1. 访客姓名 (name)
2. 手机号码 (phone)
3. 公司/组织 (company)
4. **来访时间 (visitTime)** ← 调整到第4位
5. **被访人员 (personToVisit)** ← 调整到第5位
6. 来访目的 (purpose)
7. 备注 (notes)

## Implementation Details

### File to Modify

- `src/components/visitor/VisitorRegistrationForm.tsx`

### Change Description

在 JSX 渲染部分，交换「被访人员」字段块（第199-214行）和「来访时间」字段块（第216-225行）的代码位置。

### Code Blocks to Swap

**「来访时间」字段块** (移动到「公司/组织」之后):
```tsx
{/* 来访时间 */}
<div className="space-y-2">
  <Label htmlFor="visitTime">来访时间</Label>
  <Input
    id="visitTime"
    type="datetime-local"
    value={formData.visitTime}
    onChange={(e) => handleChange('visitTime', e.target.value)}
  />
</div>
```

**「被访人员」字段块** (移动到「来访时间」之后):
```tsx
{/* 被访人员 */}
<div className="space-y-2">
  <Label htmlFor="personToVisit">
    被访人员 <span className="text-destructive">*</span>
  </Label>
  <Input
    id="personToVisit"
    value={formData.personToVisit}
    onChange={(e) => handleChange('personToVisit', e.target.value)}
    placeholder="请输入被访人员姓名"
    className={errors.personToVisit ? 'border-destructive' : ''}
  />
  {errors.personToVisit && (
    <p className="text-sm text-destructive">{errors.personToVisit}</p>
  )}
</div>
```

## Testing

- 验证表单字段按新顺序正确显示
- 验证所有字段功能正常（输入、验证、提交）
- 验证响应式布局在移动端正常显示
