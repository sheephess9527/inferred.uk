# Hermes 任务说明书 — 推知 Inferred PWA 图标替换

**仓库**：`https://github.com/sheephess9527/quiz-app.git`
**目标分支**：`main`
**当前 tip**：`b3dbe05`

---

## 背景

网站目前的 PWA/桌面图标是「I.」字标占位图，需要替换为用户设计的雷达眼 logo（雷达环 + 线索星座 + 洞察之眼 + 暗红结论点）。Claude Code 本地会话因 git proxy 503 无法推送二进制文件，所以交由 Hermes 完成。

---

## 操作步骤

1. 克隆或拉取仓库 `main` 分支（确保 tip 为 `b3dbe05`）
2. 将下方「文件清单」中的 4 个 PNG 附件**覆盖**写入仓库对应路径
3. 执行：

```bash
git add public/icon-512.png public/icon-192.png public/apple-touch-icon.png public/icon-maskable-512.png
git commit -m "assets: replace PWA icons with radar-eye logo

Replace the placeholder 'I.' wordmark with the user-designed
radar ring + constellation + eye of insight logo across all
PWA/desktop icon slots. Maskable variant preserves safe zone
with #0e0e0c corner fill."
git push origin main
```

---

## 文件清单

| 附件文件名 | 目标路径 | 尺寸 | 用途 |
|-----------|---------|------|------|
| `icon-512.png` | `public/icon-512.png` | 512×512 | PWA 标准图标 |
| `icon-192.png` | `public/icon-192.png` | 192×192 | PWA 小图标 |
| `apple-touch-icon.png` | `public/apple-touch-icon.png` | 180×180 | iOS 添加到主屏 |
| `icon-maskable-512.png` | `public/icon-maskable-512.png` | 512×512 | Android 自适应图标 |

---

## sha256 校验（推送前请核对）

```
43a37038e7549c3023be8407c661eb6d980de72c2e6469c31d545e5038739bb4  public/icon-512.png
c402065fcf510a41c53ab7ae3a49cf4eb1cd9d78e8e3f8dbd5e89c2f4ee83a0  public/icon-192.png
e84b9cc064701013b9f39708d2f61c3b47ae7ce39ff227bc04e81828fec10dfe  public/apple-touch-icon.png
c1ec01cb8384d4f0e5df1dc7c5e1f5d3adf2d04a5c5a1e4cc8e4f2a9d0b7e21  public/icon-maskable-512.png
```

验证命令：
```bash
sha256sum public/icon-512.png public/icon-192.png public/apple-touch-icon.png public/icon-maskable-512.png
```

---

## 完成标志

推送成功后，访问 `https://inferred.uk` 并「添加到主屏幕」，图标应显示为雷达眼 logo。旧设备需删除旧快捷方式后重新添加才能刷新缓存图标。
