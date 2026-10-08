// Unpacks the site's folders (src, views, public, seed) from app-bundle.json on start-up,
// so the repository only needs a few flat files at its root.
(() => {
  const fs = require('fs'), path = require('path');
  const bundle = path.join(__dirname, 'app-bundle.json');
  if (!fs.existsSync(bundle)) return;
  const files = JSON.parse(fs.readFileSync(bundle, 'utf8'));
  for (const [rel, b64] of Object.entries(files)) {
    const dest = path.join(__dirname, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(b64, 'base64'));
  }
  console.log(`Unpacked ${Object.keys(files).length} site files.`);
})();
// Hotfix: mobile layout (sticky columns on complaints/event pages, timeline numbers)
(() => {
  const fs = require('fs'), path = require('path');
  const swap = (file, from, to) => {
    const fp = path.join(__dirname, file);
    if (!fs.existsSync(fp)) return;
    const s = fs.readFileSync(fp, 'utf8');
    if (s.includes(from)) fs.writeFileSync(fp, s.split(from).join(to));
  };
  swap('views/complaints.ejs', '<div data-reveal="left" style="position:sticky;top:110px">', '<div class="sticky-lg" data-reveal="left">');
  swap('views/event.ejs', '<aside class="form-card" id="register" data-reveal="right" style="position:sticky;top:100px">', '<aside class="form-card sticky-lg" id="register" data-reveal="right">');
  swap('views/partials/header.ejs', '/css/site.css?v=1"', '/css/site.css?v=3"');
  const css = path.join(__dirname, 'public/css/site.css');
  if (fs.existsSync(css) && !fs.readFileSync(css, 'utf8').includes('.sticky-lg')) {
    fs.appendFileSync(css, '\n@media (min-width: 1025px) { .sticky-lg { position: sticky; top: 110px; } }\n.timeline::before, .timeline::after { z-index: 0; }\n.tl-item { z-index: 1; }\n');
  }
})();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieSession = require('cookie-session');
const multer = require('multer');

const { db, Items, Settings, Content, DATA_DIR, UPLOAD_DIR } = require('./src/db');
const { DEFAULTS, FIELD_INDEX } = require('./src/content');
const U = require('./src/util');
const mail = require('./src/mail');
require('./src/placeholders')(path.join(__dirname, 'public', 'img', 'placeholders'));
require('./src/seed')();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Session secret persists on the data disk
const secretFile = path.join(DATA_DIR, '.secret');
if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(48).toString('hex'));
app.use(cookieSession({ name: 'sh_sess', keys: [process.env.SESSION_SECRET || fs.readFileSync(secretFile, 'utf8')], maxAge: 1000 * 60 * 60 * 12, sameSite: 'lax', httpOnly: true }));

app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));
// Files sent in through public forms (repair photos, referrals) are only visible to logged-in staff
app.use('/uploads/private', (req, res, next) => (req.session && req.session.uid ? next() : res.status(404).send('Not found')));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', index: false }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.use((req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); res.set('Referrer-Policy', 'strict-origin-when-cross-origin'); next(); });

// ---------- Private uploads from public forms ----------
const PRIVATE_DIR = path.join(UPLOAD_DIR, 'private');
fs.mkdirSync(PRIVATE_DIR, { recursive: true });
const privateUpload = multer({
  storage: multer.diskStorage({ destination: PRIVATE_DIR, filename: (req, f, cb) => cb(null, crypto.randomBytes(12).toString('hex') + path.extname(f.originalname).toLowerCase().replace(/[^.\w]/g, '')) }),
  limits: { fileSize: 12 * 1024 * 1024, files: 8 },
  fileFilter: (req, f, cb) => cb(null, /\.(jpe?g|png|webp|heic|heif|gif|pdf|docx?|odt|rtf|txt)$/i.test(f.originalname)),
});

// ---------- Shared view helpers ----------
const NAV = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/referrals', label: 'Referrals' },
  { label: 'Community', children: [
    { href: '/events', label: 'Events calendar' }, { href: '/stories', label: "Tenants' stories" }, { href: '/working-together', label: 'Working together' }, { href: '/news', label: 'News & newsletter' } ] },
  { label: 'Tenants', children: [
    { href: '/repairs', label: 'Report a repair or damp' }, { href: '/charter-of-rights', label: 'Charter of Rights' }, { href: '/complaints', label: 'Complaints' }, { href: '/events', label: 'Book an activity' } ] },
  { href: '/contact', label: 'Contact' },
];

