# Frontend Deploy Demo

核心訴求:

讓 git 忽略 dist 輸出資料夾, 並只 deploy dist 內容到 Server。畢竟 Server 不需要 source files, 不該放在上面佔空間。

## 開發端操作

到 release 的流程都跟之前一樣
1. 正常在 `development branch` 開發
1. 完成後, 發 PR, merge to `main branch`
1. 一樣在 `main branch` 上 tag & release

接著在本機打包

```bash
$ pnpm build
```

然後執行自訂的 deploy 指令 (跟 pnpm deploy 撞名, 改用 release)

```bash
$ pnpm release
```

接著會詢問版本號, 會作為 commit message, 之後全自動將 dist 資料夾作為 `dist branch` push 到 GitHub 上

```bash
# 輸入版本號 v01.{date}.{times}
Input version tag: v01.20221122.00
```

## Server 端操作

Server 只拉 build 後的檔案，也就是 `dist branch`, 並不需要 source files。
- `-b` 只拉特定 branch
- `--single-branch` 不拉其他 branch 的歷史紀錄, 未來 fetch 時也只會同步指定的單一 branch

```bash
$ cd httpd/web_target_path
$ git clone -b dist --single-branch {repo_path} .
```

可以利用 commit message 快速確認當前 Server 的版本

```bash
$ git log
```

要更新版本時, 讓開發者先 build 之後, 依照上面的方式 deploy `dist branch`, Server 端直接 reset 更新

```bash
$ git reset --hard origin/dist
```

## Memo

### 標準 github pages 作法

[Vite Deploy a static site - Github Pages](https://vitejs.dev/guide/static-deploy.html#github-pages)

dist 採用 -f push 覆蓋, 畢竟是編譯後的檔案, 其實不需要 git 版控

缺點:
- 如發生問題需退版本時, 得在本地端切換 main 跑一遍 build & deploy, 無法由 Server 端靈活切換

### 可能的解法

1. 不使用 -f push, 讓 dist branch 紀錄 commit
  - 缺點:
    - 需要多管理一支 branch, 多人協作恐會紊亂
    - 主要的版控其實是忽略 dist 的, 如果 `dist branch` 也要版控會有諸多麻煩
    - 同上, 新人環境建置時, 會搞這個 `dist branch` 搞很久
2. 讓 Server 端人員去跑 build & deploy
  - 缺點:
    - 恐會搞的很麻煩

## Actions

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
