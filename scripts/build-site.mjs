#!/usr/bin/env node
/**
 * build-site.mjs — 组装部署产物到 ./site
 *
 *   node scripts/build-site.mjs
 *
 * 产物结构（Cloudflare Workers 静态资源直接吃这个目录）：
 *   site/
 *     index.html          游戏本体（路径已从 ../../ 改写成 ./）
 *     lib/                8 个模块
 *     vendor/three/       内置 three.js
 *     robots.txt  sitemap.xml  favicon.svg  _headers
 *     .well-known/deploy.txt   部署标记（= 当前 git HEAD，供 site-hygiene 校验）
 *
 * 为什么要有这一步：仓库根是「starter 套件」（6 个 demo + 启动页），
 * 而站点根必须是游戏本体。所以不把 assets 指向仓库根，而是组装出一个干净的 site/。
 */
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// 读 .build-env（环境变量优先）。放文件里是为了避免「忘了传 PUBLIC_GA_ID → 线上 GA 静默消失」。
if (existsSync(join(ROOT, '.build-env'))) {
  for (const line of readFileSync(join(ROOT, '.build-env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const OUT = join(ROOT, 'site');
const SITE_URL = process.env.SITE_URL || 'https://voxelsurvivor.site';

// ── 1. 清空并建立产物目录
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// ── 2. 游戏本体：改写成站点根相对路径（仓库里是 demos/play/ → 根，所以 ../../ → ./）
let html = readFileSync(join(ROOT, 'demos/play/index.html'), 'utf8');
const before = (html.match(/\.\.\/\.\.\//g) || []).length;
html = html.replaceAll('../../lib/', './lib/').replaceAll('../../vendor/', './vendor/');
const after = (html.match(/\.\.\/\.\.\//g) || []).length;
if (after !== 0) {
  console.error(`✗ 还有 ${after} 处 ../../ 没改写（新增引用时记得同步这里）`);
  process.exit(1);
}
// canonical / og:url 用真实域名（源码里写的是相对，构建时补全）
html = html.replaceAll('__SITE_URL__', SITE_URL);

// GA：不传 PUBLIC_GA_ID 就把整块门控代码删掉（不留横幅、不留第三方请求）
// —— 和 petsuniverse 的语义一致：复制别的站的 ID 会把本站流量送进别人属性，所以不设兜底。
const GA_ID = process.env.PUBLIC_GA_ID || '';
if (GA_ID) {
  html = html.replaceAll('__GA_ID__', GA_ID);
} else {
  const before2 = html.length;
  html = html.replace(/\/\* ANALYTICS:START \*\/[\s\S]*?\/\* ANALYTICS:END \*\//g, '');          // 横幅 CSS
  html = html.replace(/<!-- ANALYTICS:START -->[\s\S]*?<!-- ANALYTICS:END -->\n?/g, '');           // 横幅 DOM
  html = html.replace(/<script>\n\/\/ 同意门控的 Google Analytics[\s\S]*?<\/script>\n/g, '');      // 门控脚本
  console.log(`  GA: 未配置 PUBLIC_GA_ID → 已移除门控代码块（-${before2 - html.length} 字符）`);
}
writeFileSync(join(OUT, 'index.html'), html);

// ── 3. 运行库
cpSync(join(ROOT, 'lib'), join(OUT, 'lib'), { recursive: true });
cpSync(join(ROOT, 'vendor/three'), join(OUT, 'vendor/three'), { recursive: true });

// OG 图（源码在 assets/，避免被 rm -rf site 冲掉）
cpSync(join(ROOT, 'assets/og.jpg'), join(OUT, 'og.jpg'));

// ── 4. 站点附加文件
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);

// 体素风 favicon（16 格 = 一把剑 + 一个方块人，纯 SVG 零素材）
writeFileSync(join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0b0f14"/>
  <rect x="6" y="4" width="20" height="3" fill="#dfe8f2"/>
  <rect x="14" y="7" width="4" height="12" fill="#dfe8f2"/>
  <rect x="11" y="19" width="10" height="3" fill="#c8a86a"/>
  <rect x="14" y="22" width="4" height="6" fill="#7fd1c8"/>
</svg>
`);

// IndexNow 所有权证明：key 必须托管在 /<key>.txt（Bing/Yandex/Naver 会来抓它）
// Google 不参与 IndexNow，这条只是 Bing 侧的加速。
if (existsSync(join(ROOT, '.indexnow-key'))) {
  const k = readFileSync(join(ROOT, '.indexnow-key'), 'utf8').trim();
  if (k) writeFileSync(join(OUT, `${k}.txt`), k + '\n');
}

// 缓存 + 安全头（Cloudflare Workers 静态资源支持 _headers）
writeFileSync(join(OUT, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN

/vendor/*
  Cache-Control: public, max-age=31536000, immutable

/lib/*
  Cache-Control: public, max-age=604800

/
  Cache-Control: public, max-age=0, must-revalidate
`);

// ── 5. 部署标记（= git HEAD，site-hygiene 用它判断 Git 集成有没有断）
let head = 'unknown';
try { head = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { /* 非 git 环境（CI 之外）忽略 */ }
mkdirSync(join(OUT, '.well-known'), { recursive: true });
writeFileSync(join(OUT, '.well-known/deploy.txt'), head + '\n');

console.log(`✓ site/ 已生成`);
console.log(`  游戏 HTML 改写 ../../ 共 ${before} 处 → 0`);
console.log(`  部署标记: ${head.slice(0, 12)}`);
console.log(`  SITE_URL: ${SITE_URL}`);
console.log(`  GA_ID: ${GA_ID || '(未配置，不加载分析)'}`);
const size = execSync(`du -sh ${OUT} | cut -f1`, { encoding: 'utf8' }).trim();
console.log(`  产物大小: ${size}`);
