import { useState } from 'react'
import ModalShell from './ModalShell'
import ModalFooter from './ModalFooter'
import FormRow from './FormRow'
import SearchableSelect from './SearchableSelect'
import SegmentedSelect from './SegmentedSelect'
import NumberInput from './NumberInput'
import DateInput from './DateInput'
import type { AllocationRow } from '../types'
import {
  allocationContentOptions,
  allocationTypeOptions,
  allocationMethodOptions
} from '../constants'

export interface AllocationModalProps {
  onClose: () => void
  onSubmit: (row: AllocationRow) => void
  initialData?: AllocationRow
}

export default function AllocationModal({
  onClose,
  onSubmit,
  initialData
}: AllocationModalProps) {
  const isEdit = !!initialData
  const [form, setForm] = useState<AllocationRow>(
    initialData || {
      id: '',
      allocationContent: '',
      allocationType: '',
      allocationDesc: '',
      allocationAmount: '',
      allocationMethod: '月',
      allocationPeriod: '12',
      allocationStartDate: ''
    }
  )

  const handleMethodChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      allocationMethod: v,
      allocationPeriod: v === '一次性' ? '1' : prev.allocationPeriod
    }))
  }

  return (
    <ModalShell title={isEdit ? '分摊修改' : '分摊新增'} onClose={onClose}>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <FormRow label="分摊内容" required>
          <SearchableSelect
            value={form.allocationContent}
            onChange={(v) => setForm({ ...form, allocationContent: v })}
            options={allocationContentOptions}
          />
        </FormRow>
        <FormRow label="分摊类型" required>
          <SearchableSelect
            value={form.allocationType}
            onChange={(v) => setForm({ ...form, allocationType: v })}
            options={allocationTypeOptions}
          />
        </FormRow>
        <div className="col-span-2">
          <label className="block text-sm text-gray-700 mb-1">
            分摊描述
          </label>
          <textarea
            value={form.allocationDesc}
            onChange={(e) => {
              const v = e.target.value
              if (v.length <= 512) {
                setForm({ ...form, allocationDesc: v })
              }
            }}
            placeholder="请输入分摊描述（最多512字）"
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
          />
          <div className="text-xs text-gray-400 mt-1">{form.allocationDesc.length}/512</div>
        </div>
        <FormRow label="分摊金额(元,含税)" required>
          <NumberInput
            value={form.allocationAmount}
            onChange={(v) => setForm({ ...form, allocationAmount: v })}
            placeholder="请输入金额"
          />
        </FormRow>
        <FormRow label="分摊方式" required>
          <SegmentedSelect
            value={form.allocationMethod}
            onChange={handleMethodChange}
            options={allocationMethodOptions}
          />
        </FormRow>
        <FormRow label="分摊周期" required>
          <NumberInput
            value={form.allocationPeriod}
            onChange={(v) => setForm({ ...form, allocationPeriod: v })}
            placeholder={form.allocationMethod === '一次性' ? '固定为1' : '请输入周期'}
            disabled={form.allocationMethod === '一次性'}
          />
        </FormRow>
        <FormRow label="分摊开始时间" required>
          <DateInput
            value={form.allocationStartDate}
            onChange={(v) => setForm({ ...form, allocationStartDate: v })}
          />
        </FormRow>
      </div>

      <ModalFooter
        onCancel={onClose}
        onSubmit={() => {
          if (!form.allocationContent || !form.allocationType || !form.allocationAmount) {
            alert('请填写必填项')
            return
          }
          if (!form.allocationMethod) {
            alert('请选择分摊方式')
            return
          }
          if (!form.allocationPeriod) {
            alert('请填写分摊周期')
            return
          }
          if (!form.allocationStartDate) {
            alert('请填写分摊开始时间')
            return
          }
          onSubmit({
            ...form,
            id: isEdit ? form.id : 'alloc-' + Date.now()
          })
        }}
      />
    </ModalShell>
  )
}
