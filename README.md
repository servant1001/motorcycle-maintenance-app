# DriveOne汽機車生活管理平台

DriveOne 是一套以 `Vue 3 + TypeScript + Firebase` 建立的車輛管理系統，提供汽車、機車、電動機車與電動汽車共用的保養、維修、能源與保險管理流程。

整體 UI 風格以 Tesla / Gogoro 為方向，採用卡片式設計、圓角、柔和陰影與 Mobile First 介面，避免傳統 ERP 式的密集表格體驗。

## 功能特色

- Email / Google 帳號登入
- 車輛管理
  - 支援汽車、機車、電動機車、電動汽車
  - 支援圖片連結與主要車輛設定
- 保養紀錄
  - 依車型切換保養項目
- 維修紀錄
- 能源紀錄
  - 燃油車：加油紀錄
  - 電動車：充電紀錄
- 保養提醒
- 保險管理
  - 到期前 30 天提醒
  - 已過期紅色警示
- Dashboard 總覽
- 統計頁面

## 技術棧

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

## 車輛架構

本專案已改為 `vehicle-based` 架構，不再限定只能管理機車。

### vehicleType

- `motorcycle`：機車
- `car`：汽車
- `electric_motorcycle`：電動機車
- `electric_car`：電動汽車

### fuelType

- `gasoline`：汽油
- `diesel`：柴油
- `hybrid`：油電
- `electric`：純電

### Vehicle 範例

```json
{
  "id": "vehicleId001",
  "vehicleType": "motorcycle",
  "plateNumber": "ABC-1234",
  "brand": "Yamaha",
  "model": "勁戰六代",
  "year": 2020,
  "currentMileage": 25800,
  "fuelType": "gasoline",
  "note": "通勤用",
  "createdAt": 1719200000000,
  "updatedAt": 1719200000000
}
```

## Firebase 資料路徑

所有資料都儲存在登入使用者自己的 `uid` 節點下：

- `/users/{uid}/vehicles`
- `/users/{uid}/maintenanceRecords`
- `/users/{uid}/repairRecords`
- `/users/{uid}/fuelRecords`
- `/users/{uid}/maintenanceRules`
- `/users/{uid}/insuranceRecords`
- `/users/{uid}/settings/activeVehicleId`

## 專案結構

```text
src/
  components/      共用元件、Dialog、版型、圖片元件
  views/           頁面元件
  stores/          Pinia stores
  services/        Firebase 資料存取封裝
  constants/       車型、能源、保養項目等常數
  types/           TypeScript 型別
  utils/           工具函式
  router/          路由設定
  design-system.css
  style.css
```

## 本機開發

1. 安裝依賴

```sh
npm install
```

2. 啟動開發伺服器

```sh
npm run dev
```

3. 建置正式版

```sh
npm run build
```

## Firebase 設定

請自行建立 Firebase 專案並完成：

- Authentication
  - Email / Password
  - Google Sign-in
- Realtime Database
- Hosting

前端 Firebase 設定請放在專案對應的設定檔中，並確認 Realtime Database 規則只允許登入使用者讀寫自己的資料。

## 重要畫面

- `LoginView.vue`
- `DashboardView.vue`
- `VehiclesView.vue`
- `MaintenanceView.vue`
- `RepairsView.vue`
- `FuelView.vue`
- `InsuranceView.vue`
- `RemindersView.vue`
- `StatisticsView.vue`

## 設計規範

主要設計規範集中在：

- [src/design-system.css](C:\Users\serva\Desktop\motorcycle-maintenance-app\src\design-system.css)
- [src/style.css](C:\Users\serva\Desktop\motorcycle-maintenance-app\src\style.css)

設計方向：

- 淺灰白背景
- 白色卡片
- 科技藍 / 深灰主色
- 警告橘色
- 危險紅色
- 成功綠色
- 卡片式資訊排列
- 手機優先

## 驗證與部署

建議部署前先執行：

```sh
npm run build
```

若要部署到 Firebase Hosting：

```sh
firebase deploy
```
