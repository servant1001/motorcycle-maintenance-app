<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { InsuranceInput, InsuranceRecord } from '@/types/insurance'

const props = defineProps<{
  modelValue: boolean
  editingRecord?: InsuranceRecord | null
  vehicleOptions: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: InsuranceInput]
}>()

const formRef = ref<FormInstance>()
const form = reactive<InsuranceInput>({
  vehicleId: '',
  insuranceType: '強制險',
  companyName: '',
  policyNumber: '',
  startDate: '',
  endDate: '',
  premium: 0,
  coverageAmount: 0,
  contactPhone: '',
  note: '',
})

const rules: FormRules<InsuranceInput> = {
  vehicleId: [{ required: true, message: '請選擇車輛', trigger: 'change' }],
  insuranceType: [{ required: true, message: '請輸入保險類型', trigger: 'blur' }],
  companyName: [{ required: true, message: '請輸入保險公司', trigger: 'blur' }],
  policyNumber: [{ required: true, message: '請輸入保單號碼', trigger: 'blur' }],
  startDate: [{ required: true, message: '請選擇開始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '請選擇到期日期', trigger: 'change' }],
  premium: [{ required: true, message: '請輸入保費', trigger: 'change' }],
}

function resetForm() {
  form.vehicleId = props.editingRecord?.vehicleId ?? props.vehicleOptions[0]?.value ?? ''
  form.insuranceType = props.editingRecord?.insuranceType ?? '強制險'
  form.companyName = props.editingRecord?.companyName ?? ''
  form.policyNumber = props.editingRecord?.policyNumber ?? ''
  form.startDate = props.editingRecord?.startDate ?? ''
  form.endDate = props.editingRecord?.endDate ?? ''
  form.premium = props.editingRecord?.premium ?? 0
  form.coverageAmount = props.editingRecord?.coverageAmount ?? 0
  form.contactPhone = props.editingRecord?.contactPhone ?? ''
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
    premium: Math.max(0, form.premium),
    coverageAmount: Math.max(0, form.coverageAmount),
  })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="editingRecord ? '編輯保險紀錄' : '新增保險紀錄'"
    width="580px"
    @close="emit('update:modelValue', false)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="車輛" prop="vehicleId">
        <el-select v-model="form.vehicleId">
          <el-option v-for="option in vehicleOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="保險類型" prop="insuranceType">
            <el-input v-model="form.insuranceType" placeholder="例如：強制險、第三責任險" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="保險公司" prop="companyName">
            <el-input v-model="form.companyName" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="保單號碼" prop="policyNumber">
            <el-input v-model="form.policyNumber" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="聯絡電話">
            <el-input v-model="form.contactPhone" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="保險開始日期" prop="startDate">
            <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="保險到期日期" prop="endDate">
            <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="保費金額" prop="premium">
            <el-input-number v-model="form.premium" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="保障額度">
            <el-input-number v-model="form.coverageAmount" :min="0" style="width: 100%" />
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
