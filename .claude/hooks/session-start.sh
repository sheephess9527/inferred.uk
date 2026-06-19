#!/bin/bash
set -euo pipefail

# Inferred — SessionStart 钩子
# 在 Claude Code on the web 会话启动时安装依赖，
# 确保类型检查（pnpm check）与构建（pnpm build）可直接运行。

# 仅在远程（web）环境运行；本地会话不受影响。
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# 确保 pnpm 可用（优先用已有的，否则通过 corepack 启用）。
if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
fi

# 安装依赖：用 install（而非 ci）以利用容器缓存；幂等、可重复运行。
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --prefer-offline
else
  npx --yes pnpm@10 install --prefer-offline
fi

echo "[session-start] 依赖安装完成，可运行 pnpm check / pnpm build。"
