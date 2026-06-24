# AGENTS

## Project Overview

`DriveOne 汽機車生活管理平台` 是一個使用 `Vue 3 + TypeScript + Firebase Realtime Database` 開發的多車輛管理專案。專案已從早期的 motorcycle-only 架構，調整為 vehicle-based 架構，現階段支援：

- `car`：汽車
- `motorcycle`：機車
- `electric_car`：電動汽車
- `electric_motorcycle`：電動機車

所有資料都透過 `vehicleId` 關聯，讓保養、維修、能源、保險、提醒與統計分析都能共用同一套車輛主資料。

## Core Features

- Firebase Email / Password 登入
- Firebase Google 登入
- 車輛 CRUD
- 保養紀錄 CRUD
- 維修紀錄 CRUD
- 能源紀錄 CRUD
- 保險紀錄 CRUD
- Dashboard 綜合摘要
- 保養與保險提醒
- 統計分析圖表與支出彙整
- Mobile First 響應式 UI

## Tech Stack

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

## Source Layout

- `src/components`
  - 共用 UI 元件、Dialog、表單與圖片呈現元件
  - 重要元件包含 `AppLayout.vue`、`VehicleImage.vue`
- `src/views`
  - 頁面元件
  - 目前主要頁面：`Login`、`Dashboard`、`Vehicles`、`Maintenance`、`Repairs`、`Fuel`、`Insurance`、`Reminders`、`Statistics`
- `src/stores`
  - Pinia store
  - 管理車輛、保養、維修、能源、保險與使用者資料
- `src/services`
  - Firebase Auth 與 Realtime Database 存取邏輯
- `src/types`
  - TypeScript 型別定義
- `src/constants`
  - 車輛選項、燃料選項、保養分類與顯示文字
- `src/utils`
  - 格式化、油耗電耗、統計分析等工具
- `src/design-system.css`
  - 全站設計 token
- `src/style.css`
  - 全域樣式

## Key Domain Rules

### Vehicle Model

`vehicles` 是所有紀錄的主表，至少包含：

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
- 其他常用欄位
  - `plateNumber`
  - `brand`
  - `model`
  - `year`
  - `currentMileage`
  - `imageUrl`
  - `note`

### Maintenance Items

保養項目需依 `vehicleType` 區分：

- 機車 / 電動機車以機車維護情境為主
- 汽車 / 電動汽車以汽車維護情境為主
- 畫面與統計不得再寫死只服務機車

### Energy Records

- 燃油車顯示加油紀錄
- 電動車顯示充電紀錄
- 效率單位需依車種顯示
  - 燃油車：`km/L`
  - 電動車：`km/kWh`

### Insurance Records

保險資料路徑固定為：

- `/users/{uid}/insuranceRecords/{insuranceId}`

提醒規則：

- 到期前 30 天顯示提醒
- 已過期顯示紅色警示

## Firebase Data Paths

所有資料掛在使用者 `uid` 底下：

- `/users/{uid}/vehicles`
- `/users/{uid}/maintenanceRecords`
- `/users/{uid}/repairRecords`
- `/users/{uid}/fuelRecords`
- `/users/{uid}/maintenanceRules`
- `/users/{uid}/insuranceRecords`
- `/users/{uid}/settings/activeVehicleId`

## UI / UX Rules

- 延續 Tesla / Gogoro / Apple Health 的極簡科技風格
- Mobile First
- 手機優先以卡片呈現，不預設使用密集表格
- 桌機可提供卡片 / 列表切換
- 所有視覺風格應優先沿用 `design-system.css`
- 車輛圖片顯示統一經過 `VehicleImage.vue`，避免破圖、裁切跑版與比例異常
- 統計分析頁使用較有科技感的 ECharts 視覺，而非傳統後台圖表樣式

## Editing Guidelines

- 若修改車輛欄位或顯示文案，優先檢查：
  - `src/types`
  - `src/constants`
  - `src/stores`
  - `src/views`
  - `Dashboard` 是否同步更新
- 若修改能源相關邏輯，需同步檢查：
  - `FuelView.vue`
  - `FuelForm.vue`
  - `src/utils/fuel.ts`
  - `src/constants/vehicles.ts`
- 若新增提醒或統計功能，需同步檢查：
  - `DashboardView.vue`
  - `RemindersView.vue`
  - `StatisticsView.vue`

## Verification

每次完成主要功能調整後，至少執行：

```sh
npm run build
```

若要正式部署到 Firebase Hosting：

```sh
firebase deploy
```
