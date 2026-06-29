<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getFirebaseSetupHint, useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const form = reactive({
  email: '',
  password: '',
  displayName: '',
})

const firebaseSetupHint = getFirebaseSetupHint()

async function handleSubmit() {
  try {
    if (mode.value === 'login') {
      await authStore.login(form.email, form.password)
    } else {
      await authStore.register(form.email, form.password, form.displayName)
    }
    ElMessage.success(mode.value === 'login' ? '登入成功' : '註冊成功')
    await router.push(String(route.query.redirect || '/'))
  } catch {
    ElMessage.error(authStore.error || '操作失敗')
  }
}

async function handleGoogleLogin() {
  try {
    await authStore.loginWithGoogle()
    ElMessage.success('Google 登入成功')
    await router.push(String(route.query.redirect || '/'))
  } catch {
    ElMessage.error(authStore.error || 'Google 登入失敗')
  }
}
</script>

<template>
  <div class="login-view">
    <section class="login-shell">
      <article class="login-showcase dark-surface">
        <div class="login-showcase__header">
          <el-tag effect="dark" round class="login-showcase__tag">DriveOne Mobility OS</el-tag>
          <h1>優雅駕馭，智慧管理</h1>
          <p>
            把保養、維修、能源補給、保險與里程資料收進同一個介面。
            不論是汽車、機車、電動機車還是電動汽車，都能用同一套流程整理。
          </p>
        </div>

        <div class="login-showcase__vehicle">
          <div class="vehicle-card">
            <div class="vehicle-card__top">
              <div>
                <p class="eyebrow">DriveOne Preview</p>
                <h2>Tesla Model 3</h2>
                <span>EVA-1024</span>
              </div>
              <div class="vehicle-card__icon">
                <el-icon><Van /></el-icon>
              </div>
            </div>

            <div class="vehicle-card__grid">
              <div>
                <small>目前里程</small>
                <strong>25,800 km</strong>
              </div>
              <div>
                <small>平均效率</small>
                <strong>6.2 km/kWh</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="login-showcase__features">
          <div class="feature-card">
            <el-icon><Tools /></el-icon>
            <div>
              <strong>保養提醒</strong>
              <span>機油剩餘 200 km，輪胎與煞車狀態一眼就能掌握。</span>
            </div>
          </div>
          <div class="feature-card">
            <el-icon><Coin /></el-icon>
            <div>
              <strong>能源追蹤</strong>
              <span>支援加油與充電紀錄，直接比較花費與效率表現。</span>
            </div>
          </div>
          <div class="feature-card">
            <el-icon><DataBoard /></el-icon>
            <div>
              <strong>行動化儀表板</strong>
              <span>不是傳統後台，而是更貼近日常使用的車輛管理 App。</span>
            </div>
          </div>
        </div>
      </article>

      <section class="login-panel app-surface">
        <div class="login-panel__header">
          <div class="login-brand-image-wrap">
            <img
              class="login-brand-image"
              src="/driveone-login-brand.png"
              alt="DriveOne 優雅駕馭，智慧管理"
            />
          </div>
          <p class="eyebrow">Sign In</p>
          <h2>{{ mode === 'login' ? '登入' : '建立 DriveOne 帳號' }}</h2>
          <p class="section-subtitle">
            {{ mode === 'login' ? '登入後立即查看車況、保養與花費摘要。' : '先建立帳號，開始管理你的每一台車輛。' }}
          </p>
        </div>

        <el-alert v-if="firebaseSetupHint" :closable="false" type="warning" :title="firebaseSetupHint" show-icon />

        <el-radio-group v-model="mode" size="large" class="mode-switch">
          <el-radio-button label="login">登入</el-radio-button>
          <el-radio-button label="register">註冊</el-radio-button>
        </el-radio-group>

        <el-form label-position="top" class="login-form" @submit.prevent="handleSubmit">
          <el-form-item v-if="mode === 'register'" label="顯示名稱">
            <el-input v-model="form.displayName" placeholder="例如 Ryan" size="large" />
          </el-form-item>
          <el-form-item label="Email">
            <el-input v-model="form.email" type="email" placeholder="you@example.com" size="large" />
          </el-form-item>
          <el-form-item label="密碼">
            <el-input v-model="form.password" type="password" show-password placeholder="至少 6 碼" size="large" />
          </el-form-item>

          <el-button type="primary" class="primary-cta login-submit" :loading="authStore.loading" @click="handleSubmit">
            {{ mode === 'login' ? '登入帳號' : '建立帳號' }}
          </el-button>

          <div class="login-divider">
            <span>或使用第三方登入</span>
          </div>

          <el-button plain class="secondary-cta login-google" :loading="authStore.loading" @click="handleGoogleLogin">
            <el-icon><Promotion /></el-icon>
            使用 Google 帳號登入
          </el-button>
        </el-form>

        <div class="login-footnote">
          <span><el-icon><CircleCheck /></el-icon> Firebase 驗證保護登入流程</span>
          <span><el-icon><Lock /></el-icon> 資料依使用者 uid 分流儲存</span>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.login-shell {
  width: min(1180px, 100%);
  display: grid;
  gap: 16px;
}

