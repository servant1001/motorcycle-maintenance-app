# DriveOne 汽機車生活管理平台

DriveOne 是一套以 `Vue 3 + TypeScript + Firebase` 打造的車輛生活管理平台，支援汽車、機車、電動汽車與電動機車的日常管理。系統以 `vehicleId` 串接各類紀錄，包含保養、維修、能源、保險、提醒與統計分析，並採用 Tesla / Gogoro 風格的 Mobile First 介面設計。

## 主要功能

- Email / Password 與 Google 登入
- 車輛管理
  - 新增、編輯、刪除、切換啟用車輛
  - 支援圖片連結與車型分類
- 保養管理
  - 依車輛類型提供不同保養項目
  - 支援卡片 / 列表切換
- 維修紀錄管理
  - 支援卡片 / 列表切換
- 能源紀錄管理
  - 燃油車顯示加油紀錄
  - 電動車顯示充電紀錄
  - 自動計算油耗或電耗效率
- 保險管理
  - 每筆保險資料綁定 `vehicleId`
  - 支援新增、編輯、刪除、查詢
  - Dashboard 顯示即將到期與逾期提醒
- 提醒中心
  - 保養提醒
  - 保險到期提醒
- 統計分析
  - 累積總支出、年度支出、月平均支出、平均效率
  - 月支出趨勢、年度趨勢、支出組成、效率趨勢圖表

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

## 車輛資料模型

系統已從 motorcycle-only 調整為 vehicle-based 架構。

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

所有資料都掛在使用者 `uid` 之下：

- `/users/{uid}/vehicles`
- `/users/{uid}/maintenanceRecords`
- `/users/{uid}/repairRecords`
- `/users/{uid}/fuelRecords`
- `/users/{uid}/maintenanceRules`
- `/users/{uid}/insuranceRecords`
- `/users/{uid}/settings/activeVehicleId`

### 保險資料格式範例

```json
{
  "vehicleId": "vehicleId001",
  "insuranceType": "強制險",
  "companyName": "富邦產險",
  "policyNumber": "ABC123456",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "premium": 658,
  "coverageAmount": 2000000,
  "contactPhone": "0800-xxx-xxx",
  "note": "到期前需續保",
  "createdAt": 1780000000000,
  "updatedAt": 1780000000000
}
```

## 專案結構

```text
src/
  components/      共用元件、表單、Dialog、圖片顯示元件
  views/           頁面元件
  stores/          Pinia 狀態管理
  services/        Firebase 存取邏輯
  constants/       車型、燃料、保養項目等常數
  types/           TypeScript 型別
  utils/           統計、格式化、效率計算工具
  router/          路由設定
  design-system.css
  style.css
public/
  driveone-logo.png
  driveone-login-brand.png
```

## 重要頁面

- `LoginView.vue`
- `DashboardView.vue`
- `VehiclesView.vue`
- `MaintenanceView.vue`
- `RepairsView.vue`
- `FuelView.vue`
- `InsuranceView.vue`
- `RemindersView.vue`
- `StatisticsView.vue`

## 設計系統

全站視覺規範集中在以下檔案：

- `src/design-system.css`
- `src/style.css`

設計方向：

- Tesla / Gogoro / Apple Health 風格
- 白色卡片、大量留白、圓角、柔和陰影
- Mobile First
- 手機優先使用卡片式資訊呈現
- 桌機支援卡片與列表切換
- 圖片使用 `VehicleImage.vue` 統一處理，避免破圖或裁切異常

## 本機開發

1. 安裝依賴

```sh
npm install
```

2. 啟動開發環境

```sh
npm run dev
```

3. 建置正式版本

```sh
npm run build
```

## Firebase 設定

請先在 Firebase Console 建立專案並啟用：

- Authentication
  - Email / Password
  - Google Sign-in
- Realtime Database
- Hosting

前端 Firebase 設定需填入專案對應的 Web App config。

## Firebase Hosting 部署

若尚未初始化 Hosting，可建立 `firebase.json`：

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

部署流程：

```sh
npm run build
firebase deploy
```

## 目前已完成的重點

- 全站改為車輛導向架構
- Logo、favicon、登入品牌視覺已更新為 DriveOne
- Dashboard、車輛、保養、維修、能源、保險頁面已完成 RWD 卡片化
- 保養、維修、能源、保險、車輛頁面支援卡片 / 列表切換
- 統計分析頁已完成第二階段 UI 優化與科技感 ECharts 視覺

