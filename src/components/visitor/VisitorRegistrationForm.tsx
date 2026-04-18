import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { addVisitor } from '@/utils/storage'
import type { VisitorInput } from '@/types'

interface FormErrors {
  name?: string
  phone?: string
  purpose?: string
  personToVisit?: string
}

// 获取当前日期时间的本地格式字符串（用于 datetime-local input）
function getLocalDateTimeString(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const localDate = new Date(now.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export function VisitorRegistrationForm() {
  const [formData, setFormData] = useState<VisitorInput>({
    name: '',
    phone: '',
    company: '',
    purpose: '',
    personToVisit: '',
    visitTime: getLocalDateTimeString(),
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 验证手机号码（中国大陆手机号，11位数字，以1开头）
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 验证姓名
    if (!formData.name.trim()) {
      newErrors.name = '访客姓名不能为空'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '访客姓名至少需要2个字符'
    }

    // 验证手机号
    if (!formData.phone.trim()) {
      newErrors.phone = '手机号码不能为空'
    } else if (!validatePhone(formData.phone.trim())) {
      newErrors.phone = '请输入有效的手机号码'
    }

    // 验证来访目的
    if (!formData.purpose.trim()) {
      newErrors.purpose = '请填写来访目的'
    }

    // 验证被访人员
    if (!formData.personToVisit.trim()) {
      newErrors.personToVisit = '请填写被访人员'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleChange = (field: keyof VisitorInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除该字段的错误
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      company: '',
      purpose: '',
      personToVisit: '',
      visitTime: getLocalDateTimeString(),
      notes: '',
    })
    setErrors({})
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // 转换 visitTime 为 ISO 格式
      const visitorData: VisitorInput = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        purpose: formData.purpose.trim(),
        personToVisit: formData.personToVisit.trim(),
        visitTime: new Date(formData.visitTime).toISOString(),
        notes: formData.notes.trim(),
      }

      addVisitor(visitorData)

      toast({
        title: '访客登记成功',
        description: `${formData.name} 的访客信息已成功登记`,
        variant: 'success',
      })

      resetForm()
    } catch {
      toast({
        title: '登记失败',
        description: '保存数据时发生错误，请重试',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>访客登记</CardTitle>
        <CardDescription>请填写访客信息，带 * 号的为必填项</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 访客姓名 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                访客姓名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="请输入访客姓名"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* 手机号码 */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                手机号码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="请输入11位手机号码"
                maxLength={11}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* 公司/组织 */}
            <div className="space-y-2">
              <Label htmlFor="company">公司/组织</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="请输入公司或组织名称（选填）"
              />
            </div>

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

            {/* 来访目的 */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="purpose">
                来访目的 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                placeholder="请输入来访目的"
                className={errors.purpose ? 'border-destructive' : ''}
              />
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose}</p>
              )}
            </div>

            {/* 备注 */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="请输入其他需要备注的信息（选填）"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              重置
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '提交登记'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
