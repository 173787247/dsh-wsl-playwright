# dsh-wsl-playwright

> **Languages:** [中文（首页）](./README.md) · **English** (this file)

Headless Playwright fetch (title + body text) in WSL.

| | |
|---|---|
| Version | **0.1.0** |
| Kit | Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit); not in `install.sh` |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-playwright
```

Batch link (optional): `bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## Tools

| Tool | Role |
|------|------|
| `pw_status` | npx/node available |
| `pw_fetch` | headless fetch URL |

## Config

`timeoutMs / maxChars`

Prefer `dsh-wsl-browser` for interactive Windows browsing. Do not dual-drive. First run may download browsers via npx.

## License

MIT