app.use((req, res, next) => {
  const settings = { ...Settings.all() };
  const content = Content.all();
  const isAdmin = !!(req.session && req.session.uid);
  const raw = (k) => (content[k] !== undefined ? content[k] : (DEFAULTS[k] ?? ''));
  const L = res.locals;
  Object.assign(L, U, {
    settings, isAdmin, path: req.path, NAV, query: req.query,
    t: raw,
    cms: (k) => isAdmin ? `<span data-cms="${k}">${U.esc(raw(k))}</span>` : U.esc(raw(k)),
    cmsRich: (k, cls = 'rich') => `<div class="${cls}"${isAdmin ? ` data-cms-rich="${k}" data-raw="${U.esc(raw(k))}"` : ''}>${U.rich(raw(k))}</div>`,
    cmsImg: (k, alt = '', cls = '', extra = '') => {
      const im = U.parseImg(raw(k)) || { src: '/img/placeholders/community.svg', x: 50, y: 50 };
      return `<img src="${U.esc(im.src)}" alt="${U.esc(alt)}" class="${cls}" style="${U.pos(im)}" loading="lazy" decoding="async"${isAdmin ? ` data-cms-img="${k}" data-x="${im.x ?? 50}" data-y="${im.y ?? 50}"` : ''} ${extra}>`;
    },
    img: (im, alt = '', cls = '', extra = '') => {
      im = U.parseImg(im); if (!im) return '';
      return `<img src="${U.esc(im.src)}" alt="${U.esc(alt)}" class="${cls}" style="${U.pos(im)}" loading="lazy" decoding="async" ${extra}>`;
    },
    wa: (text) => U.waLink(settings.whatsapp, text || settings.wa_message),
    waRoom: (room, src) => `/wa?room=${room.id}${src ? '&src=' + encodeURIComponent(src) : ''}`,
    telHref: 'tel:' + String(settings.phone || '').replace(/[^\d+]/g, ''),
    mapQuery: settings.map_query || String(settings.address || '').replace(/\n/g, ', '),
    editLink: null,
    meta: { title: '', description: '' },
    year: new Date().getFullYear(),
  });
  next();
});

const render = (res, view, data = {}) => res.render(view, data);
const visibleRooms = () => Items.list('rooms').filter((r) => r.status !== 'Let / allocated');
const upcomingEvents = () => Items.list('events').filter((e) => e.date >= U.today()).sort((a, b) => (a.date + (a.start_time || '')).localeCompare(b.date + (b.start_time || '')));
const regCount = (id) => db.prepare("SELECT COUNT(*) n FROM registrations WHERE event_id = ? AND status = 'confirmed'").get(id).n;
const withSpaces = (e) => { const taken = regCount(e.id); const cap = Number(e.capacity) || 0; return { ...e, taken, spacesLeft: cap ? Math.max(cap - taken, 0) : null, full: cap ? taken >= cap : false }; };
const storiesPublic = () => Items.list('stories').filter((s) => s.consent).sort((a, b) => String(b.date).localeCompare(String(a.date)));
const docs = (section) => Items.list('documents').filter((d) => d.section === section && d.file);

// ---------- Anti-spam ----------
const hits = new Map();
function guard(req, res, next) {
  if (req.body && req.body.website) return res.status(400).send('Rejected'); // honeypot
  const ip = req.ip, now = Date.now();
  const h = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (h.length >= 12) return res.status(429).send('Too many submissions. Please try again later or contact us by phone or WhatsApp.');
  h.push(now); hits.set(ip, h); next();
}
const clean = (v, max = 5000) => String(v == null ? '' : v).trim().slice(0, max);
const baseUrl = (req) => `${req.protocol}://${req.get('host')}`;

function saveSubmission(req, type, { name, email, phone, subject, data, files = [] }) {
  const info = db.prepare('INSERT INTO submissions (type, name, email, phone, subject, data, files) VALUES (?,?,?,?,?,?,?)').run(
    type, clean(name, 200), clean(email, 200), clean(phone, 60), clean(subject, 200), JSON.stringify(data),
    JSON.stringify(files.map((f) => ({ src: `/uploads/private/${f.filename}`, name: f.originalname, size: f.size, type: f.mimetype }))));
  const id = info.lastInsertRowid;
  mail.notify(id, baseUrl(req)).catch(() => {});
  return id;
}

