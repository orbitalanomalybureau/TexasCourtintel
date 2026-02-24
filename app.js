const LS_NOTES = 'txCourtIntel.notes.v1';
const LS_SETTINGS = 'txCourtIntel.settings.v1';
const DISCLAIMER_TEXT = 'This is public information only. Not legal advice. Consult a licensed attorney for advice regarding your case.';
const LS_AUTH = 'txCourtIntel.auth.v1';
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:8010/api'
  : 'https://api.texascourtintel.com/api';
let data;
let currentCounty = null;
let currentCourt = null;
let token = null;
let currentUser = null;
let newsRefreshTimer = null;
let tickerRefreshTimer = null;
const newsCache = new Map();

function applyTickerSettings() {
  const s = getSettings();
  const wrap = el('legalTickerWrap');
  const track = el('legalTickerTrack');
  if (!wrap || !track) return;
  wrap.style.display = s.tickerEnabled === false ? 'none' : '';
  wrap.classList.toggle('bottom-fixed', (s.tickerPosition || 'top') === 'bottom');
  track.classList.remove('speed-slow', 'speed-normal', 'speed-fast');
  track.classList.add(`speed-${s.tickerSpeed || 'normal'}`);
}

function setLegalTicker(text) {
  const node = el('legalTickerText');
  if (!node) return;
  node.textContent = text || 'Live Legal Intelligence: monitoring updates.';
}

async function loadStatewideTickerNews(force = false) {
  const settings = getSettings();
  const provider = settings.newsProvider || 'google_rss';
  const q = 'Texas courts legal news judges rulings filings';
  const key = `${provider}::statewide-ticker`;
  const cached = newsCache.get(key);
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;
  if (!force && cached && now - cached.ts < ttlMs) {
    setLegalTicker(cached.text);
    return;
  }
  try {
    const out = await api(`/news/texas-courts?q=${encodeURIComponent(q)}&limit=16&provider=${encodeURIComponent(provider)}`);
    if (!out.items?.length) return;
    const ranked = rankAndFilterNews(out.items, q, !!settings.newsWhitelistOnly).slice(0, 6);
    const tickerLine = ranked.map(n => `${n.title} (${n.source || 'source'})`).join('   •   ');
    const text = `Texas Legal Wire: ${tickerLine}`;
    setLegalTicker(text);
    newsCache.set(key, { ts: now, text });
  } catch {
    setLegalTicker('Texas Legal Wire: feed temporarily unavailable — retrying shortly.');
  }
}

async function loadCourtTickerNews(force = false) {
  if (!currentCounty || !currentCourt) {
    setLegalTicker('Live Legal Intelligence: Select a county and court to load court-specific headlines.');
    return;
  }
  const settings = getSettings();
  const provider = settings.newsProvider || 'google_rss';
  const q = `${currentCounty.name} ${currentCourt.name} ${val(currentCourt.judge)} Texas court`;
  const key = `${provider}::court-ticker::${q.toLowerCase()}`;
  const cached = newsCache.get(key);
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000;
  if (!force && cached && now - cached.ts < ttlMs) {
    setLegalTicker(cached.text);
    return;
  }
  try {
    const out = await api(`/news/texas-courts?q=${encodeURIComponent(q)}&limit=12&provider=${encodeURIComponent(provider)}`);
    if (!out.items?.length) {
      setLegalTicker(`Court Wire: ${currentCounty.name} • ${currentCourt.name} — no fresh headlines right now.`);
      return;
    }
    const ranked = rankAndFilterNews(out.items, q, !!settings.newsWhitelistOnly).slice(0, 5);
    const tickerLine = ranked.map(n => `${n.title} (${n.source || 'source'})`).join('   •   ');
    const text = `Court Wire: ${currentCounty.name} • ${currentCourt.name} • ${tickerLine}`;
    setLegalTicker(text);
    newsCache.set(key, { ts: now, text });
  } catch {
    setLegalTicker('Court Wire: feed temporarily unavailable — retrying shortly.');
  }
}

function startTickerAutoRefresh() {
  if (tickerRefreshTimer) clearInterval(tickerRefreshTimer);
  const run = () => (getSettings().tickerScope === 'court' ? loadCourtTickerNews(false) : loadStatewideTickerNews(false));
  if (getSettings().tickerScope === 'court') loadCourtTickerNews(true);
  else loadStatewideTickerNews(true);
  tickerRefreshTimer = setInterval(run, 5 * 60 * 1000);
}

