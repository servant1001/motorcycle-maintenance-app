# AGENTS

## Project Overview

DriveOne 汽機車生活管理平台是一個以 `Vue 3 + TypeScript + Firebase Realtime Database` 建立的 vehicle-based 車輛管理系統，已從原本的 motorcycle-only 架構擴充為可同時支援：

- `motorcycle`
- `car`
- `electric_motorcycle`
- `electric_car`

所有保養、維修、能源、保險與提醒資料皆透過 `vehicleId` 關聯，並採用 Mobile First 的 Tesla / Gogoro 風格 UI。

## Repositories / Paths

主前端專案：

- `C:\Users\serva\Desktop\motorcycle-maintenance-app`

AI 與油價 Cloudflare Worker 專案：

- `C:\Users\serva\Desktop\driveone-gas-price-worker`

## Core Features

- Firebase Email / Password 登入
- Firebase Google 登入
- 車輛 CRUD
- 保養紀錄 CRUD
- 維修紀錄 CRUD
- 能源紀錄 CRUD
- 保險管理 CRUD
- 保養提醒
- 保險到期提醒
- Dashboard 儀表板
- 統計分析頁
- DriveOne AI 車輛顧問
- Tesla / Gogoro 風格 RWD 介面

## Tech Stack

### Frontend

- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
- Firebase Authentication
- Firebase Realtime Database
- dayjs
- ECharts

### Backend / Edge

- Cloudflare Workers
- Wrangler
- Gemini API

## Source Layout

### Frontend

- `src/components`
  - 共用 UI 元件、表單 Dialog、卡片、AI 元件
  - 重要元件：
    - `AppLayout.vue`
    - `VehicleImage.vue`
    - `components/ai/AIChatWindow.vue`
    - `components/ai/AIAssistantFab.vue`
- `src/views`
  - 頁面元件：
    - `LoginView.vue`
    - `DashboardView.vue`
    - `VehiclesView.vue`
    - `MaintenanceView.vue`
    - `RepairsView.vue`
    - `FuelView.vue`
    - `InsuranceView.vue`
    - `RemindersView.vue`
    - `StatisticsView.vue`
    - `AIChatView.vue`
- `src/stores`
  - Pinia stores，負責資料讀寫與頁面狀態
- `src/services`
  - Firebase 與 API 串接
- `src/types`
  - TypeScript 型別
- `src/constants`
  - 車種、能源、保養項目與預設規則
- `src/utils`
  - 格式化、保險、油耗等計算邏輯
- `src/design-system.css`
  - 全站設計系統

### Worker

- `src/index.ts`
  - API 入口
- `src/routes/ai.ts`
  - AI 顧問路由
- `src/routes/gas.ts`
  - 油價 / 匯率資料路由
- `src/services/gemini.ts`
  - Gemini 呼叫封裝
- `src/services/prompt.ts`
  - AI 提示詞摘要邏輯
- `src/services/maintenanceAdvisor.ts`
  - 保養問題的規則式短回答

## Domain Model Rules

### Vehicles

`vehicles` 資料結構核心欄位：

- `vehicleType`
  - `motorcycle`
  - `car`
  - `electric_motorcycle`
  - `electric_car`
- `fuelType`
  - `gasoline`
  - `diesel`
  - `hybrid`
  - `electric`
- 其他欄位
  - `plateNumber`
  - `brand`
  - `model`
  - `year`
  - `currentMileage`
  - `imageUrl`
  - `note`

### Maintenance Items

保養項目需依 `vehicleType` 區分：

- 機車
  - 機油
  - 齒輪油
  - 空濾
  - 火星塞
  - 煞車皮
  - 前輪胎
  - 後輪胎
  - 皮帶
- 汽車
  - 機油
  - 機油芯
  - 空氣濾芯
  - 冷氣濾網
  - 變速箱油
  - 煞車油
  - 水箱水
  - 火星塞
  - 輪胎
  - 電瓶

