<script setup lang="ts">
import AIHealthRing from './AIHealthRing.vue'

defineProps<{
  title: string
  subtitle: string
  mileageText: string
  healthScore: number
  maintenanceCount: number
  insuranceCount: number
  repairCount: number
  fuelCount: number
}>()
</script>

<template>
  <section class="ai-hero-card">
    <div class="ai-hero-card__content">
      <div class="ai-hero-card__text">
        <p class="eyebrow">目前車輛</p>
        <h3>{{ title }}</h3>
        <p class="ai-hero-card__subtitle">{{ subtitle }}</p>
        <div class="ai-hero-card__meta">
          <div class="ai-hero-card__mileage">{{ mileageText }}</div>
          <div class="ai-hero-card__score">健康分數</div>
        </div>
      </div>

      <AIHealthRing :score="healthScore" />
    </div>

    <div class="ai-hero-card__stats">
      <div class="ai-hero-card__stat">
        <strong>{{ maintenanceCount }}</strong>
        <span>保養紀錄</span>
      </div>
      <div class="ai-hero-card__stat">
        <strong>{{ repairCount }}</strong>
        <span>維修紀錄</span>
      </div>
      <div class="ai-hero-card__stat">
        <strong>{{ insuranceCount }}</strong>
        <span>保險資料</span>
      </div>
      <div class="ai-hero-card__stat">
        <strong>{{ fuelCount }}</strong>
        <span>能源紀錄</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai-hero-card {
  padding: 14px 16px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.16), transparent 28%),
    linear-gradient(160deg, #ffffff 0%, #f3f8ff 46%, #eef3f8 100%);
  border: 1px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-hero-card__content {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.ai-hero-card__text h3 {
  margin: 4px 0 0;
  font-size: 21px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.ai-hero-card__subtitle {
  margin: 4px 0 0;
  color: var(--ds-text-soft);
  line-height: 1.45;
  font-size: 13px;
}

.ai-hero-card__meta {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-hero-card__mileage {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.05);
  font-weight: 700;
  font-size: 13px;
}

.ai-hero-card__score {
  font-size: 12px;
  color: var(--ds-text-soft);
}

.ai-hero-card__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(72px, 1fr));
  gap: 10px;
}

.ai-hero-card__stat {
  padding: 10px 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.14);
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
}

.ai-hero-card__stat strong {
  font-size: 18px;
  line-height: 1;
}

.ai-hero-card__stat span {
  color: var(--ds-text-soft);
  font-size: 11px;
}

@media (max-width: 640px) {
  .ai-hero-card__content {
    align-items: flex-start;
  }

  .ai-hero-card__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