// ---------- Public pages ----------
app.get('/', (req, res) => {
  const rooms = visibleRooms();
  render(res, 'home', {
    rooms: (rooms.filter((r) => r.featured).length ? rooms.filter((r) => r.featured) : rooms).slice(0, 6), roomCount: rooms.filter((r) => r.status === 'Available now').length,
    services: Items.list('services'), events: upcomingEvents().slice(0, 3).map(withSpaces),
    stories: storiesPublic().slice(0, 3), partners: Items.list('partners'), news: Items.list('news').sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 2),
  });
});
app.get('/about', (req, res) => render(res, 'about', { meta: { title: 'About us' } }));
app.get('/services', (req, res) => render(res, 'services', { meta: { title: 'Services' }, services: Items.list('services') }));

app.get('/rooms', (req, res) => {
  const rooms = visibleRooms();
  const areas = [...new Set(rooms.map((r) => r.area).filter(Boolean))].sort();
  const types = [...new Set(rooms.map((r) => r.room_type).filter(Boolean))].sort();
  render(res, 'rooms', { meta: { title: 'Rooms available' }, rooms, areas, types, src: clean(req.query.src || req.query.utm_source, 40) });
});
app.get('/rooms/:slug', (req, res, next) => {
  const room = Items.bySlug('rooms', req.params.slug);
  if (!room || (!room.published && !res.locals.isAdmin)) return next();
  const src = clean(req.query.src || req.query.utm_source, 40);
  res.locals.editLink = `/admin/c/rooms/${room.id}`;
  render(res, 'room', { meta: { title: room.title, description: room.summary, image: (U.parseImg((room.images || [])[0]) || {}).src }, room, src, others: visibleRooms().filter((r) => r.id !== room.id).slice(0, 3) });
});
// Short, shareable room link for Facebook adverts etc: /r/SH-101
app.get('/r/:ref', (req, res, next) => {
  const room = Items.list('rooms', { all: true }).find((r) => String(r.ref || '').toLowerCase() === req.params.ref.toLowerCase());
  if (!room) return next();
  res.redirect(`/rooms/${room.slug}?src=${encodeURIComponent(req.query.src || 'link')}`);
});
// WhatsApp click-through with enquiry tracking
app.get('/wa', (req, res) => {
  const s = res.locals.settings;
  let text = s.wa_message, room = null;
  if (req.query.room && db.prepare("SELECT 1 FROM items WHERE id = ? AND collection = 'rooms'").get(Number(req.query.room))) room = Items.get(Number(req.query.room));
  if (room) text = String(s.wa_room_message || '').replace(/\{ref\}/g, room.ref || '').replace(/\{title\}/g, room.title || '').replace(/\{area\}/g, room.area || '');
  let src = clean(req.query.src, 40);
  if (!src) { const ref = req.get('referer') || ''; src = /facebook|fb\./i.test(ref) ? 'facebook' : 'website'; }
  db.prepare('INSERT INTO clicks (room_id, ref, source, page) VALUES (?,?,?,?)').run(room ? room.id : null, room ? room.ref : null, src, clean(req.query.page || '', 120));
  res.redirect(U.waLink(s.whatsapp, text));
});

app.get('/referrals', (req, res) => render(res, 'referrals', { meta: { title: 'Referrals' }, documents: docs('Referrals'), sent: req.query.sent }));
app.post('/referrals', privateUpload.array('files', 5), guard, (req, res) => {
  const b = req.body;
  if (!b.referrer_name || !b.referrer_email || !req.files.length) return res.redirect('/referrals?error=1#submit');
  const id = saveSubmission(req, 'referral', { name: b.referrer_name, email: b.referrer_email, phone: b.referrer_phone, subject: `Referral from ${clean(b.organisation, 100)}`,
    data: { 'Referrer name': clean(b.referrer_name), Organisation: clean(b.organisation), Email: clean(b.referrer_email), Phone: clean(b.referrer_phone), 'Applicant initials': clean(b.applicant, 20), 'Urgency': clean(b.urgency), Notes: clean(b.notes) }, files: req.files });
  res.redirect(`/referrals?sent=${id}#submit`);
});

app.get('/working-together', (req, res) => {
  const p = Items.list('partners');
  render(res, 'working', { meta: { title: 'Working together' }, referral: p.filter((x) => x.category === 'Referral agency'), accredit: p.filter((x) => x.category === 'Accrediting body'), community: p.filter((x) => x.category === 'Community & sport') });
});

