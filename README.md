# dsh-wsl-playwright

> **语言：** **中文**（本页） · [English](./README.en.md)

WSL 无头 Playwright 抓取页面标题与正文。

| | |
|---|---|
| 版本 | **0.1.0** |
| 套件 | [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit) **可选**，不在 `install.sh` |

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-playwright
# 或本机 path：
# dsh plugin --profile web add /mnt/c/Users/YOU/Desktop/AIFullStackDevelopment/dsh-wsl-playwright
```

kit 批量链接（可选）：`bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## 工具

| 工具 | 作用 |
|------|------|
| `pw_status` | npx/node 是否可用 |
| `pw_fetch` | 无头打开 URL |

## 配置要点

`timeoutMs / maxChars`

交互浏览优先 `dsh-wsl-browser`（Windows）。同一任务不要双轨驱动。首次可能经 npx 下载浏览器。

## License

MIT
