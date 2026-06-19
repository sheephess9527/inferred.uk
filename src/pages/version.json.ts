import type { APIRoute } from 'astro';
import { BUILD_ID } from '../buildInfo';

// 静态生成的版本探针。独立 App 会轮询此文件，
// 发现 version 与本地加载的不一致时，提示用户更新。
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ version: BUILD_ID }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache, no-store, must-revalidate',
    },
  });
