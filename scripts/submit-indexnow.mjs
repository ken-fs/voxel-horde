#!/usr/bin/env node
/**
 * submit-indexnow.mjs — 把站点所有 URL 推给 IndexNow（Bing / Yandex / Naver / Seznam 读它）
 *
 *   node scripts/submit-indexnow.mjs
 *
 * Google 不参与 IndexNow，所以这条只加速 Bing 侧收录；Google 要走 gsc.mjs index。
 * 前提：scripts/build-site.mjs 已把 key 托管到 https://<域名>/<key>.txt（已验证可访问）。
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = process.env.SITE_HOST || 'voxelsurvivor.site';
const KEY = readFileSync(join(ROOT, '.indexnow-key'), 'utf8').trim();
const URLS = [`https://${HOST}/`];

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: URLS }),
});
console.log(`IndexNow → ${res.status} ${res.statusText}  (${URLS.length} 个 URL)`);
console.log(res.status === 200 || res.status === 202 ? '✓ 已接受' : '⚠️ 非成功状态，检查 key 是否可从公网访问');
