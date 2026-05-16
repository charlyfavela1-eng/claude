import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, '.seedance-config.json');

app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

// ──── CONFIG (API key stored server-side) ────

function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch { return {}; }
}

function writeConfig(data) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

// GET /api/config — returns config without exposing the full key
app.get('/api/config', (_req, res) => {
  const cfg = readConfig();
  res.json({
    provider: cfg.provider || 'atlascloud',
    model:    cfg.model    || 'bytedance/seedance-2.0/text-to-video',
    url:      cfg.url      || '',
    hasKey:   !!(cfg.key && cfg.key.length > 5),
    keyHint:  cfg.key ? cfg.key.slice(0, 4) + '…' + cfg.key.slice(-4) : '',
  });
});

// POST /api/config — save full config including key
app.post('/api/config', (req, res) => {
  const { provider, key, url, model } = req.body;
  if (!key || key.length < 5) return res.status(400).json({ error: 'API key inválida' });
  writeConfig({ provider, key, url, model });
  res.json({ ok: true, keyHint: key.slice(0, 4) + '…' + key.slice(-4) });
});

// DELETE /api/config — remove saved key
app.delete('/api/config', (_req, res) => {
  try { fs.unlinkSync(CONFIG_FILE); } catch { /* already gone */ }
  res.json({ ok: true });
});

// ──── PROXY HELPERS ────

// Atlas Cloud endpoints (from official docs)
const ATLAS_GENERATE = 'https://api.atlascloud.ai/api/v1/model/generateVideo';
const ATLAS_STATUS   = 'https://api.atlascloud.ai/api/v1/model/taskStatus';

function getEndpoint(provider, customUrl) {
  if (provider === 'atlascloud') return ATLAS_GENERATE;
  if (provider === 'volcengine') return 'https://ark.cn-beijing.volces.com/api/v3/video/generation';
  return (customUrl || 'https://api.byteplus.com') + '/v1/video/generation';
}

function buildBody(provider, model, params, imgB64) {
  const { prompt, duration, resolution, aspect_ratio, camera_motion } = params;
  const dur = Math.min(Math.max(parseInt(duration) || 5, 4), 15);

  if (provider === 'atlascloud') {
    // Switch model based on whether an image is provided
    const atlasModel = imgB64
      ? 'bytedance/seedance-2.0/image-to-video'
      : 'bytedance/seedance-2.0/text-to-video';
    const b = {
      model: atlasModel,
      prompt,
      duration: dur,
      resolution: resolution || '720p',
      ratio: aspect_ratio || 'adaptive',
      generate_audio: true,
      watermark: false,
      return_last_frame: false,
    };
    if (imgB64) b.image = imgB64;
    return b;
  }
  if (provider === 'volcengine') {
    const b = { model: 'dreamina-' + model, prompt, duration: dur, aspect_ratio };
    if (imgB64) b.image = imgB64;
    return b;
  }
  // byteplus
  const b = { model, req_key: 'seedance_video_01', prompt, duration: dur, resolution, aspect_ratio };
  if (resolution === '2k') b.scale = 2;
  if (camera_motion) b.camera_motion = camera_motion;
  if (imgB64) {
    if (imgB64.startsWith('http')) b.image_url = imgB64;
    else b.image = imgB64;
  }
  return b;
}

// ──── POST /api/generate — start generation ────
app.post('/api/generate', async (req, res) => {
  const cfg = readConfig();
  if (!cfg.key) return res.status(401).json({ error: 'No hay API key configurada. Ábrela en Configuración.' });

  const { prompt, image, duration, resolution, aspect_ratio, camera_motion } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt requerido' });

  const endpoint = getEndpoint(cfg.provider, cfg.url);
  const headers  = { 'Authorization': 'Bearer ' + cfg.key, 'Content-Type': 'application/json' };
  const body     = buildBody(cfg.provider, cfg.model, { prompt, duration, resolution, aspect_ratio, camera_motion }, image);

  try {
    const upstream = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    const text = await upstream.text();
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `API error ${upstream.status}`, detail: text.slice(0, 300) });
    }
    let data;
    try { data = JSON.parse(text); } catch { return res.status(502).json({ error: 'Respuesta no es JSON', detail: text.slice(0, 200) }); }
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'No se pudo contactar la API', detail: e.message });
  }
});

// ──── GET /api/status/:taskId — poll task ────
app.get('/api/status/:taskId', async (req, res) => {
  const cfg = readConfig();
  if (!cfg.key) return res.status(401).json({ error: 'Sin API key' });

  const headers = { 'Authorization': 'Bearer ' + cfg.key };
  let url;
  if (cfg.provider === 'atlascloud') {
    url = `${ATLAS_STATUS}?task_id=${req.params.taskId}`;
  } else if (cfg.provider === 'volcengine') {
    url = `https://ark.cn-beijing.volces.com/api/v3/video/${req.params.taskId}`;
  } else {
    url = `${cfg.url || 'https://api.byteplus.com'}/v1/video/generation/${req.params.taskId}`;
  }

  try {
    const upstream = await fetch(url, { headers });
    const text = await upstream.text();
    if (!upstream.ok) return res.status(upstream.status).json({ error: text.slice(0, 200) });
    let data;
    try { data = JSON.parse(text); } catch { return res.status(502).json({ error: 'Respuesta no es JSON' }); }
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ──── GET /api/verify — test connection ────
app.get('/api/verify', async (req, res) => {
  const cfg = readConfig();
  if (!cfg.key) return res.status(401).json({ ok: false, error: 'Sin API key configurada' });

  const endpoint = getEndpoint(cfg.provider, cfg.url);
  const headers  = { 'Authorization': 'Bearer ' + cfg.key, 'Content-Type': 'application/json' };
  const body     = buildBody(cfg.provider, cfg.model, { prompt: 'test', duration: 5, resolution: '720p', aspect_ratio: 'adaptive' }, null);

  try {
    const upstream = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    if (upstream.status === 401 || upstream.status === 403) {
      return res.json({ ok: false, error: `Auth fallida (${upstream.status}): API key inválida` });
    }
    // 400/422 = key válida pero parámetros mínimos rechazados — eso está bien para un ping
    if ([200, 201, 202, 400, 422].includes(upstream.status)) {
      return res.json({ ok: true, status: upstream.status });
    }
    const txt = await upstream.text();
    res.json({ ok: false, error: `HTTP ${upstream.status}`, detail: txt.slice(0, 200) });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Seedance Studio → http://localhost:${PORT}\n`);
});