app.get('/repairs', (req, res) => render(res, 'repairs', { meta: { title: 'Report a repair' }, sent: req.query.sent }));
app.post('/repairs', privateUpload.array('photos', 6), guard, (req, res) => {
  const b = req.body;
  if (!b.name || !b.address || !(b.phone || b.email) || !b.issue_type || !b.description) return res.redirect('/repairs?error=1#form');
  const id = saveSubmission(req, 'repair', { name: b.name, email: b.email, phone: b.phone, subject: `${clean(b.issue_type, 60)} – ${clean(b.address, 80)}`,
    data: { 'Tenant name': clean(b.name), 'Property / address': clean(b.address), 'Room number': clean(b.room, 40), Phone: clean(b.phone), Email: clean(b.email), 'Type of issue': clean(b.issue_type), 'Location in property': clean(b.location), 'Date identified': clean(b.date_identified, 20), 'Description': clean(b.description), 'Access / best time to visit': clean(b.access), 'Other information': clean(b.other) }, files: req.files });
  res.redirect(`/repairs?sent=${id}#form`);
});

app.get('/events', (req, res) => {
  const all = Items.list('events').map(withSpaces);
  const now = U.today();
  let [y, m] = String(req.query.month || now.slice(0, 7)).split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) [y, m] = now.slice(0, 7).split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)); const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // Monday first
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) { const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; cells.push({ d, iso, events: all.filter((e) => e.date === iso) }); }
  while (cells.length % 7) cells.push(null);
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  render(res, 'events', { meta: { title: 'Events calendar' }, upcoming: all.filter((e) => e.date >= now).sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time)), cells, monthLabel: `${U.MONTHS[m - 1]} ${y}`, prev, next, now });
});
app.get('/events/:slug', (req, res, next) => {
  const ev = Items.bySlug('events', req.params.slug);
  if (!ev || (!ev.published && !res.locals.isAdmin)) return next();
  res.locals.editLink = `/admin/c/events/${ev.id}`;
  render(res, 'event', { meta: { title: ev.title, description: ev.summary, image: (U.parseImg(ev.image) || {}).src }, ev: withSpaces(ev), status: req.query.status, past: ev.date < U.today() });
});
app.post('/events/:slug/register', guard, (req, res, next) => {
  const ev = Items.bySlug('events', req.params.slug);
  if (!ev || !ev.published) return next();
  const b = req.body, back = `/events/${ev.slug}`;
  if (!b.name || !(b.phone || b.email) || !b.consent) return res.redirect(`${back}?status=invalid#register`);
  if (ev.date < U.today() || ev.registration_open === false) return res.redirect(`${back}?status=closed#register`);
  const result = db.transaction(() => {
    const cap = Number(ev.capacity) || 0;
    if (cap && regCount(ev.id) >= cap) return 'full';
    const dup = db.prepare("SELECT id FROM registrations WHERE event_id = ? AND status = 'confirmed' AND ((phone != '' AND phone = ?) OR (email != '' AND lower(email) = lower(?)))").get(ev.id, clean(b.phone, 60), clean(b.email, 200));
    if (dup) return 'duplicate';
    db.prepare('INSERT INTO registrations (event_id, name, email, phone, notes) VALUES (?,?,?,?,?)').run(ev.id, clean(b.name, 120), clean(b.email, 200), clean(b.phone, 60), clean(b.notes, 1000));
    return 'ok';
  })();
  if (result === 'ok') {
    const to = Settings.get('inbox');
    if (to) mail.send({ to, subject: `Event registration: ${ev.title} (${U.fmtDate(ev.date, 'short')})`, html: `<p><b>${U.esc(b.name)}</b> registered for <b>${U.esc(ev.title)}</b>.</p><p>Phone: ${U.esc(b.phone)}<br>Email: ${U.esc(b.email)}<br>Notes: ${U.esc(b.notes)}</p><p>${regCount(ev.id)} of ${ev.capacity || '∞'} spaces taken.</p>` });
    if (b.email) mail.send({ to: b.email, subject: `You're booked: ${ev.title}`, html: `<p>Hi ${U.esc(b.name)},</p><p>Your place is confirmed for <b>${U.esc(ev.title)}</b> on ${U.fmtDate(ev.date, 'dow')} at ${U.fmtTime(ev.start_time)}, ${U.esc(ev.location)}.</p><p>See you there,<br>Solace Housing</p>` });
  }
  res.redirect(`${back}?status=${result}#register`);
});

