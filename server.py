"""Dota 复盘聊天 - 本地服务.

只做两件事（无任何第三方依赖，Python 3 自带库即可运行）：
1. 托管 web/ 下的静态页面（浏览器同源访问，无跨域问题）；
2. 把浏览器的 AI 请求转发给 OpenAI 兼容服务（OpenCode Go / MiniMax，
   解决浏览器直调的 CORS 问题）。

API Key 由用户在页面里输入，存在浏览器 localStorage，
每次请求经页面传给本服务，本服务只透传、不落地存储。

运行：  python server.py [端口，默认 8077]
打开：  http://127.0.0.1:8077
"""

import glob
import json
import os
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, 'web')
DIST_DIR = os.path.join(BASE_DIR, 'ui', 'dist')
STATIC_DIR = DIST_DIR if os.path.isdir(DIST_DIR) else WEB_DIR
REPLAYS_DIR = os.path.join(BASE_DIR, 'replays')
NAMES_DIR = os.path.join(BASE_DIR, 'data', 'names')
NAME_FILES = ('heroes', 'abilities', 'talents', 'items', 'meta')
HEROES_CACHE = os.path.join(BASE_DIR, 'heroes.json')
SERVER_LOG = os.path.join(BASE_DIR, 'server.log')
# clarity 源码仓：默认是本项目的 sibling ../clarity，可用环境变量覆盖
CLARITY_DIR = os.environ.get('DOTA_CHAT_CLARITY_DIR',
                             os.path.join(BASE_DIR, '..', 'clarity'))

_JOBS = {}
_JOBS_LOCK = threading.Lock()
_JOB_SEQ = [0]


def log(msg):
    line = '%s %s' % (time.strftime('%H:%M:%S'), msg)
    try:
        with open(SERVER_LOG, 'a', encoding='utf-8') as f:
            f.write(line + '\n')
    except OSError:
        pass
    sys.stderr.write('dota-chat: ' + line + '\n')


def clean_token(value, label='API Key'):
    """去掉零宽字符与首尾空白，并校验可写入 HTTP 头（仅 ASCII 可见字符）。"""
    if not value:
        return '', None
    cleaned = str(value)
    for zw in ('\u200b', '\u200c', '\u200d', '\ufeff'):
        cleaned = cleaned.replace(zw, '')
    cleaned = cleaned.strip()
    for idx, ch in enumerate(cleaned):
        if not (32 <= ord(ch) <= 126):
            return cleaned, ('%s 第 %d 个字符不是 ASCII（%r），请重新复制粘贴'
                             % (label, idx + 1, ch))
    return cleaned, None

DEFAULT_GO_BASE = 'https://opencode.ai/inference/go/openai/v1'
# MiniMax 国内 / 海外 OpenAI 兼容网关
PROVIDER_BASES = {
    'opencode': DEFAULT_GO_BASE,
    'minimax': os.environ.get('MINIMAX_BASE', 'https://api.minimax.cn/v1'),
}
PROVIDER_NAMES = {'opencode': 'OpenCode Go', 'minimax': 'MiniMax'}
CHAT_PATH = '/chat/completions'
CONNECT_TIMEOUT = 15
READ_TIMEOUT = 300

MIME = {'.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.webmanifest': 'application/manifest+json; charset=utf-8',
        '.woff2': 'font/woff2',
        '.map': 'application/json; charset=utf-8'}


def models_url_for(base):
    base = (base or DEFAULT_GO_BASE).rstrip('/')
    if '/openai/v1' in base:
        return base.replace('/openai/v1', '/v1') + '/models'
    # 兼容直接把 base 配成 .../v1 的服务（如 MiniMax）
    if base.endswith('/v1'):
        return base + '/models'
    return base + '/v1/models'


def chat_url_for(base):
    return (base or DEFAULT_GO_BASE).rstrip('/') + CHAT_PATH


def provider_base(provider):
    return PROVIDER_BASES.get((provider or '').strip(), DEFAULT_GO_BASE)


