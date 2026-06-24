# 機車保養維修紀錄網站

這個專案依照規格書完成第一階段 MVP，技術組合如下：

- Vue 3 + TypeScript + Vite
- Element Plus
- Pinia
- Vue Router
- Firebase Authentication
- Firebase Realtime Database
- dayjs

## 第一階段已完成

- Email 註冊 / 登入 / 登出
- 路由守衛，未登入不可進入系統
- 機車 CRUD
- 保養紀錄 CRUD
- 維修紀錄 CRUD
- 加油紀錄 CRUD
- Dashboard 基本統計
- 保養提醒規則與提醒狀態
- RWD 介面

## 專案啟動

1. 複製 `.env.example` 為 `.env`
2. 填入 Firebase 專案參數
3. 安裝套件並啟動

```sh
npm install
npm run dev
```

## Firebase Realtime Database Rules

規則檔放在 `database.rules.json`，內容符合規格書要求。

## 建置驗證

```sh
npm run build
```

## 第二階段預留

- ECharts 圖表
- 每月 / 年度趨勢
- 油耗趨勢分析
- Google 登入
- PWA
