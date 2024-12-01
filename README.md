# **README**

## **アプリケーション名**

**Readscape**

## **アプリケーション概要**

**技術記事保存・進捗管理を効率的にサポートするアプリケーションです。学習中の技術記事を一元管理し、ステータスや進捗を視覚化することで、持続的なスキルアップを実現します。**

## **URL**

[https://original-app-5s27.vercel.app](https://original-app-5s27.vercel.app/)

## **利用方法**

1. **ログイン**
    - googleのアカウントを使用してログインします。
2. **記事の保存**
    - 学びたい技術記事や文献のURLを入力して保存します。保存時にはステータス（「未読」「進行中」「読了」）を設定し、記事を整理します。
3. **進捗管理**
    - ステータスを更新して学習状況を管理します。例えば、「進行中」や「読了」にステータスを変更して進捗を記録します。
4. **感想やメモの記入**
    - 記事ごとにメモを記録し、学んだ内容や自分の考えを保存します。
5. **ステータス別の一覧表示**
    - ステータスごとに記事をフィルタリングし、「未読」「進行中」「読了」で進捗を把握します。
6. **記事の検索**
    - URL、タイトル、メモを基に記事を検索します。
7. **リンクを通じたアクセス**
    - 記事リンクをクリックしてすぐに内容を確認し、必要に応じてステータスやメモを更新します。

## **アプリケーションを作成した背景**

技術者が効率的に学習を進めるには、記事を整理し、進捗を管理する仕組みが重要です。しかし、記事が複数のプラットフォームに散在しているため、一貫した管理が難しい課題があります。また、学習の優先順位付けができず、積読が増えることも問題です。Readscapeは、技術記事の管理・進捗可視化を実現し、学習効率を向上させるために開発しました。これにより、記事整理や再読を効率化し、スキル習得を支援します。

## **洗い出した要件**

要件一覧は以下のドキュメントを参照

[要件定義ドキュメント](https://docs.google.com/document/d/1t0ipupXRm25kVMMvBx3AY_jufTvg44Eu/edit?usp=sharing&ouid=109289585110476773788&rtpof=true&sd=true)

## **実装した機能のGIF**

### 記事保存機能

![2f172b84df3d8dd9868fd0d3f3f584c5.gif](https://prod-files-secure.s3.us-west-2.amazonaws.com/ad69c22c-3687-460d-a2eb-8175ac6e179f/7ecb2065-82de-4bdd-afe3-f4383b093419/2f172b84df3d8dd9868fd0d3f3f584c5.gif)

### 記事進捗管理機能

![f6c388a3245e7eb52f465bf44c895bcf.gif](https://prod-files-secure.s3.us-west-2.amazonaws.com/ad69c22c-3687-460d-a2eb-8175ac6e179f/da7714f1-8a78-41ae-b032-b6ebdf68ed5b/f6c388a3245e7eb52f465bf44c895bcf.gif)

### 記事検索機能

![a8b29508b24722048d36462ed68cea0f.gif](https://prod-files-secure.s3.us-west-2.amazonaws.com/ad69c22c-3687-460d-a2eb-8175ac6e179f/0ccb94d9-2819-44e1-882f-b0be6b55459c/a8b29508b24722048d36462ed68cea0f.gif)

## 主要機能（追加予定の機能）
1. **主要機能**
    - 記事の保存と進捗管理。
    - ステータス別のフィルタリング表示。
    - 記事への感想やメモ機能。
    - 記事の検索機能。
2. **今後追加予定の機能**
    - 言語やカテゴリごとの分類。
    - 記事数をグラフで可視化。
    - アプリ内でのGoogle検索対応。
    - 記事のプラットフォーム（YouTube、X、Qiitaなど）の表示。
    - OGP対応。

## ER図

!https://prod-files-secure.s3.us-west-2.amazonaws.com/ad69c22c-3687-460d-a2eb-8175ac6e179f/105c6dea-0330-47be-a080-14f91be9dbb4/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_0006-11-26_12.49.36.png

## **画面遷移図**

https://www.figma.com/design/Mi4mufD1TeKP2asscAvfXV/Untitled?m=dev&t=LdEXxAob5k9tvmUf-1

## **開発環境**

### **フロントエンド**

- **Next.js**
- **Tailwind CSS**

### **バックエンド**

- **tRPC**
- **NextAuth.js**
- **Prisma**

### **インフラ**

- **Vercel**
- **Supabase**

### **テスト**

- **Jest + React Testing Library**
- **tRPC Testing Utilities**
