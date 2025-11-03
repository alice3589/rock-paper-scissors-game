# GitHub Pagesへのデプロイ手順

このプロジェクトをGitHub Pagesで公開する手順です。

## 自動デプロイ（推奨）

GitHub Actionsが自動的にデプロイします。

### セットアップ手順

1. **GitHubリポジトリの設定**
   - GitHubリポジトリに移動
   - Settings → Pages を開く
   - Source: "GitHub Actions" を選択

2. **mainブランチにプッシュ**
   ```bash
   git add .
   git commit -m "GitHub Pages用に設定"
   git push origin main
   ```

3. **デプロイの確認**
   - GitHubリポジトリの Actions タブでワークフローの実行状況を確認
   - 完了後、`https://alice3589.github.io/rock-paper-scissors-game/` でアクセス可能

## 手動デプロイ

1. **ビルド**
   ```bash
   npm run export
   ```

2. **デプロイ**
   ```bash
   npm run deploy
   ```

   これにより、`out`フォルダの内容が`gh-pages`ブランチにデプロイされます。

3. **GitHub Pagesの設定**
   - GitHubリポジトリの Settings → Pages
   - Source: "Deploy from a branch" を選択
   - Branch: `gh-pages` / `/ (root)` を選択

## 注意事項

- モデルファイル（`public/model/`）はGitHubリポジトリに含まれている必要があります
- ファイルサイズが大きい場合は、Git LFSの使用を検討してください
- `node_modules`は`.gitignore`で除外されているため、ビルド時に自動的にインストールされます

## トラブルシューティング

### ページが表示されない
- GitHub Pagesの設定を確認（Sourceが正しく設定されているか）
- Actionsタブでエラーがないか確認
- ビルドが正常に完了しているか確認

### モデルファイルが読み込めない
- `basePath`が正しく設定されているか確認
- ブラウザのコンソールでエラーを確認
- ファイルパスが正しいか確認

