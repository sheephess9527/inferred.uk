// 构建标识：在一次构建中只求值一次（ESM 模块单例），
// 用于让“添加到主屏幕”的独立 App 检测到新版本并提示更新。
export const BUILD_ID =
  process.env.BUILD_ID ??
  process.env.CF_PAGES_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  new Date().toISOString();