const el = (id) => document.getElementById(id);
const val = (f) => (typeof f === 'object' && f?.value ? f.value : (f || 'TBD'));
const src = (f) => (typeof f === 'object' ? (f.source || '') : '');

function freshnessLabel(dateStr) {
  if (!dateStr) return 'freshness: unknown';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return 'freshness: unknown';
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'reviewed today';
  if (days === 1) return 'reviewed 1 day ago';
  return `reviewed ${days} days ago`;
}

function isVerifiedAttorney() {
  return (currentUser?.verification_status || 'unverified') === 'verified';
}

function hasTier(required) {
  const order = { core: 1, pro: 2, premium: 3 };
  const current = getSettings().subscriptionTier || 'core';
  const tierOk = (order[current] || 1) >= (order[required] || 1);
  if (required === 'premium') {
    return tierOk && isVerifiedAttorney();
  }
  return tierOk;
}

function getNotes() { return JSON.parse(localStorage.getItem(LS_NOTES) || '{}'); }
function setNotes(x) { localStorage.setItem(LS_NOTES, JSON.stringify(x)); }
function getSettings() { return JSON.parse(localStorage.getItem(LS_SETTINGS) || '{"newsProvider":"google_rss","newsWhitelistOnly":true,"subscriptionTier":"core","tickerEnabled":true,"tickerScope":"statewide","tickerPosition":"top","tickerSpeed":"normal"}'); }
function setSettings(x) { localStorage.setItem(LS_SETTINGS, JSON.stringify(x)); }
function getAuth() { return JSON.parse(localStorage.getItem(LS_AUTH) || 'null'); }
function setAuth(x) { localStorage.setItem(LS_AUTH, JSON.stringify(x)); }
function clearAuth() { localStorage.removeItem(LS_AUTH); }

function rankAndFilterNews(items, query, whitelistOnly) {
  const trusted = ['reuters', 'apnews', 'texastribune', 'dallasnews', 'houstonchronicle', 'courts', 'uscourts', 'gov', 'law'];
  const q = (query || '').toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = (items || []).map(it => {
    const title = (it.title || '').toLowerCase();
    const link = (it.link || '').toLowerCase();
    const source = (it.source || '').toLowerCase();
    let score = 0;
    tokens.forEach(t => { if (title.includes(t)) score += 2; if (source.includes(t)) score += 3; });
    if (/judge|court|district|county|texas/.test(title)) score += 3;
    if (trusted.some(s => source.includes(s) || link.includes(s))) score += 4;
    return { ...it, _score: score };
  });

  const filtered = whitelistOnly
    ? scored.filter(it => trusted.some(s => (it.source || '').toLowerCase().includes(s) || (it.link || '').toLowerCase().includes(s)))
    : scored;

  return filtered.sort((a, b) => b._score - a._score);
}
function noteKey(countyId, courtId, user) { return `${countyId}::${courtId}::${(user||'').trim().toLowerCase()}`; }

async function api(path, opts = {}) {
  const headers = opts.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function loadData() {
  const res = await fetch('./data/courts.json');
  return res.json();
}

function setAuthStatus(msg) { el('authStatus').textContent = msg; }

function renderVerificationStatus() {
  const badge = el('verificationStatus');
  if (!badge) return;
  const status = currentUser?.verification_status || 'unverified';
  badge.textContent = `Verification: ${status}`;

  const premiumGate = el('premiumGateMsg');
  if (premiumGate) {
    premiumGate.textContent = isVerifiedAttorney()
      ? 'Premium features unlocked (verification complete).'
      : 'Premium features are visible only to verified attorneys.';
  }

  if (currentCourt && currentCounty) {
    renderCourt(currentCounty.id, currentCourt);
  }
}

async function submitVerification() {
  if (!token) return alert('Please login first.');
  const bar_number = (el('barNumber')?.value || '').trim();
  const jurisdiction = (el('jurisdiction')?.value || '').trim();
  if (!bar_number || !jurisdiction) return alert('Enter bar number and jurisdiction.');

  try {
    const out = await api('/auth/verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bar_number, jurisdiction })
    });
    currentUser = { ...currentUser, ...out };
    renderVerificationStatus();
    alert('Verification submitted. Status set to pending.');
  } catch (e) {
    alert(`Verification submit failed: ${e.message}`);
  }
}

