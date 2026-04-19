## Why

根据 TAPD 需求 [#1160915239001000035](https://www.tapd.cn/60915239/prong/stories/view/1160915239001000035)：

> 我们这里入驻了很多家公司。因此需要在被访者中新增"被访者公司"这个信息。

当前访客登记表单只记录了被访人员的姓名，在多公司入驻的场景下，仅凭被访人员姓名可能无法准确识别访客要访问的是哪家公司的员工。新增「被访者公司」字段可以：

1. **提升访客接待效率** - 前台可以快速定位被访人员所属公司
2. **避免同名混淆** - 不同公司可能存在同名员工
3. **便于数据统计** - 可以按公司维度统计访客数据

## What Changes

- 在访客登记表单中新增「被访者公司」(visiteeCompany) 字段
- 该字段位于「被访人员」字段之后
- 该字段为选填项

## Capabilities

### New Capabilities

- `visitee-company-field`: 访客登记表单支持录入被访者所属公司信息

### Modified Capabilities

- `visitor-registration-form`: 表单新增「被访者公司」输入字段
- `visitor-data-model`: 数据模型新增 `visiteeCompany` 字段
- `visitor-list-display`: 访客列表展示新增字段数据

## Impact

- **前端**: 
  - 修改 `VisitorRegistrationForm.tsx` 添加新字段
  - 修改 `VisitorTable.tsx` 展示新字段
- **类型定义**: 修改 `src/types/visitor.ts` 添加 `visiteeCompany` 字段
- **数据存储**: LocalStorage 中的访客数据结构新增字段
- **用户**: 访客登记表单新增一个选填字段