.login-panel {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-radius: 28px;
}

.login-panel__header h2 {
  margin: 8px 0 0;
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.login-showcase {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-brand-image-wrap {
  padding: 12px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.login-brand-image {
  width: 100%;
  display: block;
  border-radius: 22px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.96);
}

.login-showcase__header h1 {
  margin: 20px 0 0;
  font-size: clamp(20px, 6vw, 44px);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.login-showcase__header p {
  margin: 34px 0 0;
  max-width: 560px;
  color: rgba(255, 255, 255, 0.76);
}

.login-showcase__tag {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: white;
}

.mode-switch {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 52px;
  border-radius: 18px;
  box-shadow: none;
  background: #f8fafc;
}

.login-form :deep(.el-form-item__label) {
  color: var(--ds-text);
  font-weight: 600;
}

.login-submit,
.login-google {
  width: 100%;
}

.login-google {
  min-height: 48px;
  justify-content: center;
}

.login-showcase__vehicle {
  display: flex;
}

.vehicle-card {
  width: 100%;
  margin: 20px 0;
  padding: 18px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vehicle-card__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.vehicle-card__top h2 {
  margin: 6px 0 0;
  font-size: 28px;
}

.vehicle-card__top span {
  display: block;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.72);
}

.vehicle-card__icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 26px;
}

.vehicle-card__grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.vehicle-card__grid div {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
}

.vehicle-card__grid small {
  color: rgba(255, 255, 255, 0.72);
}

.vehicle-card__grid strong {
  display: block;
  margin-top: 6px;
  font-size: 20px;
}

.login-showcase__features {
  display: grid;
  gap: 12px;
}

.feature-card {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
}

.feature-card .el-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.12);
}

.feature-card strong,
.feature-card span {
  display: block;
}

.feature-card span {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}

.login-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
  color: var(--ds-text-soft);
  font-size: 13px;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(148, 163, 184, 0.35);
}

.login-footnote {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--ds-text-soft);
  font-size: 13px;
}

.login-footnote span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

@media (min-width: 961px) {
  .login-shell {
    grid-template-columns: 1.08fr 0.92fr;
    align-items: stretch;
  }

  .login-panel {
    padding: 32px 28px;
    justify-content: center;
  }

  .login-showcase {
    padding: 34px 32px;
  }
}

@media (max-width: 640px) {
  .login-view {
    padding: 12px;
  }

  .login-panel {
    padding: 20px 16px;
  }

  .login-showcase {
    padding: 20px 16px;
  }

  .vehicle-card__grid {
    grid-template-columns: 1fr;
  }

  .login-brand-image-wrap {
    padding: 8px;
    border-radius: 22px;
  }

  .login-brand-image {
    border-radius: 16px;
  }
}
</style>
