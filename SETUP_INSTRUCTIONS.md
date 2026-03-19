# セットアップ手順

## PowerShellの実行ポリシーエラーが発生した場合

### 方法1: コマンドプロンプト（cmd）を使用（推奨）

1. Windowsキー + R を押す
2. `cmd` と入力してEnter
3. プロジェクトフォルダに移動:
   ```
   cd "C:\Users\canca\OneDrive - 横浜国立大学\デスクトップ\ramen-app"
   ```
4. 以下を実行:
   ```
   npm install
   ```

### 方法2: PowerShellの実行ポリシーを一時的に変更

1. PowerShellを**管理者として実行**（右クリック → 「管理者として実行」）
2. 以下のコマンドを実行:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. プロジェクトフォルダに移動して `npm install` を実行

### 方法3: npm.cmdを直接使用

PowerShellで以下のコマンドを実行:
```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

---

## インストール後の次のステップ

1. 依存関係のインストールが完了したら、開発サーバーを起動:
   ```
   npm run dev
   ```

2. ブラウザで http://localhost:3000 を開いて確認

3. Step 2（Supabase設定）に進む