async function loadPlans() {
  try {
    const out = await api('/billing/plans');
    const plans = out?.plans || [];
    el('plansList').innerHTML = plans.map(p => `<div><strong>${p.name}</strong> - $${p.price_monthly}/mo<br/>${(p.features||[]).join(' • ')}</div><hr/>`).join('');
  } catch {
    el('plansList').textContent = 'Plans unavailable right now.';
  }
}

async function openCheckout(plan) {
  try {
    const links = await api('/billing/checkout-links');
    const url = plan === 'pro' ? links.pro : links.premium;
    if (!url) return alert(`Checkout link for ${plan} not set yet.`);
    window.open(url, '_blank');
  } catch (e) {
    alert(`Unable to open checkout: ${e.message}`);
  }
}

async function login() {
  const username = el('loginUser').value.trim();
  const password = el('loginPass').value;
  if (!username || !password) return alert('Enter username and password.');
  try {
    const out = await api('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    token = out.access_token;
    currentUser = {
      username,
      role: out.role,
      verification_status: out.verification_status || 'unverified',
      bar_number: out.bar_number || null,
      jurisdiction: out.jurisdiction || null,
      attestation_ts: out.attestation_ts || null
    };
    setAuth({ token, currentUser });
    setAuthStatus(`Logged in as ${username} (${out.role})`);
    renderVerificationStatus();
  } catch (e) {
    setAuthStatus('Login failed');
    alert(`Login failed: ${e.message}`);
  }
}

function logout() {
  token = null;
  currentUser = null;
  clearAuth();
  setAuthStatus('Not logged in');
  renderVerificationStatus();
}

function renderCounty(county) {
  const card = el('countyCard');
  currentCounty = county;
  if (!county) return card.classList.add('hidden');
  card.innerHTML = `<h3>${county.name} County <span class='badge'>County Profile</span></h3>
    <div class='linkrow'>
      ${county.localRulesUrl ? `<a target='_blank' href='${county.localRulesUrl}'>Local Rules</a>` : '<span class="small">Local rules link not set</span>'}
      ${county.holidayCalendarUrl ? `<a target='_blank' href='${county.holidayCalendarUrl}'>County Court Holidays</a>` : '<span class="small">Holiday calendar link not set</span>'}
      ${county.officialSite ? `<a target='_blank' href='${county.officialSite}'>County Website</a>` : ''}
    </div>
    <p><strong>Demographics:</strong> ${county.demographicsBlurb || 'TBD'}</p>
    <p><strong>Political context:</strong> ${county.politicalBlurb || 'TBD'}</p>
    <p class='small'>Last reviewed: ${county.lastReviewed || 'TBD'} • ${freshnessLabel(county.lastReviewed || '')}</p>`;
  card.classList.remove('hidden');
}

function judgeNewsLink(judgeName, countyName) {
  const q = encodeURIComponent(`${judgeName} ${countyName} Texas court`);
  return `https://news.google.com/search?q=${q}`;
}

async function renderFeedbackList() {
  if (!currentCounty || !currentCourt) return;
  const box = el('feedbackList');
  try {
    const fb = await api(`/feedback?court_id=${encodeURIComponent(currentCourt.id)}&include_pending=false`);
    if (!fb.length) { box.textContent = 'No approved feedback entries yet.'; return; }
    box.innerHTML = fb.map((x,i)=>`<div>${i+1}. ${x.created_at} ${x.user_name?`- ${x.user_name}`:''} ${x.rating?`(Rating: ${x.rating}/5)`:''}<br/>${x.body}</div><hr/>`).join('');
  } catch {
    box.textContent = 'Feedback unavailable (start backend to enable).';
  }
}

function renderCourt(countyId, court) {
  const card = el('courtCard');
  const notesPanel = el('notesPanel');
  const feedbackPanel = el('feedbackPanel');
  const newsPanel = el('newsPanel');
  const carrierPanel = el('carrierReportPanel');
  const county = data.counties.find(c => c.id === countyId);
  currentCourt = court;
  if (!court) {
    if (newsRefreshTimer) { clearInterval(newsRefreshTimer); newsRefreshTimer = null; }
    card.classList.add('hidden');
    notesPanel.classList.add('hidden');
    feedbackPanel.classList.add('hidden');
    newsPanel.classList.add('hidden');
    carrierPanel.classList.add('hidden');
    startTickerAutoRefresh();
    return;
  }

  const jn = val(court.judge);
  const newsUrl = jn && jn !== 'TBD' ? judgeNewsLink(jn, county?.name || '') : null;

  card.innerHTML = `<h3>${court.name} <span class='badge'>Court Profile</span></h3>
    ${court.judgePhotoUrl ? `<img class='judge-photo' src='${court.judgePhotoUrl}' alt='Official photo for ${jn}' />` : ''}
    <div class='linkrow'>
      ${court.courtWebsite ? `<a target='_blank' href='${court.courtWebsite}'>Court Website</a>` : ''}
      ${court.liveStreamUrl ? `<a target='_blank' href='${court.liveStreamUrl}'>Live Stream</a>` : '<span class="small">No livestream link yet</span>'}
      ${newsUrl ? `<a target='_blank' href='${newsUrl}'>Current Judge News</a>` : ''}
    </div>
    <p><strong>Judge:</strong> ${jn} ${src(court.judge)?`<span class='small'>[source: <a target='_blank' href='${src(court.judge)}'>link</a>]</span>`:''}</p>
    <p><strong>Judge profile:</strong> ${court.judgeProfileBlurb || 'TBD'}</p>
    <p><strong>Judge political context:</strong> ${court.judgePoliticalBlurb || 'TBD'}</p>
    <p><strong>Coordinator:</strong> ${val(court.coordinator)}</p>
    <p><strong>Bailiff:</strong> ${val(court.bailiff)}</p>
    <p><strong>Public notes:</strong> ${court.publicInfo || 'TBD'}</p>
    <p class='small'>Last reviewed: ${court.lastReviewed || 'TBD'} • ${freshnessLabel(court.lastReviewed || '')}</p>`;
  card.classList.remove('hidden');
  notesPanel.classList.remove('hidden');
  feedbackPanel.classList.remove('hidden');
  newsPanel.classList.remove('hidden');
  if (hasTier('premium')) {
    carrierPanel.classList.remove('hidden');
  } else {
    carrierPanel.classList.add('hidden');
  }
  hydrateAdmin(court);
  renderFeedbackList();
  el('newsList').textContent = 'Loading Texas court headlines...';
  loadRealtimeNews(true);
  startNewsAutoRefresh();
  startTickerAutoRefresh();
}

function hydrateAdmin(court) {
  el('adminJudge').value = val(court.judge) || '';
  el('adminJudgeSource').value = src(court.judge) || '';
  el('adminJudgeProfile').value = court.judgeProfileBlurb || '';
  el('adminJudgePolitical').value = court.judgePoliticalBlurb || '';
  el('adminJudgePhoto').value = court.judgePhotoUrl || '';
  el('adminCoord').value = val(court.coordinator) || '';
  el('adminCoordSource').value = src(court.coordinator) || '';
  el('adminBailiff').value = val(court.bailiff) || '';
  el('adminBailiffSource').value = src(court.bailiff) || '';
  el('adminCourtUrl').value = court.courtWebsite || '';
  el('adminLiveStreamUrl').value = court.liveStreamUrl || '';
  el('adminPublicInfo').value = court.publicInfo || '';
  el('adminVerified').value = court.lastReviewed || '';
}

function refreshCourtOptions() {
  const countyId = el('countySelect').value;
  const county = data.counties.find(c => c.id === countyId);
  const courtSelect = el('courtSelect');
  const q = (el('searchInput').value || '').toLowerCase().trim();
  courtSelect.innerHTML = `<option value=''>Select court...</option>`;
  if (!county) { courtSelect.disabled = true; return; }
  const filtered = county.courts.filter(c => c.name.toLowerCase().includes(q));
  filtered.forEach(c => {
    const o = document.createElement('option'); o.value = String(c.id); o.textContent = c.name; courtSelect.appendChild(o);
  });
  if (!filtered.length) {
    const o = document.createElement('option');
    o.value = '';
    o.textContent = 'No matching courts';
    o.disabled = true;
    courtSelect.appendChild(o);
  }
  courtSelect.disabled = false;
}

function runGlobalSearch() {
  const q = (el('globalSearchInput').value || '').toLowerCase().trim();
  const box = el('globalSearchResults');
  if (!q) { box.classList.add('hidden'); box.innerHTML = ''; return; }
  const hits = [];
  for (const county of data.counties) {
    if (county.name.toLowerCase().includes(q)) hits.push({ countyId: county.id, courtId: null, label: `${county.name} County` });
    for (const court of county.courts) {
      if (court.name.toLowerCase().includes(q) || val(court.judge).toLowerCase().includes(q)) {
        hits.push({ countyId: county.id, courtId: court.id, label: `${county.name} • ${court.name} • ${val(court.judge)}` });
      }
    }
  }
  box.innerHTML = hits.length ? hits.map((h,i)=>`<div class='search-item' data-i='${i}'>${h.label}</div>`).join('') : `<div class='search-item'>No results</div>`;
  box.classList.remove('hidden');
  box.querySelectorAll('.search-item[data-i]').forEach(node => node.addEventListener('click', () => {
    const h = hits[Number(node.getAttribute('data-i'))];
    el('countySelect').value = h.countyId;
    const county = data.counties.find(c=>c.id===h.countyId);
    renderCounty(county); refreshCourtOptions();
    if (h.courtId) {
      el('courtSelect').value = h.courtId;
      renderCourt(h.countyId, county.courts.find(c=>c.id===h.courtId));
    }
    box.classList.add('hidden');
  }));
}

async function saveFeedbackEntry() {
  if (!currentCounty || !currentCourt) return alert('Select a county/court first.');
  const body = (el('feedbackBody').value || '').trim();
  if (!body) return alert('Enter feedback text.');
  const user_name = (el('feedbackUser').value || '').trim() || null;
  const ratingRaw = (el('feedbackRating').value || '').trim();
  const rating = ratingRaw ? Number(ratingRaw) : null;

  try {
    await api('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        court_id: Number(currentCourt.id),
        county: currentCounty.name,
        court_name: currentCourt.name,
        user_name,
        rating,
        body
      })
    });
    el('feedbackBody').value = '';
    alert('Feedback submitted for moderation.');
    renderFeedbackList();
  } catch (e) {
    alert(`Feedback submit failed: ${e.message}`);
  }
}