class Handler(BaseHTTPRequestHandler):
    server_version = 'DotaChat/1.0'

    def log_message(self, fmt, *args):  # 精简日志
        sys.stderr.write('dota-chat: ' + (fmt % args) + '\n')

    # ---------- 静态文件 ----------
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/parse/status':
            qs = urllib.parse.parse_qs(parsed.query)
            jid = (qs.get('job') or [''])[0]
            with _JOBS_LOCK:
                job = _JOBS.get(jid)
            if not job:
                return self.send_json(404, {'error': 'job 不存在或已清理'})
            return self.send_json(200, job)
        if parsed.path == '/api/models':
            return self.handle_models(urllib.parse.parse_qs(parsed.query))
        if parsed.path == '/api/names':
            return self.handle_names(urllib.parse.parse_qs(parsed.query))
        return self.serve_static(parsed.path)

    def handle_names(self, qs):
        """名称表（英雄/技能/天赋/装备）由 tools/names/build.py 生成，前端按需读取。"""
        name = (qs.get('file') or [''])[0]
        if name not in NAME_FILES:
            return self.send_json(404, {'error': '未知名称文件'})
        path = os.path.join(NAMES_DIR, name + '.json')
        if not os.path.isfile(path):
            return self.send_json(404, {
                'error': '名称数据未生成：请先运行 runtime\\python\\python.exe -X utf8 tools\\names\\build.py'
            })
        try:
            with open(path, 'rb') as f:
                body = f.read()
        except OSError as exc:
            return self.send_json(500, {'error': '读取失败: %s' % exc})
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'public, max-age=600')
        self.end_headers()
        self.wfile.write(body)

    def serve_static(self, url_path):
        rel = urllib.parse.unquote(url_path).lstrip('/') or 'index.html'
        root = os.path.realpath(STATIC_DIR)
        candidate = os.path.realpath(os.path.join(root, rel))
        if not candidate.startswith(root):
            return self.send_json(403, {'error': 'forbidden'})
        if os.path.isdir(candidate):
            candidate = os.path.join(candidate, 'index.html')
        if not os.path.isfile(candidate):
            # SPA 路由回退；带扩展名的资源缺失则直接 404
            if '.' in os.path.basename(rel):
                return self.send_json(404, {'error': 'not found: ' + rel})
            candidate = os.path.join(root, 'index.html')
        if not os.path.isfile(candidate):
            return self.send_json(404, {'error': '前端未构建：先执行 ui/npm run build'})
        _, ext = os.path.splitext(candidate)
        try:
            with open(candidate, 'rb') as f:
                body = f.read()
        except OSError as exc:
            return self.send_json(500, {'error': str(exc)})

        # 名称表按 ETag 协商缓存（重新生成后立即可见，未变化时 304 省流量）；
        # 构建产物带内容哈希，可长期缓存；index.html 必须 no-store。
        rel_posix = rel.replace('\\', '/')
        cache_control = 'no-store'
        etag = None
        if rel_posix.startswith('assets/'):
            cache_control = 'public, max-age=31536000, immutable'
        elif rel_posix.startswith('names/'):
            cache_control = 'no-cache'
            etag = '"%x-%x"' % (int(os.path.getmtime(candidate)), len(body))
            # 部分客户端会去掉引号，比较时统一去掉
            incoming = (self.headers.get('If-None-Match') or '').split(',')[0].strip().strip('"')
            if incoming and incoming == etag.strip('"'):
                self.send_response(304)
                self.send_header('ETag', etag)
                self.send_header('Cache-Control', cache_control)
                self.end_headers()
                return
        self.send_response(200)
        self.send_header('Content-Type', MIME.get(ext.lower(), 'application/octet-stream'))
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', cache_control)
        if etag:
            self.send_header('ETag', etag)
        self.end_headers()
        self.wfile.write(body)

    # ---------- 模型列表（供下拉框用，可选鉴权） ----------
    def handle_models(self, qs):
        base = (qs.get('base') or [''])[0] or DEFAULT_GO_BASE
        api_key, key_err = clean_token((qs.get('key') or [''])[0])
        if key_err:
            return self.send_json(400, {'error': key_err})
        url = models_url_for(base)
        headers = {'Accept': 'application/json',
                   'User-Agent': 'TrueSight/0.1 (local)'}
        if api_key:
            headers['Authorization'] = 'Bearer ' + api_key
        try:
            req = urllib.request.Request(url, headers=headers, method='GET')
            with urllib.request.urlopen(req, timeout=CONNECT_TIMEOUT) as resp:
                body = resp.read()
        except Exception as exc:  # noqa: BLE001 - 转成统一错误给前端
            code = getattr(exc, 'code', None) or 502
            detail = getattr(exc, 'read', lambda: b'')()
            try:
                text = detail.decode('utf-8', errors='replace')[:600] if detail else str(exc)
            except Exception:  # noqa: BLE001
                text = str(exc)
            return self.send_json(code, {'error': '拉取模型列表失败: %s' % text})
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    # ---------- AI 对话转发（SSE 透传） ----------
    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path == '/api/stratz':
            return self.handle_stratz()
        if path == '/api/parse':
            return self.handle_parse()
        if path != '/api/chat':
            return self.send_json(404, {'error': 'unknown api'})
        try:
            length = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            return self.send_json(400, {'error': 'bad Content-Length'})
        if length <= 0 or length > 1_000_000:
            return self.send_json(400, {'error': 'body 为空或过大'})
        try:
            payload = json.loads(self.rfile.read(length).decode('utf-8'))
        except (OSError, ValueError, UnicodeDecodeError) as exc:
            return self.send_json(400, {'error': 'body 不是合法 JSON: %s' % exc})

        api_key, key_err = clean_token(payload.get('apiKey'))
        model = (payload.get('model') or '').strip()
        messages = payload.get('messages')
        provider = (payload.get('provider') or 'opencode').strip().lower()
        provider_name = PROVIDER_NAMES.get(provider, provider)
        base = (payload.get('baseUrl') or provider_base(provider)).strip()
        session_id = (payload.get('sessionId') or 'dota-chat-local').strip()
        if key_err:
            return self.send_json(400, {'error': key_err})
        if not api_key:
            return self.send_json(400, {'error': '缺少 apiKey（请在「设置」中填写 %s API Key）' % provider_name})
        if not model or not isinstance(messages, list) or not messages:
            return self.send_json(400, {'error': '缺少 model 或 messages'})

        upstream = {
            'model': model,
            'messages': messages,
            'stream': True,
        }
        if isinstance(payload.get('temperature'), (int, float)):
            upstream['temperature'] = payload['temperature']
        effort = payload.get('reasoning_effort')
        if isinstance(effort, str):
            effort = effort.strip()[:20]
            # '__omit__' = 用户明确选择不传档位；空字符串同样不传
            if effort and effort != '__omit__':
                upstream['reasoning_effort'] = effort
        data = json.dumps(upstream).encode('utf-8')
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': 'Bearer ' + api_key,
            'Connection': 'close',
            'User-Agent': 'TrueSight/0.1',
        }
        if provider == 'opencode':
            # 按 Go 文档要求：自有 UA + 稳定会话 ID
            headers['X-OpenCode-Session'] = session_id
        upstream_resp = None
        last_exc = None
        for attempt in range(3):
            try:
                req = urllib.request.Request(chat_url_for(base), data=data,
                                             headers=headers, method='POST')
                upstream_resp = urllib.request.urlopen(req, timeout=READ_TIMEOUT)
                last_exc = None
                break
            except urllib.error.HTTPError as exc:
                last_exc = exc
                if exc.code in (502, 503, 504) and attempt < 2:
                    log('upstream HTTP %d, retrying (%d/3)' % (exc.code, attempt + 1))
                    time.sleep(0.8 * (attempt + 1))
                    continue
                break
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                log('upstream connect attempt %d failed: %s' % (attempt + 1, exc))
                if attempt < 2:
                    time.sleep(0.8 * (attempt + 1))
                    continue
        if upstream_resp is None and last_exc is not None:
            exc = last_exc
            detail = getattr(exc, 'read', lambda: b'')()
            try:
                detail_text = detail.decode('utf-8', errors='replace')[:2000]
            except Exception:  # noqa: BLE001
                detail_text = str(exc)
            code = getattr(exc, 'code', None)
            if code == 401:
                return self.send_json(401, {'error': '上游 401：API Key 无效或已过期'})
            if code == 429:
                return self.send_json(429, {'error': '上游 429：触发限流/配额，稍后再试'})
            text = str(exc)
            if 'SSL' in text or 'EOF' in text or 'timed out' in text.lower():
                return self.send_json(502, {
                    'error': '无法连接上游（%s）。请检查网络/代理是否稳定、接口地址是否正确，'
                             '然后重试。' % (detail_text or text)
                })
            return self.send_json(502, {'error': '上游请求失败: %s %s' % (code or '', detail_text or text)})

        upstream_type = (upstream_resp.headers.get('Content-Type') or '').lower()
        if 'text/event-stream' not in upstream_type:
            # 个别服务出错时仍回 200 + JSON；不要伪装成 SSE，否则前端会静默拿到空答案
            try:
                raw = upstream_resp.read(4000)
                detail = raw.decode('utf-8', errors='replace')
            except Exception:  # noqa: BLE001
                detail = ''
            finally:
                upstream_resp.close()
            log('%s upstream non-SSE (%s): %s' % (provider_name, upstream_type, detail[:300]))
            return self.send_json(502, {
                'error': '%s 未返回流式响应（%s）：%s' %
                         (provider_name, upstream_type or 'unknown', detail[:800] or '空响应')
            })

        self.send_response(upstream_resp.status or 200)
        self.send_header('Content-Type', 'text/event-stream; charset=utf-8')
        self.send_header('Cache-Control', 'no-cache')
        # SSE 没有 Content-Length，必须关闭连接；否则浏览器可能复用一条
        # 已被服务端关闭的 socket，下一次 POST 会直接 ERR_EMPTY_RESPONSE。
        self.send_header('Connection', 'close')
        self.send_header('X-Accel-Buffering', 'no')
        self.close_connection = True
        self.end_headers()
        try:
            while True:
                chunk = upstream_resp.read1(4096)
                if not chunk:
                    break
                self.wfile.write(chunk)
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass  # 浏览器关了页面，直接结束
        except Exception as exc:  # noqa: BLE001
            log('upstream stream interrupted: %s' % exc)
        finally:
            upstream_resp.close()
            self.close_connection = True

    # ---------- STRATZ GraphQL 转发（浏览器直连会被跨域拦） ----------
    def handle_stratz(self):
        try:
            length = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            return self.send_json(400, {'error': 'bad Content-Length'})
        if length <= 0 or length > 200_000:
            return self.send_json(400, {'error': 'body 为空或过大'})
        try:
            payload = json.loads(self.rfile.read(length).decode('utf-8'))
        except (OSError, ValueError, UnicodeDecodeError) as exc:
            return self.send_json(400, {'error': 'body 不是合法 JSON: %s' % exc})
        token, token_err = clean_token(payload.get('token'), 'STRATZ Token')
        query = payload.get('query')
        if token_err:
            return self.send_json(400, {'error': token_err})
        if not token or not isinstance(query, str):
            return self.send_json(400, {'error': '缺少 token 或 query'})
        body = json.dumps({'query': query, 'variables': payload.get('variables') or {}}).encode('utf-8')
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
            'User-Agent': 'TrueSight/0.1 (local)',
        }
        try:
            req = urllib.request.Request('https://api.stratz.com/graphql', data=body,
                                         headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read()
                status = resp.status
        except Exception as exc:  # noqa: BLE001
            detail = getattr(exc, 'read', lambda: b'')()
            text = detail.decode('utf-8', errors='replace')[:800] if detail else str(exc)
            code = getattr(exc, 'code', 0) or 502
            log('stratz upstream failed: %s %s' % (code, text))
            return self.send_json(502, {'error': 'STRATZ 请求失败 (%s): %s' % (code, text)})
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(raw)

    # ---------- 本地 clarity 深度解析 ----------
    # POST /api/parse {matchId, heroId} -> SSE 进度，最后一条 done 携带完整 JSON
    def handle_parse(self):
        try:
            length = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            return self.send_json(400, {'error': 'bad Content-Length'})
        if length <= 0 or length > 100_000:
            return self.send_json(400, {'error': 'body 为空或过大'})
        try:
            payload = json.loads(self.rfile.read(length).decode('utf-8'))
        except (OSError, ValueError, UnicodeDecodeError) as exc:
            return self.send_json(400, {'error': 'body 不是合法 JSON: %s' % exc})
        # 异步任务：立刻返回 jobId，前端轮询 /api/parse/status（长任务不占 HTTP 连接）
        mid = str(payload.get('matchId') or '').strip()
        if not (mid.isdigit() and payload.get('heroId')):
            return self.send_json(400, {'error': '缺少 matchId / heroId'})
        with _JOBS_LOCK:
            _JOB_SEQ[0] += 1
            jid = 'j%d-%d' % (int(time.time()), _JOB_SEQ[0])
            _JOBS[jid] = {'state': 'running', 'messages': [], 'result': None,
                          'error': None, 'cached': False}
            while len(_JOBS) > 20:
                oldest = sorted(_JOBS, key=lambda k: _JOBS[k].get('started', 0))[0]
                del _JOBS[oldest]
            _JOBS[jid]['started'] = time.time()
        t = threading.Thread(target=_run_parse_job, args=(jid, payload), daemon=True)
        t.start()
        log('job %s started: %s' % (jid, payload))
        return self.send_json(200, {'jobId': jid})

    def run_parse(self, payload):
        mid = str(payload.get('matchId') or '').strip()
        try:
            hero_id = int(payload.get('heroId'))
        except (TypeError, ValueError):
            hero_id = None
        if not (mid.isdigit() and hero_id):
            yield {'error': '缺少 matchId / heroId'}
            return
        os.makedirs(REPLAYS_DIR, exist_ok=True)

        unit = self.hero_unit(hero_id)
        if not unit:
            yield {'error': 'heroId %s 查不到对应英雄' % hero_id}
            return
        safe_unit = ''.join(c if (c.isalnum() or c == '_') else '_' for c in unit)
        bz2_path = os.path.join(REPLAYS_DIR, '%s.dem.bz2' % mid)
        dem_path = os.path.join(REPLAYS_DIR, '%s.dem' % mid)
        out_path = os.path.join(REPLAYS_DIR, '%s-%s.json' % (mid, safe_unit))
        if os.path.isfile(out_path):
            try:
                with open(out_path, encoding='utf-8') as f:
                    result = json.load(f)
                focus = result.get('focus') if isinstance(result, dict) else None
                # Older caches only have purchases.  Re-parse so the UI gets the
                # exact replay inventory (items/sells) instead of the Heuristic.
                # Lone Druid caches from before bear snapshots are also stale:
                # re-parse those so the Spirit Bear's 6+1+3 inventory is available.
                bear_ok = True
                if isinstance(focus, dict) and focus.get('unit') == 'npc_dota_hero_lone_druid':
                    bear_items = focus.get('bearItems')
                    bear_ok = isinstance(bear_items, list) and len(bear_items) > 0
                if result.get('schema') == 8 and isinstance(focus, dict) \
                        and isinstance(result.get('build'), int) \
                        and isinstance(focus.get('items'), list) \
                        and isinstance(focus.get('uses'), list) \
                        and isinstance(focus.get('wardPlacements'), list) \
                        and isinstance(focus.get('sells'), list) \
                        and isinstance(focus.get('removed'), list) \
                        and bear_ok:
                    yield {'done': True, 'cached': True, 'result': result}
                    return
            except (OSError, ValueError):
                pass  # 缓存坏了就重跑

        if os.path.isfile(dem_path) and os.path.getsize(dem_path) > 1_000_000:
            yield {'stage': 'download', 'msg': '本地已有回放文件，跳过下载', 'progress': 1}
        else:
            yield {'stage': 'resolve', 'msg': '查询 OpenDota 获取回放地址…'}
            meta = self.od_match(mid)
            salt = (meta or {}).get('replay_salt')
            url = (meta or {}).get('replay_url')
            if not salt or not url:
                yield {'stage': 'request', 'msg': 'OpenDota 暂无回放，已提交拉取请求，等待中（最长约 8 分钟）…'}
                if not self.od_request(mid):
                    yield {'error': '提交回放拉取请求失败'}
                    return
                for k in range(32):
                    time.sleep(15)
                    meta = self.od_match(mid)
                    salt = (meta or {}).get('replay_salt')
                    url = (meta or {}).get('replay_url')
                    if salt and url:
                        break
                    if k % 4 == 3:
                        yield {'stage': 'request', 'msg': '等待回放中…（已等 %d 秒）' % ((k + 1) * 15)}
                if not salt or not url:
                    yield {'error': '等待超时：回放还没拉到，稍后再试'}
                    return
            yield {'stage': 'download', 'msg': '下载回放…', 'progress': 0}
            try:
                self.download(url, bz2_path)
            except Exception as exc:  # noqa: BLE001
                yield {'error': '回放下载失败: %s' % exc}
                return
            yield {'stage': 'download', 'msg': '下载完成', 'progress': 1}

            yield {'stage': 'decompress', 'msg': '解压中…'}
            try:
                self.decompress(bz2_path, dem_path)
            except Exception as exc:  # noqa: BLE001
                yield {'error': '解压失败: %s' % exc}
                return

        yield {'stage': 'parse', 'msg': 'clarity 解析中（回放越大越慢，一般几十秒）…'}
        try:
            result = self.run_clarity(dem_path, unit)
        except Exception as exc:  # noqa: BLE001
            yield {'error': 'clarity 解析失败: %s' % exc}
            return
        try:
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False)
        except OSError:
            pass
        yield {'done': True, 'cached': False, 'result': result}

    # ----- 小工具 -----
    @staticmethod
    def od_get(path, timeout=30):
        req = urllib.request.Request('https://api.opendota.com' + path,
                                     headers={'User-Agent': 'dota-chat/1.0'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)

    def od_match(self, mid):
        try:
            d = self.od_get('/api/matches/' + mid)
            return d if isinstance(d, dict) and d.get('match_id') else None
        except Exception:  # noqa: BLE001
            return None

    def od_request(self, mid):
        try:
            req = urllib.request.Request('https://api.opendota.com/api/request/' + mid,
                                         data=b'', method='POST',
                                         headers={'User-Agent': 'dota-chat/1.0'})
            with urllib.request.urlopen(req, timeout=30):
                return True
        except Exception:  # noqa: BLE001
            return False

    def hero_unit(self, hero_id):
        """dotaconstants heroes.json：id -> npc_dota_hero_*，本地缓存。"""
        heroes = None
        if os.path.isfile(HEROES_CACHE):
            try:
                with open(HEROES_CACHE, encoding='utf-8') as f:
                    heroes = json.load(f)
            except (OSError, ValueError):
                heroes = None
        if heroes is None:
            for cdn in ('https://cdn.jsdelivr.net/gh/odota/dotaconstants@master/build/heroes.json',
                        'https://raw.githubusercontent.com/odota/dotaconstants/master/build/heroes.json'):
                try:
                    req = urllib.request.Request(cdn, headers={'User-Agent': 'dota-chat/1.0'})
                    with urllib.request.urlopen(req, timeout=60) as r:
                        heroes = json.load(r)
                    with open(HEROES_CACHE, 'w', encoding='utf-8') as f:
                        json.dump(heroes, f, ensure_ascii=False)
                    break
                except Exception:  # noqa: BLE001
                    continue
        if not isinstance(heroes, dict):
            return None
        v = heroes.get(str(hero_id))
        return v.get('name') if isinstance(v, dict) else None

    @staticmethod
    def download(url, dest):
        req = urllib.request.Request(url, headers={'User-Agent': 'dota-chat/1.0'})
        total = 0
        got = 0
        with urllib.request.urlopen(req, timeout=60) as r, open(dest, 'wb') as f:
            try:
                total = int(r.headers.get('Content-Length') or 0)
            except ValueError:
                total = 0
            while True:
                chunk = r.read(1 << 20)
                if not chunk:
                    break
                f.write(chunk)
                got += len(chunk)
        return total, got

    @staticmethod
    def decompress(src, dst):
        with open(src, 'rb') as f:
            raw = f.read(4)
        with open(src, 'rb') as f:
            data = f.read()
        if raw[:4] == bytes.fromhex('28b52ffd'):
            try:
                import compression.zstd as zstd
            except ImportError as exc:
                raise RuntimeError('需要 zstd 解压（Python 缺少 compression.zstd）: %s' % exc)
            out = zstd.ZstdDecompressor().decompress(data)
        elif raw[:3] == b'BZh':
            import bz2
            out = bz2.decompress(data)
        else:
            raise RuntimeError('未知压缩格式')
        with open(dst, 'wb') as f:
            f.write(out)

    @staticmethod
    def java_bin():
        exe = 'java.exe' if os.name == 'nt' else 'java'
        for root in (os.path.join(BASE_DIR, 'jre'), os.path.join(BASE_DIR, 'runtime', 'jre')):
            p = os.path.join(root, 'bin', exe)
            if os.path.isfile(p):
                return p
        home = os.environ.get('JAVA_HOME', '')
        if home and os.path.isfile(os.path.join(home, 'bin', exe)):
            return os.path.join(home, 'bin', exe)
        return 'java'

    def run_clarity(self, dem_path, unit):
        java = self.java_bin()
        cp = self.clarity_cp()
        main_cls = 'skadistats.clarity.bench.MatchJsonMain'
        # clarity 用 snappy 解压录像；snappy-java 会把 native dll 写到
        # java.io.tmpdir。如果服务从没有 TEMP/TMP 的环境启动，Windows 会回退到
        # C:\Windows\System32 并报“拒绝访问”，最终表现为 no snappyjava in
        # java.library.path。这里显式指到项目内可写目录，避免依赖父进程环境。
        tmp_dir = os.path.join(BASE_DIR, '.cache', 'tmp')
        snappy_dir = os.path.join(BASE_DIR, '.cache', 'snappy')
        for path in (tmp_dir, snappy_dir):
            try:
                os.makedirs(path, exist_ok=True)
                probe = os.path.join(path, '.write-test')
                with open(probe, 'w', encoding='utf-8') as f:
                    f.write('ok')
                os.remove(probe)
            except OSError as exc:
                raise RuntimeError('解析临时目录不可写: %s (%s)' % (path, exc))
        proc = subprocess.run(
            [java, '-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8',
             '-Djava.io.tmpdir=' + tmp_dir,
             '-Dorg.xerial.snappy.tempdir=' + snappy_dir,
             '-cp', cp, main_cls, dem_path, unit],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=900)
        if proc.returncode != 0:
            err = (proc.stderr or b'').decode('utf-8', errors='replace')
            if len(err) > 4000:
                err = err[:2000] + '\n…\n' + err[-2000:]
            raise RuntimeError('java 退出码 %d：%s' % (proc.returncode, err or '无错误输出'))
        try:
            return json.loads(proc.stdout.decode('utf-8'))
        except ValueError as exc:
            raise RuntimeError('解析输出不是合法 JSON: %s' % exc)

    _cp_cache = None

    def clarity_cp(self):
        """classes dir + lib/ 下的 clarity 运行时（缺省回退 sibling 仓库 + gradle 缓存）。"""
        if type(self)._cp_cache:
            return type(self)._cp_cache
        parts = [os.path.join(BASE_DIR, 'classes')]
        local = sorted(glob.glob(os.path.join(BASE_DIR, 'lib', '*.jar')))
        if local:
            parts += local
        else:
            clar = os.path.join(CLARITY_DIR, 'build', 'libs')
            if os.path.isdir(clar):
                parts += sorted(glob.glob(os.path.join(clar, 'clarity-5*.jar')))
            cache = os.path.expanduser(r'~\.gradle\caches\modules-2\files-2.1')
            if os.name != 'nt':
                cache = os.path.expanduser('~/.gradle/caches/modules-2/files-2.1')
            wants = ['clarity-protobuf-7', 'snappy-java-1.1.10.7', 'slf4j-api-2.0.17',
                     'fastutil-core-8']
            if os.path.isdir(cache):
                for root, _, files in os.walk(cache):
                    for fn in files:
                        if fn.endswith('.jar') and not fn.endswith('-sources.jar') \
                                and not fn.endswith('-javadoc.jar') \
                                and any(fn.startswith(w) for w in wants):
                            parts.append(os.path.join(root, fn))
        # 去重保序
        seen, uniq = set(), []
        for p in parts:
            if p not in seen:
                seen.add(p)
                uniq.append(p)
        have_jar = any(os.path.basename(p).startswith('clarity-5') and os.path.isfile(p)
                       for p in uniq)
        if not os.path.isdir(os.path.join(BASE_DIR, 'classes')) or not have_jar:
            raise RuntimeError('找不到 clarity 产物：需要 dota-chat/classes、dota-chat/lib/*.jar，'
                               '以及 Java 21+ 运行时')
        type(self)._cp_cache = os.pathsep.join(uniq)
        return type(self)._cp_cache

    def send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)