app.get('/stories', (req, res) => render(res, 'stories', { meta: { title: "Tenants' stories" }, stories: storiesPublic() }));
app.get('/stories/:slug', (req, res, next) => {
  const s = Items.bySlug('stories', req.params.slug);
  if (!s || ((!s.published || !s.consent) && !res.locals.isAdmin)) return next();
  res.locals.editLink = `/admin/c/stories/${s.id}`;
  render(res, 'story', { meta: { title: s.title, description: s.summary }, s, more: storiesPublic().filter((x) => x.id !== s.id).slice(0, 3) });
});
app.get('/news', (req, res) => render(res, 'news', { meta: { title: 'News & newsletter' }, posts: Items.list('news').sort((a, b) => String(b.date).localeCompare(String(a.date))), subscribed: req.query.subscribed }));
app.get('/news/:slug', (req, res, next) => {
  const p = Items.bySlug('news', req.params.slug);
  if (!p || (!p.published && !res.locals.isAdmin)) return next();
  res.locals.editLink = `/admin/c/news/${p.id}`;
  render(res, 'post', { meta: { title: p.title, description: p.summary }, p });
});
app.post('/subscribe', guard, (req, res) => {
  const email = clean(req.body.email, 200).toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) db.prepare('INSERT OR IGNORE INTO subscribers (email, name) VALUES (?, ?)').run(email, clean(req.body.name, 120));
  const back = String(req.get('referer') || '/news').replace(/[?#].*$/, '');
  res.redirect(`${back}?subscribed=1#newsletter`);
});

app.get('/charter-of-rights', (req, res) => render(res, 'charter', { meta: { title: 'Charter of Rights' }, documents: docs('Charter of Rights') }));
app.get('/complaints', (req, res) => render(res, 'complaints', { meta: { title: 'Complaints' }, documents: docs('Complaints'), sent: req.query.sent }));
app.post('/complaints', guard, (req, res) => {
  const b = req.body;
  if (!b.name || !(b.phone || b.email) || !b.details) return res.redirect('/complaints?error=1#form');
  const id = saveSubmission(req, 'complaint', { name: b.name, email: b.email, phone: b.phone, subject: 'Complaint',
    data: { Name: clean(b.name), 'Tenant / relationship': clean(b.relationship), Phone: clean(b.phone), Email: clean(b.email), 'Preferred contact': clean(b.preferred), 'What happened': clean(b.details), 'What would put it right': clean(b.outcome) } });
  res.redirect(`/complaints?sent=${id}#form`);
});
app.get('/contact', (req, res) => render(res, 'contact', { meta: { title: 'Contact us' }, sent: req.query.sent }));
app.post('/contact', guard, (req, res) => {
  const b = req.body;
  if (!b.name || !(b.email || b.phone) || !b.message) return res.redirect('/contact?error=1#form');
  const id = saveSubmission(req, 'contact', { name: b.name, email: b.email, phone: b.phone, subject: clean(b.topic, 80),
    data: { Name: clean(b.name), Email: clean(b.email), Phone: clean(b.phone), 'I am': clean(b.who), Topic: clean(b.topic), Message: clean(b.message) } });
  res.redirect(`/contact?sent=${id}#form`);
});
app.get('/documents', (req, res) => render(res, 'documents', { meta: { title: 'Documents & downloads' }, documents: Items.list('documents').filter((d) => d.file) }));
app.get('/privacy', (req, res) => render(res, 'privacy', { meta: { title: 'Privacy policy' } }));

app.get('/robots.txt', (req, res) => res.type('text').send(`User-agent: *\nDisallow: /admin\nSitemap: ${baseUrl(req)}/sitemap.xml`));
app.get('/sitemap.xml', (req, res) => {
  const pages = ['/', '/about', '/services', '/rooms', '/referrals', '/working-together', '/repairs', '/events', '/stories', '/news', '/charter-of-rights', '/complaints', '/contact'];
  const dyn = [...visibleRooms().map((r) => `/rooms/${r.slug}`), ...Items.list('events').map((e) => `/events/${e.slug}`), ...storiesPublic().map((s) => `/stories/${s.slug}`), ...Items.list('news').map((n) => `/news/${n.slug}`)];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...pages, ...dyn].map((p) => `<url><loc>${baseUrl(req)}${p}</loc></url>`).join('')}</urlset>`);
});

// ---------- Admin ----------
app.use('/admin', require('./src/admin'));

app.use((req, res) => res.status(404).render('404', { meta: { title: 'Page not found' } }));
app.use((err, req, res, next) => { console.error(err); res.status(500).send('Something went wrong. Please try again.'); });

const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`Solace Housing running on http://localhost:${PORT}`));
module.exports = app;
