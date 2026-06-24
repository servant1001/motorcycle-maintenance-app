<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { FuelInput, FuelRecord, FuelType } from '@/types/fuel'

const props = defineProps<{
  modelValue: boolean
  editingRecord?: FuelRecord | null
  vehicleOptions: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: FuelInput]
}>()

const fuelTypes: FuelType[] = ['92', '95', '98', 'diesel', 'electric', 'other']
const formRef = ref<FormInstance>()
const form = reactive<FuelInput>({
  vehicleId: '',
  date: '',
  mileage: 0,
  liters: 0,
  amount: 0,
  fuelType: '95',
  isFullTank: true,
  note: '',
})

const rules: FormRules<FuelInput> = {
  vehicleId: [{ required: true, message: '請選擇機車', trigger: 'change' }],
  date: [{ required: true, message: '請選擇日期', trigger: 'change' }],
  mileage: [{ required: true, message: '請輸入里程', trigger: 'change' }],
  liters: [{ required: true, message: '請輸入公升數', trigger: 'change' }],
  amount: [{ required: true, message: '請輸入金額', trigger: 'change' }],
}

function resetForm() {
  form.vehicleId = props.editingRecord?.vehicleId ?? props.vehicleOptions[0]?.value ?? ''
  form.date = props.editingRecord?.date ?? ''
  form.mileage = props.editingRecord?.mileage ?? 0
  form.liters = props.editingRecord?.liters ?? 0
  form.amount = props.editingRecord?.amount ?? 0
  form.fuelType = props.editingRecord?.fuelType ?? '95'
  form.isFullTank = props.editingRecord?.isFullTank ?? true
  form.note = props.editingRecord?.note ?? ''
}

watch(
  () => [props.modelValue, props.editingRecord, props.vehicleOptions],
  () => {
    resetForm()
    formRef.value?.clearValidate()
  },
  { immediate: true },
)

async function handleSubmit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  emit('submit', {
    ...form,
    mileage: Math.max(0, form.mileage),
    liters: Math.max(0, form.liters),
    amount: Math.max(0, form.amount),
  })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="editingRecord ? '編輯加油紀錄' : '新增加油紀錄'"
    width="560px"
    @close="emit('update:modelValue', false)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="機車" prop="vehicleId">
        <el-select v-model="form.vehicleId" placeholder="選擇機車">
          <el-option v-for="option in vehicleOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="日期" prop="date">
            <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="里程" prop="mileage">
            <el-input-number v-model="form.mileage" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="公升數" prop="liters">
            <el-input-number v-model="form.liters" :min="0" :step="0.1" :precision="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="金額" prop="amount">
            <el-input-number v-model="form.amount" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="油種">
            <el-select v-model="form.fuelType">
              <el-option v-for="item in fuelTypes" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="滿油">
            <el-switch v-model="form.isFullTank" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="備註">
        <el-input v-model="form.note" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="warning" @click="handleSubmit">儲存</el-button>
    </template>
  </el-dialog>
</template>
