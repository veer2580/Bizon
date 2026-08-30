const SESSION_COOKIE = 'byizon_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const COUNTRY_CODE_PATTERN = /^\+\d{1,4}$/;
const INVITE_ROLES = new Set(['Admin', 'Manager', 'Editor', 'Viewer']);

const encoder = new TextEncoder();

function now() {
  return new Date().toISOString();
}

function clean(value) {
  return String(value ?? '').trim();
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function hashPassword(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    key,
    256,
  );
  return { hash: bytesToBase64(new Uint8Array(bits)), salt: bytesToBase64(salt) };
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

async function passwordMatches(password, row) {
  const derived = await hashPassword(password, base64ToBytes(row.password_salt));
  return timingSafeEqual(derived.hash, row.password_hash);
}

function cookieValue(request, name) {
  const source = request.headers.get('cookie') || '';
  return source.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1) || null;
}

function sessionCookie(sessionId) {
  return `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

async function payload(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, 'Request body must be valid JSON.');
  }
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function validatePassword(password) {
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters.');
  if (!/[A-Z]/.test(password)) throw new ApiError(400, 'Password must include one uppercase letter.');
  if (!/[a-z]/.test(password)) throw new ApiError(400, 'Password must include one lowercase letter.');
  if (!/\d/.test(password)) throw new ApiError(400, 'Password must include one number.');
  if (!/[^A-Za-z0-9]/.test(password)) throw new ApiError(400, 'Password must include one special character.');
}

async function onboarding(env, userId) {
  const state = await env.BIZON_DB.prepare('SELECT * FROM onboarding_state WHERE user_id = ?').bind(userId).first();
  const currentStep = Math.max(1, Math.min(5, Number(state?.current_step || 1)));
  const completed = Boolean(state?.completed);
  const paths = {
    1: '/onboarding/company',
    2: '/onboarding/team',
    3: '/onboarding/data-source',
    4: '/onboarding/ai-workspace',
    5: '/onboarding/complete',
  };
  return {
    currentStep,
    dataSource: state?.data_source || null,
    completed,
    completedAt: state?.completed_at || null,
    nextStep: completed ? '/dashboard' : paths[currentStep],
  };
}

async function advanceOnboarding(env, userId, step, dataSource = null) {
  const timestamp = now();
  await env.BIZON_DB.prepare(
    `INSERT INTO onboarding_state (user_id, current_step, data_source, completed, completed_at, updated_at)
     VALUES (?, ?, ?, 0, NULL, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       current_step = MAX(onboarding_state.current_step, excluded.current_step),
       data_source = COALESCE(excluded.data_source, onboarding_state.data_source),
       updated_at = excluded.updated_at`,
  ).bind(userId, step, dataSource, timestamp).run();
}

async function profile(env, userId) {
  const account = await env.BIZON_DB.prepare('SELECT * FROM accounts WHERE user_id = ?').bind(userId).first();
  if (!account) return null;
  return {
    authenticated: true,
    provider: 'password',
    workspaceUserId: account.user_id,
    displayName: `${account.first_name} ${account.last_name}`.trim() || account.work_email,
    firstName: account.first_name,
    lastName: account.last_name,
    email: account.work_email,
    companyName: account.company_name,
    phoneCountryCode: account.phone_country_code,
    phoneNumber: account.phone_number,
    emailVerified: true,
    createdAt: account.created_at,
    onboarding: await onboarding(env, userId),
  };
}

async function currentUser(request, env) {
  const sessionId = cookieValue(request, SESSION_COOKIE);
  if (!sessionId) return null;
  const session = await env.BIZON_DB.prepare(
    'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?',
  ).bind(sessionId, now()).first();
  return session ? profile(env, session.user_id) : null;
}

async function requireUser(request, env) {
  const user = await currentUser(request, env);
  if (!user) throw new ApiError(401, 'Please log in to continue.');
  return user;
}

async function createSession(env, userId) {
  const sessionId = id('ses');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  await env.BIZON_DB.prepare('INSERT INTO sessions (session_id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(sessionId, userId, expiresAt, now()).run();
  return sessionId;
}

async function signup(request, env) {
  const body = await payload(request);
  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const email = clean(body.workEmail).toLowerCase();
  const companyName = clean(body.companyName);
  const phoneCountryCode = clean(body.phoneCountryCode) || '+91';
  const phoneNumber = clean(body.phoneNumber);
  const password = String(body.password || '');
  const required = [['First name', firstName], ['Last name', lastName], ['Work email', email], ['Company name', companyName], ['Phone number', phoneNumber]];
  const missing = required.filter(([, value]) => !value).map(([label]) => label);
  if (missing.length) throw new ApiError(400, `${missing.join(', ')} required.`);
  if (!EMAIL_PATTERN.test(email)) throw new ApiError(400, 'Enter a valid work email.');
  if (!COUNTRY_CODE_PATTERN.test(phoneCountryCode)) throw new ApiError(400, 'Select a valid country code.');
  if (phoneNumber.replace(/\D/g, '').length < 7) throw new ApiError(400, 'Enter a valid phone number.');
  validatePassword(password);
  if (!body.termsAccepted) throw new ApiError(400, 'Terms of Service and Privacy Policy consent is required.');

  const existing = await env.BIZON_DB.prepare('SELECT user_id FROM accounts WHERE work_email = ?').bind(email).first();
  if (existing) throw new ApiError(409, 'An account already exists with this work email. Please log in.');
  const userId = id('usr_acc');
  const passwordData = await hashPassword(password);
  const timestamp = now();
  await env.BIZON_DB.prepare(
    `INSERT INTO accounts (user_id, first_name, last_name, work_email, company_name, phone_country_code, phone_number, password_hash, password_salt, terms_accepted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
  ).bind(userId, firstName, lastName, email, companyName, phoneCountryCode, phoneNumber, passwordData.hash, passwordData.salt, timestamp, timestamp).run();
  const user = await profile(env, userId);
  const sessionId = await createSession(env, userId);
  return json({ ok: true, requiresOtp: false, email, user, workspaceUserId: userId, nextStep: '/onboarding/company' }, 201, { 'set-cookie': sessionCookie(sessionId) });
}

async function login(request, env) {
  const body = await payload(request);
  const email = clean(body.email || body.workEmail).toLowerCase();
  const password = String(body.password || '');
  const account = await env.BIZON_DB.prepare('SELECT * FROM accounts WHERE work_email = ?').bind(email).first();
  if (!account || !(await passwordMatches(password, account))) throw new ApiError(401, 'Invalid email or password.');
  const user = await profile(env, account.user_id);
  const sessionId = await createSession(env, account.user_id);
  return json({ ok: true, user, workspaceUserId: account.user_id, nextStep: user.onboarding.nextStep }, 200, { 'set-cookie': sessionCookie(sessionId) });
}

function companyResult(row) {
  if (!row) return null;
  return {
    workspaceUserId: row.user_id, companyName: row.company_name, industry: row.industry, companySize: row.company_size,
    website: row.website, companyDescription: row.company_description, logoDataUrl: row.logo_data_url,
    defaultCurrency: row.default_currency, timeZone: row.time_zone, accuracyConfirmed: Boolean(row.accuracy_confirmed),
    skipped: Boolean(row.skipped), step: 1, updatedAt: row.updated_at,
  };
}

async function company(request, env) {
  const user = await requireUser(request, env);
  if (request.method === 'GET') {
    const row = await env.BIZON_DB.prepare('SELECT * FROM onboarding_company WHERE user_id = ?').bind(user.workspaceUserId).first();
    return json({ ok: true, company: companyResult(row) });
  }
  const body = await payload(request);
  const skipped = Boolean(body.skipped);
  let companyName = clean(body.companyName);
  let industry = clean(body.industry);
  let companySize = clean(body.companySize);
  const website = clean(body.website);
  const description = clean(body.companyDescription);
  const logo = clean(body.logoDataUrl);
  const currency = clean(body.defaultCurrency) || 'INR';
  const timeZone = clean(body.timeZone) || 'Asia/Kolkata';
  if (!skipped) {
    const missing = [['Company name', companyName], ['Industry', industry], ['Company size', companySize]].filter(([, value]) => !value).map(([label]) => label);
    if (missing.length) throw new ApiError(400, `${missing.join(', ')} required.`);
    if (!body.accuracyConfirmed) throw new ApiError(400, 'Please confirm that the provided company details are accurate.');
  } else {
    companyName ||= 'Skipped setup'; industry ||= 'Not provided'; companySize ||= 'Not provided';
  }
  if (description.length > 500) throw new ApiError(400, 'Company description must be 500 characters or less.');
  if (logo.length > 3000000) throw new ApiError(400, 'Logo upload is too large. Please use an image under 2 MB.');
  const normalizedWebsite = website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;
  const timestamp = now();
  await env.BIZON_DB.prepare(
    `INSERT INTO onboarding_company (user_id, company_name, industry, company_size, website, company_description, logo_data_url, default_currency, time_zone, accuracy_confirmed, skipped, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET company_name=excluded.company_name, industry=excluded.industry, company_size=excluded.company_size, website=excluded.website, company_description=excluded.company_description, logo_data_url=excluded.logo_data_url, default_currency=excluded.default_currency, time_zone=excluded.time_zone, accuracy_confirmed=excluded.accuracy_confirmed, skipped=excluded.skipped, updated_at=excluded.updated_at`,
  ).bind(user.workspaceUserId, companyName, industry, companySize, normalizedWebsite, description, logo, currency, timeZone, body.accuracyConfirmed ? 1 : 0, skipped ? 1 : 0, timestamp).run();
  await advanceOnboarding(env, user.workspaceUserId, 2);
  const row = await env.BIZON_DB.prepare('SELECT * FROM onboarding_company WHERE user_id = ?').bind(user.workspaceUserId).first();
  return json({ ok: true, company: companyResult(row) });
}

async function team(request, env) {
  const user = await requireUser(request, env);
  if (request.method === 'GET') {
    const { results } = await env.BIZON_DB.prepare('SELECT * FROM onboarding_team_invites WHERE user_id = ? ORDER BY created_at DESC').bind(user.workspaceUserId).all();
    return json({ ok: true, invites: results.map(row => ({ inviteId: row.invite_id, workspaceUserId: row.user_id, email: row.email, role: row.role, personalMessage: row.personal_message || '', status: row.status, createdAt: row.created_at, updatedAt: row.updated_at })) });
  }
  const body = await payload(request);
  if (!Array.isArray(body.invites)) throw new ApiError(400, 'Invites must be a list.');
  const message = clean(body.personalMessage).slice(0, 400);
  const invites = [];
  const seen = new Set();
  for (const item of body.invites) {
    const email = clean(item?.email).toLowerCase();
    const role = clean(item?.role) || 'Viewer';
    if (!email || seen.has(email)) continue;
    if (!EMAIL_PATTERN.test(email)) throw new ApiError(400, `Invalid invite email: ${email}`);
    if (!INVITE_ROLES.has(role)) throw new ApiError(400, 'Select a valid invite role.');
    seen.add(email); invites.push({ email, role });
  }
  const timestamp = now();
  const statements = [env.BIZON_DB.prepare('DELETE FROM onboarding_team_invites WHERE user_id = ?').bind(user.workspaceUserId)];
  for (const invite of invites) statements.push(env.BIZON_DB.prepare('INSERT INTO onboarding_team_invites (invite_id, user_id, email, role, personal_message, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, \'pending\', ?, ?)').bind(id('inv'), user.workspaceUserId, invite.email, invite.role, message, timestamp, timestamp));
  await env.BIZON_DB.batch(statements);
  await advanceOnboarding(env, user.workspaceUserId, 3);
  const { results } = await env.BIZON_DB.prepare('SELECT * FROM onboarding_team_invites WHERE user_id = ? ORDER BY created_at DESC').bind(user.workspaceUserId).all();
  return json({ ok: true, invites: results.map(row => ({ inviteId: row.invite_id, workspaceUserId: row.user_id, email: row.email, role: row.role, personalMessage: row.personal_message || '', status: row.status, createdAt: row.created_at, updatedAt: row.updated_at })), count: results.length });
}

async function dataSource(request, env) {
  const user = await requireUser(request, env);
  const body = await payload(request);
  const source = clean(body.dataSource);
  if (!['upload', 'apps', 'database', 'later'].includes(source)) throw new ApiError(400, 'Choose a valid data source to continue.');
  await advanceOnboarding(env, user.workspaceUserId, 4, source);
  return json({ ok: true, onboarding: await onboarding(env, user.workspaceUserId) });
}

function aiResult(row) {
  if (!row) return null;
  return { workspaceUserId: row.user_id, businessType: row.business_type, primaryDepartment: row.primary_department, industry: row.industry, preferredLanguage: row.preferred_language, timeZone: row.time_zone, currency: row.currency, skipped: Boolean(row.skipped), step: 4, updatedAt: row.updated_at };
}

async function aiWorkspace(request, env) {
  const user = await requireUser(request, env);
  if (request.method === 'GET') {
    const row = await env.BIZON_DB.prepare('SELECT * FROM onboarding_ai_workspace WHERE user_id = ?').bind(user.workspaceUserId).first();
    return json({ ok: true, aiWorkspace: aiResult(row) });
  }
  const body = await payload(request);
  const skipped = Boolean(body.skipped);
  let businessType = clean(body.businessType); let department = clean(body.primaryDepartment); let industry = clean(body.industry);
  const language = clean(body.preferredLanguage) || 'English + Hindi';
  const timeZone = clean(body.timeZone) || 'Asia/Kolkata'; const currency = clean(body.currency) || 'INR';
  if (!skipped && (!businessType || !department || !industry)) throw new ApiError(400, 'Business type, Primary department, Industry required.');
  if (skipped) { businessType ||= 'Not provided'; department ||= 'Not provided'; industry ||= 'Not provided'; }
  const timestamp = now();
  await env.BIZON_DB.prepare(
    `INSERT INTO onboarding_ai_workspace (user_id, business_type, primary_department, industry, preferred_language, time_zone, currency, skipped, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET business_type=excluded.business_type, primary_department=excluded.primary_department, industry=excluded.industry, preferred_language=excluded.preferred_language, time_zone=excluded.time_zone, currency=excluded.currency, skipped=excluded.skipped, updated_at=excluded.updated_at`,
  ).bind(user.workspaceUserId, businessType, department, industry, language, timeZone, currency, skipped ? 1 : 0, timestamp).run();
  await advanceOnboarding(env, user.workspaceUserId, 5);
  const row = await env.BIZON_DB.prepare('SELECT * FROM onboarding_ai_workspace WHERE user_id = ?').bind(user.workspaceUserId).first();
  return json({ ok: true, aiWorkspace: aiResult(row) });
}

async function complete(request, env) {
  const user = await requireUser(request, env);
  const state = await onboarding(env, user.workspaceUserId);
  const [company, ai] = await env.BIZON_DB.batch([
    env.BIZON_DB.prepare('SELECT 1 AS present FROM onboarding_company WHERE user_id = ?').bind(user.workspaceUserId),
    env.BIZON_DB.prepare('SELECT 1 AS present FROM onboarding_ai_workspace WHERE user_id = ?').bind(user.workspaceUserId),
  ]);
  if (!company.results?.[0] || !ai.results?.[0] || state.currentStep < 5 || !state.dataSource) throw new ApiError(400, 'Complete the onboarding steps before activating your account.');
  const timestamp = now();
  await env.BIZON_DB.prepare('UPDATE onboarding_state SET current_step = 5, completed = 1, completed_at = ?, updated_at = ? WHERE user_id = ?').bind(timestamp, timestamp, user.workspaceUserId).run();
  return json({ ok: true, onboarding: await onboarding(env, user.workspaceUserId) });
}

async function api(request, env, pathname) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { allow: 'GET, POST, OPTIONS' } });
  if (pathname === '/api/health' && request.method === 'GET') return json({ ok: true, engine: 'Byizon Cloudflare Worker', database: 'D1', version: '2026-08-30-cloudflare' });
  if (pathname === '/api/auth/session' && request.method === 'GET') {
    const user = await currentUser(request, env);
    return json({ ok: true, workspaceUserId: user?.workspaceUserId || null, user: user || { authenticated: false } });
  }
  if (pathname === '/api/auth/signup' && request.method === 'POST') return signup(request, env);
  if (pathname === '/api/auth/login' && request.method === 'POST') return login(request, env);
  if (pathname === '/api/auth/logout' && request.method === 'POST') {
    const sessionId = cookieValue(request, SESSION_COOKIE);
    if (sessionId) await env.BIZON_DB.prepare('DELETE FROM sessions WHERE session_id = ?').bind(sessionId).run();
    return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
  }
  if (pathname === '/api/onboarding/status' && request.method === 'GET') { const user = await requireUser(request, env); return json({ ok: true, onboarding: await onboarding(env, user.workspaceUserId) }); }
  if (pathname === '/api/onboarding/company' && ['GET', 'POST'].includes(request.method)) return company(request, env);
  if (pathname === '/api/onboarding/team' && ['GET', 'POST'].includes(request.method)) return team(request, env);
  if (pathname === '/api/onboarding/data-source' && request.method === 'POST') return dataSource(request, env);
  if (pathname === '/api/onboarding/ai-workspace' && ['GET', 'POST'].includes(request.method)) return aiWorkspace(request, env);
  if (pathname === '/api/onboarding/complete' && request.method === 'POST') return complete(request, env);
  throw new ApiError(404, 'This Cloudflare API route is not available yet.');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await api(request, env, url.pathname);
      } catch (error) {
        if (error instanceof ApiError) return json({ ok: false, error: error.message }, error.status);
        console.error(error);
        return json({ ok: false, error: 'The Byizon service could not complete this request.' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