async function copyFeedback() {
  const text = (el('feedbackList').innerText || '').trim();
  await navigator.clipboard.writeText(text || 'No feedback entries.');
  alert('Feedback copied to clipboard.');
}

async function loadRealtimeNews(force = false) {
  if (!currentCounty || !currentCourt) return;
  const q = `${currentCounty.name} ${currentCourt.name} ${val(currentCourt.judge)} Texas court`;
  const settings = getSettings();
  const provider = settings.newsProvider || 'google_rss';
  const key = `${provider}::${q.toLowerCase()}`;
  const box = el('newsList');

  const cached = newsCache.get(key);
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000; // 5 min cache
  if (!force && cached && now - cached.ts < ttlMs) {
    box.innerHTML = cached.html;
    return;
  }

  box.textContent = 'Loading headlines...';
  try {
    const out = await api(`/news/texas-courts?q=${encodeURIComponent(q)}&limit=12&provider=${encodeURIComponent(provider)}`);
    if (!out.items?.length) { box.textContent = 'No recent headlines found for this query.'; return; }
    const ranked = rankAndFilterNews(out.items, q, !!settings.newsWhitelistOnly).slice(0, 8);
    const html = ranked.map((n,i)=>`${i+1}. <a target='_blank' href='${n.link}'>${n.title}</a> <span class='small'>(${n.source || 'source'} | score ${n._score ?? 0})</span>`).join('<br/>');
    box.innerHTML = html;
    el('newsStatus').textContent = `Provider: ${provider} | refreshed ${new Date().toLocaleTimeString()}`;
    newsCache.set(key, { ts: now, html });
  } catch (e) {
    el('newsStatus').textContent = `Provider error: ${e.message}`;
    box.textContent = `News fetch unavailable: ${e.message}`;
  }
}

