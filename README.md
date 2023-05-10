# Frontend Deploy Demo

比照 vue-cli 官方介紹的 gh-pages 部署概念，使用 GitHub Actions 或 sh file 將 dist 資料夾作為 root 並 push 為新的 branch。

## 使用 sh file 自動化

先將既存的 `dist branch` clone 到 `./dist` 目錄下。
```bash
$ git clone ${repo_url} -b dist --single-branch ./dist
```

Build。
```bash
$ pnpm build
```

執行自動化指令 (pnpm deploy 名稱已被占用, 故改用 release)。
```bash
# 使用 lib 優化詢問 UI 的版本
$ pnpm release

# 原生版本
$ pnpm release:pure
```

依提示訊息，輸入要 push 的目標 branch name。

## 上傳檔案到 Server 端

Server 端容器 clone 並 pull `branch dist` 即可。

<br />

初次上傳。
```bash
$ cd path/to/project/root
$ git clone -b dist --single-branch ${repo_url} .
```

後續只要 pull 新的內容即可。
```bash
$ git fetch
$ git pull
```

## 使用 GitHub Actions 自動化

main branch 在 onPush 時，會自動透過 GitHub Actions 進行 build 以及 push dist dir to dist branch 的動作。<br />
可參照 actions 設定檔 `.github/workflows/deploy-dist.yml`。

### memo

- 以 vite github pages 部署模板作為 base
- Actions 會自動生成 `${{ secrets.GITHUB_TOKEN }}` 臨時權杖，用來對 repo 做基本的 git 操作
- GITHUB_TOKEN 的權限由 `permissions.contents` 控制，要改成 write 才能 git push，repo 的 `Setting.Actions.General` 下面的 `Workflow permissions` 也可設定，會以 yml 的為優先
  - [參考](https://stackoverflow.com/questions/73687176/permission-denied-to-github-actionsbot-the-requested-url-returned-error-403)
  ```yml
  permissions:
    contents: write
  ```
- 也可生成 PAT，勾選 `repo:status` 與 `public_repo`。然後在目標 repo 的 `Setting.Secrets.Actions` 建立新的 secret 將 PAT 貼上，並取個名子，之後可在 Actions 呼叫。例如取名為 PAT 則為 `${{ secrets.PAT }}`
- 簡單的 change file, commit, push 範例: [Link](https://stackoverflow.com/questions/57921401/push-to-origin-from-github-action)
- 在一個 steps 有切資料夾的話，下一個 steps 會回到根目錄
- 如果手動 clone 其他 branch 或 repo 到特定資料夾，該 git 無法吃到同個 `actions/checkout` 控制的 GITHUB_TOKEN，手動 push 要另外帶 PAT 或採用 [action/github-push](https://github.com/marketplace/actions/github-push)
  ```yml
  git push https://${{ secrets.PAT }}@github.com/${{ github.repository }}.git dist
  ```
- 手動 clone dist 的話, token 要另外帶
  ```yml
  steps:
    - name: Clone dist branch
        run: |
          git clone https://github.com/${{ github.repository }}.git -b dist --single-branch ./dist
    - name: Change
        run: |
          # something change...
    - name: Commit
        run: |
          cd dist
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git commit -m "v01.$(date +%Y%m%d)"
          # 手動帶 token push
          # git push https://${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git
    # 透過其他 action 帶 token push
    - name: Push changes
       uses: ad-m/github-push-action@master
       with:
         github_token: ${{ secrets.GITHUB_TOKEN }}
         directory: './dist'
         branch: dist
  ```
- 使用 `actions/setup-node` 時，如要用 pnpm 需要事先安裝: [參考](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#caching-packages-data)
- [Actions Context](https://docs.github.com/en/actions/learn-github-actions/contexts)
- [GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- checkout 多 repo，指定 dir - [參考](https://www.youtube.com/watch?v=dcSy8uCxOfk)