def _job_append(jid, msg):
    with _JOBS_LOCK:
        job = _JOBS.get(jid)
        if job is None:
            return False
        if msg.get('done'):
            job['state'] = 'done'
            job['result'] = msg.get('result')
            job['cached'] = bool(msg.get('cached'))
        elif msg.get('error'):
            job['state'] = 'error'
            job['error'] = msg['error']
        else:
            job['messages'].append(msg.get('msg', msg.get('stage', '')))
        job['updated'] = time.time()
        return True


def _run_parse_job(jid, payload):
    # 后台线程驱动同一个 run_parse 生成器；Handler 方法不碰 request 对象，可安全复用。
    h = Handler.__new__(Handler)
    log('job %s: thread started' % jid)
    try:
        for msg in h.run_parse(payload):
            log('job %s: %s' % (jid, msg.get('stage') or msg.get('done') and 'done'
                                or msg.get('error') or '?'))
            _job_append(jid, msg)
            if msg.get('done') or msg.get('error'):
                break
    except Exception as exc:  # noqa: BLE001
        log('job %s: EXCEPTION %s' % (jid, exc))
        _job_append(jid, {'error': '内部错误: %s' % exc})
    log('job %s: thread finished' % jid)


def main(argv):
    port = 8077
    if len(argv) > 1:
        try:
            port = int(argv[1])
        except ValueError:
            print('用法: python server.py [端口]', file=sys.stderr)
            return 2
    if not os.path.isdir(STATIC_DIR):
        print('缺少前端产物：请先执行 ui/npm install && ui/npm run build', file=sys.stderr)
        return 2
    httpd = ThreadingHTTPServer(('127.0.0.1', port), Handler)
    print('TrueSight 已启动： http://127.0.0.1:%d' % port)
    print('静态目录：%s' % STATIC_DIR)
    print('按 Ctrl+C 停止。API Key 只保存在你的浏览器里，本服务不存储。')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