async function testProviderHealth() {
  const s = getSettings();
  const provider = s.newsProvider || 'google_rss';
  const target = el('providerHealth');
  target.textContent = 'Testing provider...';
  try {
    const out = await api(`/news/texas-courts?q=${encodeURIComponent('Texas court judge')}&limit=1&provider=${encodeURIComponent(provider)}`);
    target.textContent = `✅ ${provider} healthy (${out.count || 0} results)`;
  } catch (e) {
    target.textContent = `❌ ${provider} failed: ${e.message}`;
  }
}

function startNewsAutoRefresh() {
  if (newsRefreshTimer) clearInterval(newsRefreshTimer);
  if (!currentCounty || !currentCourt) return;
  newsRefreshTimer = setInterval(() => {
    loadRealtimeNews(false);
  }, 10 * 60 * 1000); // every 10 min
}

function loadSettingsIntoUi() {
  const s = getSettings();
  if (el('newsProvider')) el('newsProvider').value = s.newsProvider || 'google_rss';
  if (el('newsApiKey')) el('newsApiKey').value = s.newsApiKey || '';
  if (el('newsWhitelistOnly')) el('newsWhitelistOnly').checked = s.newsWhitelistOnly !== false;
  if (el('subscriptionTier')) el('subscriptionTier').value = s.subscriptionTier || 'core';
  if (el('tickerEnabled')) el('tickerEnabled').checked = s.tickerEnabled !== false;
  if (el('tickerScope')) el('tickerScope').value = s.tickerScope || 'statewide';
  if (el('tickerPosition')) el('tickerPosition').value = s.tickerPosition || 'top';
  if (el('tickerSpeed')) el('tickerSpeed').value = s.tickerSpeed || 'normal';
  applyTickerSettings();
}

