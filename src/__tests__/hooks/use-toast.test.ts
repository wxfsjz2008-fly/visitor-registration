import { describe, it, expect, vi } from 'vitest'
import { reducer } from '@/hooks/use-toast'
import type { Action } from '@/hooks/use-toast'

describe('use-toast reducer', () => {
  const initialState = { toasts: [] }

  describe('ADD_TOAST', () => {
    it('应添加 toast 到列表头部', () => {
      const action: Action = {
        type: 'ADD_TOAST',
        toast: { id: '1', open: true },
      }
      const state = reducer(initialState, action)
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('1')
    })

    it('应限制 toast 数量为 1（TOAST_LIMIT）', () => {
      const stateWithOne = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', open: true },
      })
      const state = reducer(stateWithOne, {
        type: 'ADD_TOAST',
        toast: { id: '2', open: true },
      })
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('2')
    })
  })

  describe('UPDATE_TOAST', () => {
    it('应更新指定 toast', () => {
      const stateWithToast = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', open: true, title: '原始标题' },
      })
      const state = reducer(stateWithToast, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: '更新标题' },
      })
      expect(state.toasts[0].title).toBe('更新标题')
    })

    it('更新不存在的 toast 不应报错', () => {
      const state = reducer(initialState, {
        type: 'UPDATE_TOAST',
        toast: { id: 'non-existent', title: '测试' },
      })
      expect(state.toasts).toHaveLength(0)
    })
  })

  describe('DISMISS_TOAST', () => {
    it('应将指定 toast 的 open 设为 false', () => {
      const stateWithToast = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', open: true },
      })
      const state = reducer(stateWithToast, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      })
      expect(state.toasts[0].open).toBe(false)
    })

    it('不传 toastId 应关闭所有 toast', () => {
      const state = { toasts: [
        { id: '1', open: true },
        { id: '2', open: true },
      ] }
      // 逐个添加后测试 dismiss 所有
      const result = reducer(state as any, {
        type: 'DISMISS_TOAST',
        toastId: undefined,
      })
      result.toasts.forEach(t => {
        expect(t.open).toBe(false)
      })
    })
  })

  describe('REMOVE_TOAST', () => {
    it('应移除指定 toast', () => {
      const stateWithToast = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', open: true },
      })
      const state = reducer(stateWithToast, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      })
      expect(state.toasts).toHaveLength(0)
    })

    it('不传 toastId 应清空所有 toast', () => {
      const state = { toasts: [{ id: '1', open: true }, { id: '2', open: true }] }
      const result = reducer(state as any, {
        type: 'REMOVE_TOAST',
        toastId: undefined,
      })
      expect(result.toasts).toHaveLength(0)
    })

    it('移除不存在的 toast 不应影响其他', () => {
      const stateWithToast = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', open: true },
      })
      const state = reducer(stateWithToast, {
        type: 'REMOVE_TOAST',
        toastId: 'non-existent',
      })
      expect(state.toasts).toHaveLength(1)
    })
  })
})
