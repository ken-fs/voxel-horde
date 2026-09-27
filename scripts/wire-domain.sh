#!/usr/bin/env bash
# 绑定自定义域名（zone active 之后跑）
#
#   bash scripts/wire-domain.sh
#
# 前提：zone 已 active。⚠️ zone pending 时绑域名 → 证书签发失败且不重试（AGENTS 记过这个坑）。
# 权限：这一步需要 workers_routes:write —— MCP token 和静态 API token 都没有，
#       只有 wrangler 的 OAuth token 有（所以必须先 npx wrangler whoami 续期，它约 24h 过期）。
set -uo pipefail

ACC="${CF_ACCOUNT_ID:-70716e073f0925c564bafd0eaf0be307}"
SERVICE="voxel-survivors"
DOMAIN="voxelsurvivor.site"
cd "$(dirname "$0")/.."

echo "▸ 1/3 续期 wrangler token（过期的 token 会报 Authentication error）"
npx wrangler whoami >/dev/null 2>&1 || { echo "  ✗ wrangler 未登录"; exit 1; }
TOKEN=$(python3 -c "
import re
d=open('$HOME/Library/Preferences/.wrangler/config/default.toml').read()
m=re.search(r'oauth_token\s*=\s*\"([^\"]+)\"', d)
print(m.group(1) if m else '')
")
[ -z "$TOKEN" ] && { echo "  ✗ 读不到 oauth_token"; exit 1; }
echo "  ✓ token 已就绪"

echo "▸ 2/3 绑定 apex + www"
for HOST in "$DOMAIN" "www.$DOMAIN"; do
  R=$(curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/$ACC/workers/domains" \
    -d "{\"environment\":\"production\",\"hostname\":\"$HOST\",\"service\":\"$SERVICE\",\"zone_name\":\"$DOMAIN\"}")
  echo "$R" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    r=d['result']
    print('  ✓', r.get('hostname'), '| cert:', (r.get('ssl') or {}).get('status'))
else:
    msgs=[e.get('message') for e in d.get('errors',[])]
    if any('already exists' in (m or '') for m in msgs):
        print('  · 已绑定过（跳过）')
    else:
        print('  ⚠️ 失败:', msgs)
        print('     → dashboard: Workers → Settings → Domains & Routes → Add custom domain')
"
done

echo "▸ 3/3 验证（证书签发可能要 1-5 分钟）"
for i in 1 2 3 4 5 6; do
  sleep 20
  CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://$DOMAIN/" 2>/dev/null)
  MARK=$(curl -s --max-time 20 "https://$DOMAIN/.well-known/deploy.txt" 2>/dev/null | head -c 12)
  echo "  第 $i 次: HTTP $CODE | 部署标记 ${MARK:-无}"
  [ "$CODE" = "200" ] && [ -n "$MARK" ] && break
done

echo
echo "✅ 完成。剩下人工两件："
echo "   1. GSC 加属性 sc-domain:$DOMAIN（DNS TXT 验证）→ 加服务账号为 Owner → 提交 sitemap"
echo "   2. CF dashboard → Worker → Settings → Builds → Connect Git（build 命令填 node scripts/build-site.mjs）"