function saveSettingsFromUi() {
  const s = {
    newsProvider: el('newsProvider')?.value || 'google_rss',
    newsApiKey: el('newsApiKey')?.value || '',
    newsWhitelistOnly: !!el('newsWhitelistOnly')?.checked,
    subscriptionTier: el('subscriptionTier')?.value || 'core',
    tickerEnabled: !!el('tickerEnabled')?.checked,
    tickerScope: el('tickerScope')?.value || 'statewide',
    tickerPosition: el('tickerPosition')?.value || 'top',
    tickerSpeed: el('tickerSpeed')?.value || 'normal'
  };
  setSettings(s);
  applyTickerSettings();
  startTickerAutoRefresh();
  el('settingsStatus').textContent = `Saved. Provider: ${s.newsProvider}. Tier: ${s.subscriptionTier}. Ticker: ${s.tickerScope}, ${s.tickerPosition}/${s.tickerSpeed}.`;
  newsCache.clear();
  if (currentCourt) {
    renderCourt(currentCounty?.id, currentCourt);
    loadRealtimeNews(true);
  }
}

async function copyCourtSummary() {
  if (!currentCounty || !currentCourt) return alert('Select a county and court first.');
  const txt = `County: ${currentCounty.name}\nCourt: ${currentCourt.name}\nJudge: ${val(currentCourt.judge)}\nCoordinator: ${val(currentCourt.coordinator)}\nBailiff: ${val(currentCourt.bailiff)}\nCourt Website: ${currentCourt.courtWebsite || ''}\nLive Stream: ${currentCourt.liveStreamUrl || ''}\nJudge News: ${judgeNewsLink(val(currentCourt.judge), currentCounty.name)}`;
  await navigator.clipboard.writeText(txt);
  alert('Copied court summary to clipboard.');
}

function buildCarrierReportDraft() {
  if (!currentCounty || !currentCourt) return alert('Select county/court first.');
  const report = [
    DISCLAIMER_TEXT,
    '',
    `County: ${currentCounty.name}`,
    `Court: ${currentCourt.name}`,
    `Judge: ${val(currentCourt.judge)}`,
    '',
    'County Demographics Context:',
    currentCounty.demographicsBlurb || 'TBD',
    '',
    'County Political Context (public election benchmark):',
    currentCounty.politicalBlurb || 'TBD',
    '',
    'Judge Background Context:',
    currentCourt.judgeProfileBlurb || 'TBD',
    '',
    'Judge Political Context (public-source only):',
    currentCourt.judgePoliticalBlurb || 'TBD',
    '',
    `Court Website: ${currentCourt.courtWebsite || ''}`,
    `Judge Source: ${src(currentCourt.judge) || 'TBD'}`,
    `Last Reviewed: ${currentCourt.lastReviewed || currentCounty.lastReviewed || 'TBD'}`,
    '',
    'Compliance Note: Official sources are primary. Supplemental context (e.g., LinkedIn) is premium-only and never used as sole basis for factual field updates.'
  ].join('\n');
  el('carrierReportBody').value = report;
}

async function copyCarrierReportDraft() {
  const txt = (el('carrierReportBody').value || '').trim();
  if (!txt) return alert('Build report draft first.');
  await navigator.clipboard.writeText(txt);
  alert('Carrier report draft copied.');
}

