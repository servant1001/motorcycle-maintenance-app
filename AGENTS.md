# AGENTS

## Project Overview

這是一個以 Vue 3 + TypeScript + Firebase Realtime Database 建立的機車保養維修紀錄系統，UI 風格走 Tesla / Gogoro 式的極簡車輛 App 路線，而不是傳統 ERP 後台。

目前已完成：

- Email / Google 登入
- 機車管理
- 保養紀錄
- 維修紀錄
- 加油紀錄
- 保養提醒
- 保險管理
- Dashboard 統計與提醒
- Mobile First 卡片式介面

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

## Source Layout

- `src/components`
  - 共用元件，例如 `AppLayout.vue`、`VehicleImage.vue`、各種表單 Dialog
- `src/views`
  - 路由頁面，例如 Dashboard、車庫、保險管理
- `src/stores`
  - Pinia 狀態管理，每個模組一個 store
- `src/services`
  - Firebase Realtime Database / Auth 的資料讀寫封裝
- `src/types`
  - 所有主資料型別
- `src/utils`
  - 顯示格式、油耗計算、保險提醒等純函式
- `src/design-system.css`
  - 全站設計 token 與共用視覺規範
- `src/style.css`
  - 全站共用版型、卡片、表格、手機卡片列表樣式

## Data Rules

所有資料都必須綁定登入使用者 uid，路徑位於：

- `/users/{uid}/vehicles`
- `/users/{uid}/maintenanceRecords`
- `/users/{uid}/repairRecords`
- `/users/{uid}/fuelRecords`
- `/users/{uid}/maintenanceRules`
- `/users/{uid}/insuranceRecords`

新增資料時使用 Firebase `push()` 產生 id。

## UI / UX Rules

- 保持 Tesla / Gogoro / Apple Health 風格
- 優先 Mobile First
- 手機版列表優先使用卡片，而不是密集表格
- 桌機版可保留表格，但避免傳統管理後台視覺
- 使用 `design-system.css` 中的變數，不要隨意新增零散顏色
- 圖片顯示優先走 `VehicleImage.vue`，避免各頁各自處理比例與 fallback

## When Editing

- 新功能若是獨立資料模組，優先同步新增：
  - `types`
  - `services`
  - `stores`
  - `views`
  - 對應 `Dashboard` 提醒或摘要
- 若涉及機車圖片，使用 `VehicleImage.vue`
- 若涉及日期提醒，請在 `utils` 建立純函式，不要把邏輯散在模板裡
- 若新增頁面，記得同步：
  - `router/index.ts`
  - `components/AppLayout.vue` 導覽

## Verification

修改後至少執行：

```sh
npm run build
```

若 build 成功，再同步桌面專案版本。
