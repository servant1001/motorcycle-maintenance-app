<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Vehicle, VehicleInput } from '@/types/vehicle'

const props = defineProps<{
  modelValue: boolean
  editingVehicle?: Vehicle | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: VehicleInput]
}>()

const formRef = ref<FormInstance>()
const form = reactive<VehicleInput>({
  plateNumber: '',
  brand: '',
  model: '',
  year: undefined,
  currentMileage: 0,
  note: '',
})

const rules: FormRules<VehicleInput> = {
  plateNumber: [{ required: true, message: '請輸入車牌', trigger: 'blur' }],
  brand: [{ required: true, message: '請輸入品牌', trigger: 'blur' }],
  model: [{ required: true, message: '請輸入車型', trigger: 'blur' }],
  currentMileage: [{ required: true, message: '請輸入目前里程', trigger: 'change' }],
}

function resetForm() {
  form.plateNumber = props.editingVehicle?.plateNumber ?? ''
  form.brand = props.editingVehicle?.brand ?? ''
  form.model = props.editingVehicle?.model ?? ''
  form.year = props.editingVehicle?.year
  form.currentMileage = props.editingVehicle?.currentMileage ?? 0
  form.note = props.editingVehicle?.note ?? ''
}

watch(
  () => [props.modelValue, props.editingVehicle],
  () => {
    resetForm()
    formRef.value?.clearValidate()
  },
  { immediate: true },
)

async function handleSubmit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  emit('submit', { ...form, currentMileage: Math.max(0, form.currentMileage) })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="editingVehicle ? '編輯機車' : '新增機車'"
    width="520px"
    @close="emit('update:modelValue', false)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="車牌" prop="plateNumber">
            <el-input v-model="form.plateNumber" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="品牌" prop="brand">
            <el-input v-model="form.brand" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="車型" prop="model">
            <el-input v-model="form.model" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="年份">
            <el-input-number v-model="form.year" :min="1900" :max="2100" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="目前里程" prop="currentMileage">
        <el-input-number v-model="form.currentMileage" :min="0" style="width: 100%" />
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
