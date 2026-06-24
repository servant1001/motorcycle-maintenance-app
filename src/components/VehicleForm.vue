<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import VehicleImage from '@/components/VehicleImage.vue'
import { VEHICLE_FUEL_TYPE_OPTIONS, VEHICLE_TYPE_OPTIONS, isElectricVehicle } from '@/constants/vehicles'
import type { Vehicle, VehicleFuelType, VehicleInput } from '@/types/vehicle'

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
  vehicleType: 'motorcycle',
  plateNumber: '',
  brand: '',
  model: '',
  imageUrl: '',
  year: undefined,
  currentMileage: 0,
  fuelType: 'gasoline',
  note: '',
})

const rules: FormRules<VehicleInput> = {
  plateNumber: [{ required: true, message: '請輸入車牌號碼', trigger: 'blur' }],
  brand: [{ required: true, message: '請輸入品牌', trigger: 'blur' }],
  model: [{ required: true, message: '請輸入車型', trigger: 'blur' }],
  currentMileage: [{ required: true, message: '請輸入目前里程', trigger: 'change' }],
}

function getSuggestedFuelType(vehicleType: Vehicle['vehicleType']): VehicleFuelType {
  if (isElectricVehicle(vehicleType)) return 'electric'
  if (vehicleType === 'car') return 'gasoline'
  return 'gasoline'
}

function resetForm() {
  form.vehicleType = props.editingVehicle?.vehicleType ?? 'motorcycle'
  form.plateNumber = props.editingVehicle?.plateNumber ?? ''
  form.brand = props.editingVehicle?.brand ?? ''
  form.model = props.editingVehicle?.model ?? ''
  form.imageUrl = props.editingVehicle?.imageUrl ?? ''
  form.year = props.editingVehicle?.year
  form.currentMileage = props.editingVehicle?.currentMileage ?? 0
  form.fuelType = props.editingVehicle?.fuelType ?? getSuggestedFuelType(form.vehicleType)
  form.note = props.editingVehicle?.note ?? ''
}

watch(
  () => form.vehicleType,
  (nextType) => {
    if (isElectricVehicle(nextType)) {
      form.fuelType = 'electric'
      return
    }

    if (form.fuelType === 'electric') {
      form.fuelType = getSuggestedFuelType(nextType)
    }
  },
)

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
    :title="editingVehicle ? '編輯車輛' : '新增車輛'"
    width="560px"
    @close="emit('update:modelValue', false)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-form-item label="車輛類型">
            <el-select v-model="form.vehicleType">
              <el-option v-for="option in VEHICLE_TYPE_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="能源型態">
            <el-select v-model="form.fuelType">
              <el-option v-for="option in VEHICLE_FUEL_TYPE_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

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

      <el-form-item label="圖片連結">
        <el-input v-model="form.imageUrl" placeholder="https://example.com/vehicle.jpg" />
      </el-form-item>

      <div class="vehicle-preview">
        <VehicleImage :src="form.imageUrl" :alt="`${form.brand} ${form.model}`" variant="preview" />
      </div>

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

<style scoped>
.vehicle-preview {
  margin-bottom: 18px;
}
</style>
