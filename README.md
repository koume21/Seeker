This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Seeker
# アプリ名：Seeker
## 概要
このアプリは、プログラミングをする上で発生したエラーや開発途中で挫折したところを記録として残しておく。プログラミング言語別にエラー対処やコマンドなどを記録できるようにする。それをＸ（twitter）のように公開できるようにする。個人のためのメモとしても使用可能。また、投稿した内容に対して別の利用者からコメントを残せる。それにより対処できていないエラーを解決できる。

## ターゲット
- プログラミングをする人

## 使用技術
- TypeScript
- Next.js

## 要件定義
### MVP
    - ユーザー登録
    - ログイン
    - 言語別又はフレームワーク別管理機能
    - 投稿機能
    - ステータス表示
### MVP以外の機能
    - 返信機能
    - 検索機能
    - いいね機能
    - アクティビティ機能（他ユーザーからの回答）
    - AIによる自動整理

## 外部設計
## API設計
## DB設計
### 必要なテーブル
    - Users(ユーザー登録、ログイン)
    - Languages(言語管理)
    - Posts(投稿)
    - Likes(いいね)
### ER図
## Qiitaとの差別化要素
- 「未解決」のまま流せるタイムライン
    - Qiitaは「解決策」を書く場所ですが、このツールは**「今、このエラーで詰まっている」というプロセスそのもの**を投稿の主役にします。
仕組み: 投稿時に「解決済み」「格闘中」「一旦保留（挫折）」のステータスを付けられる。


## 今後の課題
- 
- 


## 現在の進捗
### 開発経過
    - ログイン画面の作成完了
    - githubの連携済み
    - ログインのレンダリング処理
    - sessionのDB登録
    - ホーム画面のレイアウト
    - ホーム画面の言語別エラー管理
    - エラーor課題点の投稿
    - セッション管理（自動ログアウト）
    
### 未開発
    - 公開、非公開の設定

### 開発途中
    - 進捗管理

## コマンド一覧
- DB閲覧
    - npx prisma studio
