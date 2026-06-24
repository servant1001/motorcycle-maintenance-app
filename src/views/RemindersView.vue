<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ReminderCard from '@/components/ReminderCard.vue'
import { useReminderStore } from '@/stores/reminderStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { MaintenanceRule, MaintenanceRuleInput } from '@/types/reminder'

const reminderStore = useReminderStore()
const vehicleStore = useVehicleStore()
const dialogVisible = ref(false)
const editingRule = ref<MaintenanceRule | null>(null)

const form = reactive<MaintenanceRuleInput>({
  vehicleId: '',
  item: '',
  intervalKm: 1000,
  lastMileage: 0,
  nextMileage: 1000,
  isEnabled: true,
})

const currentRules = computed(() => reminderStore.activeVehicleRules)

function resetForm() {
  form.vehicleId = editingRule.value?.vehicleId ?? vehicleStore.activeVehicleId ?? vehicleStore.vehicleOptions[0]?.value ?? ''
  form.item = editingRule.value?.item ?? ''
  form.intervalKm = editingRule.value?.intervalKm ?? 1000
  form.lastMileage = editingRule.value?.lastMileage ?? vehicleStore.activeVehicle?.currentMileage ?? 0
  form.nextMileage = editingRule.value?.nextMileage ?? form.lastMileage + form.intervalKm
  form.isEnabled = editingRule.value?.isEnabled ?? true
}

function openCreate() {
  editingRule.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(rule: MaintenanceRule) {
  editingRule.value = rule
  resetForm()
  dialogVisible.value = true
}

async function saveRule() {
  if (!form.vehicleId || !form.item) {
    ElMessage.warning('請完整填寫提醒規則')
    return
  }
  if (editingRule.value) {
    await reminderStore.update(editingRule.value.id, { ...form })
    ElMessage.success('提醒規則已更新')
  } else {
    await reminderStore.create({ ...form })
    ElMessage.success('提醒規則已新增')
  }
  dialogVisible.value = false
}

async function removeRule(rule: MaintenanceRule) {
  await ElMessageBox.confirm(`確定刪除提醒項目 ${rule.item} 嗎？`, '刪除確認', { type: 'warning' })
  await reminderStore.remove(rule.id)
  ElMessage.success('提醒規則已刪除')
}

onMounted(async () => {
  await vehicleStore.fetchAll()
  await reminderStore.fetchAll()
})
</script>

<template>
  <section class="page-shell section-stack">
    <div class="page-header">
      <div>
        <h1>保養提醒</h1>
        <p>依照里程設定規則，掌握即將到期或已超過的項目。</p>
      </div>
      <el-button type="warning" class="primary-cta" :disabled="!vehicleStore.activeVehicleId" @click="openCreate">新增提醒規則</el-button>
    </div>

    <div v-if="!vehicleStore.activeVehicleId">
      <el-empty description="請先新增機車並設定主要車輛" />
    </div>

    <div v-else class="section-stack">
      <div class="grid-cards">
        <ReminderCard v-for="reminder in reminderStore.activeVehicleSummaries" :key="reminder.id" :reminder="reminder" />
      </div>

      <el-table :data="currentRules" class="glass-card desktop-table" stripe>
        <el-table-column label="項目" prop="item" min-width="120" />
        <el-table-column label="週期" prop="intervalKm" min-width="110" />
        <el-table-column label="上次里程" prop="lastMileage" min-width="110" />
        <el-table-column label="下次里程" prop="nextMileage" min-width="110" />
        <el-table-column label="啟用" min-width="90">
          <template #default="{ row }">
            <el-switch :model-value="row.isEnabled" @change="reminderStore.update(row.id, { ...row, isEnabled: !row.isEnabled })" />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="170" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">編輯</el-button>
            <el-button size="small" type="danger" plain @click="removeRule(row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingRule ? '編輯提醒規則' : '新增提醒規則'" width="520px">
      <el-form label-position="top">
        <el-form-item label="機車">
          <el-select v-model="form.vehicleId">
            <el-option v-for="option in vehicleStore.vehicleOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="項目">
          <el-input v-model="form.item" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-form-item label="週期公里數">
              <el-input-number v-model="form.intervalKm" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="上次里程">
              <el-input-number v-model="form.lastMileage" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="下次里程">
          <el-input-number v-model="form.nextMileage" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="啟用">
          <el-switch v-model="form.isEnabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="warning" @click="saveRule">儲存</el-button>
      </template>
    </el-dialog>
  </section>
</template>
