<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { COMMON_MAINTENANCE_ITEMS } from '@/constants/reminders'
import type { MaintenanceInput, MaintenanceRecord } from '@/types/maintenance'

const props = defineProps<{
  modelValue: boolean
  editingRecord?: MaintenanceRecord | null
  vehicleOptions: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: MaintenanceInput]
}>()

const formRef = ref<FormInstance>()
const form = reactive<MaintenanceInput>({
  vehicleId: '',
  date: '',
  mileage: 0,
  item: '機油',
  cost: 0,
  shopName: '',
  note: '',
})

const rules: FormRules<MaintenanceInput> = {
  vehicleId: [{ required: true, message: '請選擇機車', trigger: 'change' }],
  date: [{ required: true, message: '請選擇日期', trigger: 'change' }],
  item: [{ required: true, message: '請選擇保養項目', trigger: 'change' }],
  mileage: [{ required: true, message: '請輸入里程', trigger: 'change' }],
  cost: [{ required: true, message: '請輸入金額', trigger: 'change' }],
}

function resetForm() {
  form.vehicleId = props.editingRecord?.vehicleId ?? props.vehicleOptions[0]?.value ?? ''
  form.date = props.editingRecord?.date ?? ''
  form.mileage = props.editingRecord?.mileage ?? 0
  form.item = props.editingRecord?.item ?? '機油'
  form.cost = props.editingRecord?.cost ?? 0
  form.shopName = props.editingRecord?.shopName ?? ''
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
  emit('submit', { ...form, mileage: Math.max(0, form.mileage), cost: Math.max(0, form.cost) })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="editingRecord ? '編輯保養紀錄' : '新增保養紀錄'"
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
          <el-form-item label="保養項目" prop="item">
            <el-select v-model="form.item">
              <el-option v-for="item in COMMON_MAINTENANCE_ITEMS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="里程" prop="mileage">
            <el-input-number v-model="form.mileage" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="金額" prop="cost">
            <el-input-number v-model="form.cost" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="店家">
        <el-input v-model="form.shopName" />
      </el-form-item>

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