async function copyCountySection() {
  if (!currentCounty) return alert('Select county/court first.');
  const txt = [
    DISCLAIMER_TEXT,
    '',
    `County: ${currentCounty.name}`,
    '',
    'County Demographics Context:',
    currentCounty.demographicsBlurb || 'TBD',
    '',
    'County Political Context (public election benchmark):',
    currentCounty.politicalBlurb || 'TBD',
    '',
    `Last Reviewed (county): ${currentCounty.lastReviewed || 'TBD'}`
  ].join('\n');
  await navigator.clipboard.writeText(txt);
  alert('County section copied.');
}

async function copyJudgeSection() {
  if (!currentCourt) return alert('Select county/court first.');
  const txt = [
    DISCLAIMER_TEXT,
    '',
    `Court: ${currentCourt.name}`,
    `Judge: ${val(currentCourt.judge)}`,
    '',
    'Judge Background Context:',
    currentCourt.judgeProfileBlurb || 'TBD',
    '',
    'Judge Political Context (public-source only):',
    currentCourt.judgePoliticalBlurb || 'TBD',
    '',
    `Judge Source: ${src(currentCourt.judge) || 'TBD'}`,
    `Last Reviewed (court): ${currentCourt.lastReviewed || 'TBD'}`
  ].join('\n');
  await navigator.clipboard.writeText(txt);
  alert('Judge section copied.');
}

