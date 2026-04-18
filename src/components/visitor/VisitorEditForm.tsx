import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { Visitor } from '@/types'

interface VisitorEditFormProps {
  visitor: Visitor
  onSave: (visitor: Visitor) => void
  onCancel: () => void
}

interface FormErrors {
  name?: string
  phone?: string
  purpose?: string
  personToVisit?: string
}

// 将 ISO 日期时间转换为本地格式
function toLocalDateTime(isoString: string): string {
  const date = new Date(isoString)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export function VisitorEditForm({ visitor, onSave, onCancel }: VisitorEditFormProps) {
  const [formData, setFormData] = useState({
    name: visitor.name,
    phone: visitor.phone,
    company: visitor.company,
    purpose: visitor.purpose,
    personToVisit: visitor.personToVisit,
    visitTime: toLocalDateTime(visitor.visitTime),
    notes: visitor.notes,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 验证手机号码
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '访客姓名不能为空'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '访客姓名至少需要2个字符'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '手机号码不能为空'
    } else if (!validatePhone(formData.phone.trim())) {
      newErrors.phone = '请输入有效的手机号码'
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = '请填写来访目的'
    }

    if (!formData.personToVisit.trim()) {
      newErrors.personToVisit = '请填写被访人员'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const updatedVisitor: Visitor = {
        ...visitor,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        purpose: formData.purpose.trim(),
        personToVisit: formData.personToVisit.trim(),
        visitTime: new Date(formData.visitTime).toISOString(),
        notes: formData.notes.trim(),
      }

      onSave(updatedVisitor)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>编辑访客信息</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* 访客姓名 */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              访客姓名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* 手机号码 */}
          <div className="space-y-2">
            <Label htmlFor="edit-phone">
              手机号码 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              maxLength={11}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* 公司/组织 */}
          <div className="space-y-2">
            <Label htmlFor="edit-company">公司/组织</Label>
            <Input
              id="edit-company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>

          {/* 被访人员 */}
          <div className="space-y-2">
            <Label htmlFor="edit-personToVisit">
              被访人员 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-personToVisit"
              value={formData.personToVisit}
              onChange={(e) => handleChange('personToVisit', e.target.value)}
              className={errors.personToVisit ? 'border-destructive' : ''}
            />
            {errors.personToVisit && (
              <p className="text-sm text-destructive">{errors.personToVisit}</p>
            )}
          </div>

          {/* 来访时间 */}
          <div className="space-y-2">
            <Label htmlFor="edit-visitTime">来访时间</Label>
            <Input
              id="edit-visitTime"
              type="datetime-local"
              value={formData.visitTime}
              onChange={(e) => handleChange('visitTime', e.target.value)}
            />
          </div>

          {/* 来访目的 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-purpose">
              来访目的 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-purpose"
              value={formData.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              className={errors.purpose ? 'border-destructive' : ''}
            />
            {errors.purpose && (
              <p className="text-sm text-destructive">{errors.purpose}</p>
            )}
          </div>

          {/* 备注 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-notes">备注</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