### Energy Records

- 燃油車顯示加油紀錄
- 電動車顯示充電紀錄
- 效率單位需依車種切換
  - 燃油車：`km/L`
  - 電動車：`km/kWh`

### Insurance Records

保險資料路徑：

- `/users/{uid}/insuranceRecords/{insuranceId}`

提醒規則：

- 到期前 30 天顯示提醒
- 已過期顯示紅色警示

## Firebase Data Paths

所有資料皆位於使用者 `uid` 底下：

- `/users/{uid}/vehicles`
- `/users/{uid}/maintenanceRecords`
- `/users/{uid}/repairRecords`
- `/users/{uid}/fuelRecords`
- `/users/{uid}/maintenanceRules`
- `/users/{uid}/insuranceRecords`
- `/users/{uid}/settings/activeVehicleId`

## AI Advisor Notes

### Frontend

- 右下角有全站共用的 AI 浮動按鈕：
  - `src/components/ai/AIAssistantFab.vue`
- 另有完整 AI 頁面：
  - `src/views/AIChatView.vue`
- 聊天 API 預設讀取：
  - `VITE_AI_CHAT_API_URL`

### Worker API

- AI 路由：
  - `POST /api/ai/chat`
- 油價路由：
  - `GET /api/gas-market`
  - `GET /api/gas-price`

### AI Response Strategy

- 一般問題走 Gemini
- 保養類問題優先走 `maintenanceAdvisor.ts` 的規則式短回答
- `prompt.ts` 只提供摘要資料，不應把所有原始紀錄完整灌進模型
- `maxOutputTokens` 已提高，避免回答過早截斷

### Gemini Secret

Gemini API key 不放在專案檔案內，而是放在 Cloudflare Worker secret：

- Secret 名稱：`GEMINI_API_KEY`

手動更新方式：

```powershell
cd C:\Users\serva\Desktop\driveone-gas-price-worker
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret list
npm run deploy
```

本機開發時可使用 Worker 專案中的 `.dev.vars`：

```env
GEMINI_API_KEY=your-local-key
```

## UI / UX Rules

- 風格維持 Tesla / Gogoro / Apple Health 的簡潔科技感
- Mobile First
- 大量留白、圓角、柔和陰影
- 優先使用卡片式資料呈現
- 桌機可支援表格，但手機避免密集表格
- 全站樣式應優先遵循：
  - `src/design-system.css`
- 車輛圖片一律透過：
  - `VehicleImage.vue`

## Editing Guidelines

- 若修改車輛欄位或車種規則，需同步檢查：
  - `src/types`
  - `src/constants`
  - `src/stores`
  - `src/views`
- 若修改油耗 / 能源邏輯，需同步檢查：
  - `FuelView.vue`
  - `FuelForm.vue`
  - `src/utils/fuel.ts`
  - `src/constants/vehicles.ts`
- 若修改提醒或 Dashboard 顯示，需同步檢查：
  - `DashboardView.vue`
  - `RemindersView.vue`
  - `StatisticsView.vue`
- 若修改 AI 顧問，通常需要同時檢查：
  - 前端 `src/components/ai`
  - 前端 `src/views/AIChatView.vue`
  - Worker `src/routes/ai.ts`
  - Worker `src/services/gemini.ts`
  - Worker `src/services/prompt.ts`
  - Worker `src/services/maintenanceAdvisor.ts`

## Verification

Frontend 建置檢查：

```powershell
cd C:\Users\serva\Desktop\motorcycle-maintenance-app
npm run build
```

Worker 型別檢查：

```powershell
cd C:\Users\serva\Desktop\driveone-gas-price-worker
npm run check
```

Worker 部署：

```powershell
cd C:\Users\serva\Desktop\driveone-gas-price-worker
npm run deploy
```

Firebase Hosting 部署：

```powershell
cd C:\Users\serva\Desktop\motorcycle-maintenance-app
npm run build
firebase deploy
```
