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
