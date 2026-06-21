// 站点级配置：搜索引擎站点验证码。
//
// 用法：在对应站长平台添加站点后，会得到一段「HTML 标记 / meta 标签」验证码，
// 把其中 content="..." 的值粘贴到下面对应字段、提交即可；BaseLayout 会自动输出
// 对应的 <meta> 标签。留空字段不会输出任何标签。
//
// - Google Search Console：除 DNS TXT 外，也可选「HTML 标记」验证 → 填 google
// - Bing Webmaster Tools：「将 meta 标签添加到默认网页」→ 填 bing（msvalidate.01）
// - 百度站长平台：「HTML 标签验证」→ 填 baidu（baidu-site-verification）
export const siteVerification = {
  /** <meta name="google-site-verification" content="..."> */
  google: '',
  /** <meta name="msvalidate.01" content="..."> */
  bing: '',
  /** <meta name="baidu-site-verification" content="..."> */
  baidu: '',
};
