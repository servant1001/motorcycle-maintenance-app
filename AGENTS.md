# AGENTS

## Project Overview

`DriveOne汽機車生活管理平台` 是一套以 `Vue 3 + TypeScript + Firebase Realtime Database` 建立的車輛生活管理系統。

系統已從早期的 `motorcycle-only` 架構，調整為 `vehicle-based` 架構，現在可同時支援：

- 汽車 `car`
- 機車 `motorcycle`
- 電動汽車 `electric_car`
- 電動機車 `electric_motorcycle`

所有資料皆以 `vehicleId` 關聯，設計目標是支援多車管理、保養與維修追蹤、能源補給紀錄、保險提醒與行動裝置優先的使用體驗。

## Core Features

- Email / Google 登入
- 車輛管理 CRUD
- 保養紀錄 CRUD
- 維修紀錄 CRUD
- 能源紀錄 CRUD
  - 燃油車顯示為加油紀錄
  - 電動車顯示為充電紀錄
- 保養提醒規則 CRUD
- 保險管理 CRUD
- Dashboard 總覽
- 統計頁面
- Mobile First RWD

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
  - 共用 UI 元件、表單 Dialog、版型與圖片元件
  - 重要元件包含 `AppLayout.vue`、`VehicleImage.vue`
- `src/views`
  - 各功能頁面
  - 目前包含 `Dashboard / Vehicles / Maintenance / Repairs / Fuel / Insurance / Reminders / Statistics / Login`
- `src/stores`
  - Pinia 狀態管理
  - 各資料模組各自有 store
- `src/services`
  - Firebase Auth 與 Realtime Database 存取封裝
- `src/types`
  - TypeScript 型別定義
- `src/utils`
  - 格式化、保險計算、能源效率等工具函式
- `src/constants`
  - 車輛類型、能源型態、保養項目、預設提醒週期等常數
- `src/design-system.css`
  - 全站設計規範與 design tokens
- `src/style.css`
  - 全域樣式補充

## Key Domain Rules

### Vehicle Model

`vehicles` 現在使用以下核心欄位：

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

其他資料如 `plateNumber`、`brand`、`model`、`year`、`currentMileage`、`imageUrl`、`note` 仍保留。

### Maintenance Items

保養項目需依 `vehicleType` 動態切換，不可再寫死為機車版本。

- 機車：機油、齒輪油、空濾、火星塞、煞車皮、輪胎、皮帶、驗車
- 汽車：機油、機油芯、空氣濾芯、冷氣濾網、變速箱油、煞車油、水箱水、火星塞、輪胎、電瓶、驗車
- 電動車：使用對應的電池、冷卻、輪胎、煞車與系統檢查項目

### Energy Records

- 燃油車：顯示為「加油紀錄」
- 電動車：顯示為「充電紀錄」
- 能源來源選項與效率單位必須依車型調整
  - 燃油車：`km/L`
  - 電動車：`km/kWh`

### Insurance Records

保險資料綁定：

- `/users/{uid}/insuranceRecords/{insuranceId}`

提醒規則：

- 到期前 30 天顯示警告
- 已過期顯示紅色狀態

## Firebase Data Paths

所有資料都放在使用者自己的 `uid` 節點下：

- `/users/{uid}/vehicles`
- `/users/{uid}/maintenanceRecords`
- `/users/{uid}/repairRecords`
- `/users/{uid}/fuelRecords`
- `/users/{uid}/maintenanceRules`
- `/users/{uid}/insuranceRecords`
- `/users/{uid}/settings/activeVehicleId`

建立新資料時優先使用 Firebase `push()` 產生 id。

## UI / UX Rules

- 延續 Tesla / Gogoro / Apple Health 風格
- Mobile First
- 優先使用卡片而不是密集表格
- 大量留白、圓角、柔和陰影
- 全站樣式以 `design-system.css` 為準
- 車輛圖片統一透過 `VehicleImage.vue` 顯示，避免 broken image 直接露出

## When Editing

- 若修改車輛欄位，通常要一起檢查：
  - `src/types`
  - `src/services`
  - `src/stores`
  - `src/views`
  - `Dashboard` 與相關表單
- 若修改能源相關邏輯，要同步檢查：
  - `FuelView.vue`
  - `FuelForm.vue`
  - `src/utils/fuel.ts`
  - `src/constants/vehicles.ts`
- 若新增新的車種規則，不要只改 UI，必須一併檢查：
  - 保養項目
  - 提醒週期
  - 能源文案
  - 統計與 Dashboard 顯示

## Verification

提交前至少執行：

```sh
npm run build
```

如果要驗證部署版本，再執行：

```sh
firebase deploy
```
