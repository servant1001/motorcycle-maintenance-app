<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  variant?: 'hero' | 'card' | 'thumb' | 'preview'
}>(), {
  src: '',
  alt: 'vehicle image',
  variant: 'card',
})

const hasError = ref(false)

watch(
  () => props.src,
  () => {
    hasError.value = false
  },
  { immediate: true },
)

const hasImage = computed(() => Boolean(props.src) && !hasError.value)
</script>

<template>
  <div class="vehicle-image" :class="`vehicle-image--${variant}`">
    <img v-if="hasImage" :src="src" :alt="alt" class="vehicle-image__img" @error="hasError = true" />
    <div v-else class="vehicle-image__placeholder">
      <div class="vehicle-image__badge">
        <el-icon><Van /></el-icon>
      </div>
      <strong>暫無圖片</strong>
      <span>新增圖片連結後會顯示車輛照片</span>
    </div>
  </div>
</template>

<style scoped>
.vehicle-image {
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.14), transparent 24%),
    linear-gradient(180deg, #f8fafc, #eef2f7);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.vehicle-image--hero {
  height: 220px;
  border-radius: 24px;
}

.vehicle-image--card {
  height: 180px;
}

.vehicle-image--thumb {
  width: 82px;
  height: 56px;
  border-radius: 14px;
}

.vehicle-image--preview {
  height: 180px;
}

.vehicle-image__img,
.vehicle-image__placeholder {
  width: 100%;
  height: 100%;
}

.vehicle-image__img {
  display: block;
  object-fit: contain;
  padding: 12px;
}

.vehicle-image--thumb .vehicle-image__img {
  padding: 6px;
}

.vehicle-image__placeholder {
  display: grid;
  place-items: center;
  text-align: center;
  gap: 6px;
  padding: 16px;
  color: var(--ds-text-soft);
}

.vehicle-image__placeholder strong {
  font-size: 14px;
  color: var(--ds-text);
}

.vehicle-image__placeholder span {
  font-size: 12px;
  max-width: 180px;
}

.vehicle-image__badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(64, 158, 255, 0.12);
  color: var(--ds-primary-deep);
  font-size: 24px;
}

.vehicle-image--thumb .vehicle-image__placeholder {
  padding: 6px;
}

.vehicle-image--thumb .vehicle-image__placeholder strong,
.vehicle-image--thumb .vehicle-image__placeholder span {
  display: none;
}

.vehicle-image--thumb .vehicle-image__badge {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  font-size: 14px;
}
</style>