async function loadModerationQueue() {
  const box = el('moderationList');
  if (!token) return alert('Login as admin first.');
  box.textContent = 'Loading moderation queue...';
  try {
    const queue = await api('/feedback/moderation');
    const filter = el('moderationFilter')?.value || 'pending';
    const rows = filter === 'all' ? queue : queue.filter(x => x.status === 'pending');
    if (!rows.length) { box.textContent = 'No feedback in this view.'; return; }
    box.innerHTML = rows.map(item => `
      <div>
        <strong>${item.county} - ${item.court_name}</strong>
        <span class='badge'>${item.status || 'pending'}</span><br/>
        ${item.user_name || 'Anonymous'} ${item.rating ? `(${item.rating}/5)` : ''}<br/>
        ${item.body}<br/>
        <button data-id='${item.id}' data-action='approved'>Approve</button>
        <button data-id='${item.id}' data-action='rejected'>Reject</button>
        <button data-id='${item.id}' data-action='pending'>Reset Pending</button>
      </div><hr/>`).join('');

    box.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-action');
        try {
          await api(`/feedback/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          await loadModerationQueue();
          if (currentCourt) await renderFeedbackList();
        } catch (e) {
          alert(`Moderation update failed: ${e.message}`);
        }
      });
    });
  } catch (e) {
    box.textContent = `Moderation unavailable: ${e.message}`;
  }
}

async function saveAdmin() {
  if (!token) return alert('Login first for persistent save.');
  if (!currentCounty || !currentCourt) return alert('Select a county/court first.');

  const payload = {
    county: currentCounty.name,
    court_name: currentCourt.name,
    court_type: currentCourt.type || null,
    judge: el('adminJudge').value || null,
    judge_source: el('adminJudgeSource').value || null,
    judge_profile_blurb: el('adminJudgeProfile').value || null,
    judge_political_blurb: el('adminJudgePolitical').value || null,
    coordinator: el('adminCoord').value || null,
    coordinator_source: el('adminCoordSource').value || null,
    bailiff: el('adminBailiff').value || null,
    bailiff_source: el('adminBailiffSource').value || null,
    public_info: el('adminPublicInfo').value || null,
    last_verified: el('adminVerified').value || null
  };

  try {
    const saved = await api(`/courts/${Number(currentCourt.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    currentCourt.judge = { value: saved.judge || 'TBD', source: saved.judge_source || '' };
    currentCourt.judgeProfileBlurb = saved.judge_profile_blurb || '';
    currentCourt.judgePoliticalBlurb = saved.judge_political_blurb || '';
    currentCourt.judgePhotoUrl = el('adminJudgePhoto').value || '';
    currentCourt.coordinator = { value: saved.coordinator || 'TBD', source: saved.coordinator_source || '' };
    currentCourt.bailiff = { value: saved.bailiff || 'TBD', source: saved.bailiff_source || '' };
    currentCourt.publicInfo = saved.public_info || '';
    currentCourt.lastReviewed = saved.last_verified || '';
    currentCourt.courtWebsite = el('adminCourtUrl').value || currentCourt.courtWebsite;
    currentCourt.liveStreamUrl = el('adminLiveStreamUrl').value || currentCourt.liveStreamUrl;
    renderCourt(currentCounty.id, currentCourt);
    alert('Saved to backend successfully.');
  } catch (e) {
    alert(`Save failed: ${e.message}`);
  }
}

(async function init(){
  data = await loadData();
  data.counties.forEach(c => { const o=document.createElement('option'); o.value=c.id; o.textContent=c.name; el('countySelect').appendChild(o); });

  el('loginBtn').onclick = login;
  el('logoutBtn').onclick = logout;
  el('submitVerificationBtn').onclick = submitVerification;

  const persisted = getAuth();
  if (persisted?.token) {
    token = persisted.token;
    currentUser = persisted.currentUser || null;
    if (currentUser?.username && currentUser?.role) {
      setAuthStatus(`Logged in as ${currentUser.username} (${currentUser.role})`);
    }
  }
  renderVerificationStatus();
  el('openProCheckoutBtn').onclick = () => openCheckout('pro');
  el('openPremiumCheckoutBtn').onclick = () => openCheckout('premium');
  loadPlans();
  el('globalSearchInput').addEventListener('input', runGlobalSearch);
  el('toggleAdminBtn').onclick = () => el('adminPanel').classList.toggle('hidden');
  el('toggleModerationBtn').onclick = () => el('moderationPanel').classList.toggle('hidden');
  el('toggleSettingsBtn').onclick = () => el('settingsPanel').classList.toggle('hidden');
  loadSettingsIntoUi();
  startTickerAutoRefresh();
  el('saveSettingsBtn').onclick = saveSettingsFromUi;
  el('testNewsProviderBtn').onclick = testProviderHealth;
  el('saveAdminBtn').onclick = saveAdmin;
  el('clearAdminBtn').onclick = () => hydrateAdmin({ judge:'', judgePhotoUrl:'', coordinator:'', bailiff:'', publicInfo:'', lastReviewed:'' });

  el('copyCourtBtn').onclick = copyCourtSummary;
  el('loadNewsBtn').onclick = loadRealtimeNews;
  el('buildCarrierReportBtn').onclick = buildCarrierReportDraft;
  el('copyCarrierReportBtn').onclick = copyCarrierReportDraft;
  el('copyCountySectionBtn').onclick = copyCountySection;
  el('copyJudgeSectionBtn').onclick = copyJudgeSection;
  el('saveFeedbackBtn').onclick = saveFeedbackEntry;
  el('loadFeedbackBtn').onclick = renderFeedbackList;
  el('copyFeedbackBtn').onclick = copyFeedback;
  el('loadModerationBtn').onclick = loadModerationQueue;
  el('moderationFilter').onchange = loadModerationQueue;

  el('saveNotesBtn').onclick = () => {
    const countyId = el('countySelect').value, courtId = el('courtSelect').value, user = el('noteUser').value.trim();
    if (!countyId || !courtId || !user) return alert('Select county/court and enter user.');
    const n=getNotes(); n[noteKey(countyId,courtId,user)] = el('noteBody').value; setNotes(n); alert('Saved note.');
  };
  el('loadNotesBtn').onclick = () => {
    const n=getNotes(); el('noteBody').value = n[noteKey(el('countySelect').value,el('courtSelect').value,el('noteUser').value.trim())] || '';
  };

  el('exportCsvBtn').onclick = () => {
    const county = data.counties.find(c=>c.id===el('countySelect').value);
    if (!county) return alert('Select county first.');
    const rows = [['County','Court','Judge','Coordinator','Bailiff','CourtWebsite','LiveStream','LastReviewed']];
    county.courts.forEach(c=>rows.push([county.name,c.name,val(c.judge),val(c.coordinator),val(c.bailiff),c.courtWebsite||'',c.liveStreamUrl||'',c.lastReviewed||'']));
    const csv = rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`${county.name}_courts_export.csv`; a.click();
  };

  el('countySelect').addEventListener('change', () => {
    el('searchInput').value = '';
    renderCounty(data.counties.find(c=>c.id===el('countySelect').value));
    refreshCourtOptions();
    renderCourt(null,null);
  });
  el('searchInput').addEventListener('input', refreshCourtOptions);
  el('courtSelect').addEventListener('change', () => {
    const county = data.counties.find(c=>c.id===el('countySelect').value);
    renderCourt(county?.id, county?.courts.find(c=>c.id===el('courtSelect').value));
  });
})();