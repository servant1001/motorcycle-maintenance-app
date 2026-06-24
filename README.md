# 機車保養維修紀錄系統

這是一個以 Vue 3 + TypeScript + Firebase 建立的機車保養維修紀錄系統，介面風格走 Tesla / Gogoro 式的極簡車輛 App 路線，重點是把車況、花費、提醒與保單資訊整合在同一個 Mobile First 體驗中。

## 目前功能

- Email / Google 登入
- 路由守衛，未登入不可進入系統
- 機車管理 CRUD
- 機車圖片連結與全站圖片顯示
- 保養紀錄 CRUD
- 維修紀錄 CRUD
- 加油紀錄 CRUD
- 保養提醒規則與到期狀態
- 保險管理 CRUD
- Dashboard 基本統計
- Dashboard 保養提醒與保險提醒
- 手機卡片式列表與桌機表格並存

## 技術組合

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

## 設計系統

全站樣式由以下檔案統一管理：

- [design-system.css](C:/Users/serva/Documents/Playground/motorcycle-maintenance-app/src/design-system.css)
- [style.css](C:/Users/serva/Documents/Playground/motorcycle-maintenance-app/src/style.css)

主要設計方向：

- 淺灰白背景
- 白色卡片
- 大量留白
- 大圓角
- 柔和陰影
- Mobile First
- Tesla / Gogoro / Apple Health 式的資訊卡片感

## 專案結構

```text
src/
  components/      共用元件、Dialog、圖片元件
  views/           路由頁面
  stores/          Pinia 狀態管理
  services/        Firebase Auth / Realtime Database 操作
  types/           TypeScript 資料型別
  utils/           格式化與提醒計算工具
  router/          路由設定
  design-system.css
  style.css
```

## 主要資料路徑

所有資料都綁定登入使用者 uid：

- `/users/{uid}/vehicles`
- `/users/{uid}/maintenanceRecords`
- `/users/{uid}/repairRecords`
- `/users/{uid}/fuelRecords`
- `/users/{uid}/maintenanceRules`
- `/users/{uid}/insuranceRecords`

## 環境設定

1. 複製 `.env.example` 為 `.env`
2. 填入 Firebase 專案參數
3. 安裝套件並啟動

```sh
npm install
npm run dev
```

## Firebase Realtime Database Rules

規則檔在 [database.rules.json](C:/Users/serva/Documents/Playground/motorcycle-maintenance-app/database.rules.json)。

## 建置驗證

```sh
npm run build
```

## 目前重要頁面

- `LoginView.vue`
- `DashboardView.vue`
- `VehiclesView.vue`
- `MaintenanceView.vue`
- `RepairsView.vue`
- `FuelView.vue`
- `RemindersView.vue`
- `InsuranceView.vue`

## 備註

- 機車圖片統一使用 `VehicleImage.vue` 處理比例與 fallback
- 保險提醒規則：
  - 到期前 30 天顯示橘色提醒
  - 已過期顯示紅色警示
- 若後續要加入圖片上傳，建議下一步接 Firebase Storage，而不是只用 URL
