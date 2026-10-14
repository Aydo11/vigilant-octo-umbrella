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
// Update 4: FAQs, accessibility options, quick exit, calendar export, backups, photo shrinking
(() => {
  const fs = require('fs'), path = require('path'), crypto = require('crypto');
  const P = {"src/collections.js":{"h":"eb3af07867","e":[[106,0,"  faqs: {\n    label: 'FAQs', singular: 'Question', icon: 'chat', titleField: 'question',\n    help: 'Frequently asked questions. Choose which page each one appears on. Drag to change the order.',\n    listColumns: ['page'],\n    fields: [\n      { name: 'question', label: 'Question', type: 'text', required: true },\n      { name: 'page', label: 'Show on page', type: 'select', options: ['Rooms', 'Referrals', 'Tenants (Charter page)', 'Contact'] },\n      { name: 'answer', label: 'Answer', type: 'rich', required: true },\n    ],\n  },"]]},"src/content.js":{"h":"32fe399a4f","e":[[253,0,"    { key: 'out_of_hours', label: 'Out-of-hours emergency number (tenants)', help: 'Shown on the repairs page and in the footer. Leave blank to hide.', def: '' },"],[277,0,"  { group: 'Safety & accessibility', fields: [\n    { key: 'quick_exit', label: 'Show a \"Quick exit\" button on every page', help: 'For visitors who may need to leave the site quickly and safely. It opens a neutral website and replaces this page in the browser history.', type: 'checkbox', def: '' },\n    { key: 'quick_exit_url', label: 'Quick exit goes to', def: 'https://www.bbc.co.uk/weather' },\n  ]},"]]},"src/admin.js":{"h":"7eb3fe93b2","e":[[373,0,"router.get('/backup', async (req, res) => {\n  const file = path.join(require('os').tmpdir(), `solace-backup-${Date.now()}.db`);\n  try {\n    await db.backup(file);\n    res.download(file, `solace-housing-backup-${U.today()}.db`, () => fs.rm(file, () => {}));\n  } catch (e) { flash(req, 'err', 'Backup failed: ' + e.message); res.redirect('/admin/settings'); }\n});"]]},"src/seed.js":{"h":"9ffde46b79","e":[[20,0,"  if (!Settings.get('seeded_faqs')) {\n    const q = (question, page, answer, i) => Items.create('faqs', { question, page, answer, sample: true }, { slug: slugify(question), sort: i });\n    [\n      ['Who can live in a Solace home?', 'Rooms', 'Our homes are for adults aged 18 and over who need a safe place to live and some extra support. We talk with every applicant first to make sure the home and the support are the right fit.'],\n      ['How is the rent paid?', 'Rooms', 'For most tenants, the rent and service charge are covered by Housing Benefit. If you are not sure whether you are eligible, we will help you check and make the claim.'],\n      ['Are bills included?', 'Rooms', 'Yes. Gas, electricity, water, council tax and Wi-Fi are all included, and every room is fully furnished.'],\n      ['Can I see the room before I move in?', 'Rooms', 'Yes. Once we have talked through your situation, we will arrange a visit so you can see the home and meet the team.'],\n      ['How quickly can someone move in?', 'Rooms', 'When a room is available and the assessment is complete, people can often move in within a few days. We will always tell you honestly how long it is likely to take.'],\n      ['How quickly do you respond to referrals?', 'Referrals', 'We aim to respond to every referral within one working day, and sooner for urgent cases.'],\n      ['What information do you need with a referral?', 'Referrals', 'Please send the completed referral form, plus any recent risk assessment and support plan you hold. The more we know, the faster we can make a decision.'],\n      ['Can people refer themselves?', 'Referrals', 'Yes. Anyone can contact us directly by phone, WhatsApp or the contact form, and we will talk through the options.'],\n      ['How do I report a repair?', 'Tenants (Charter page)', 'Use the [Report a repair](/repairs) page, or speak to your key worker. For emergencies, call us straight away.'],\n      ['Who can I talk to if I am unhappy?', 'Tenants (Charter page)', 'Speak to your key worker or any member of staff. You can also make a formal complaint. See our [complaints process](/complaints).'],\n    ].forEach((f, i) => q(f[0], f[1], f[2], i));\n    Settings.set('seeded_faqs', '1');\n  }"]]},"public/css/site.css":{"h":"689bce74da","e":[[667,0,"/* ---------- FAQs ---------- */\n.faq-wrap { display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(30px, 5vw, 80px); align-items: start; }\n.faq details { background: #fff; border-radius: 0 20px 0 20px; box-shadow: var(--shadow); margin-bottom: 12px; overflow: hidden; transition: box-shadow .4s; }\n.faq details[open] { box-shadow: var(--shadow-lg); }\n.faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 24px; font-family: var(--font-h); font-weight: 600; color: var(--navy); font-size: 1.05rem; }\n.faq summary::-webkit-details-marker { display: none; }\n.faq summary i { width: 30px; height: 30px; flex: none; border-radius: 0 10px 0 10px; background: var(--pink-soft); position: relative; transition: background .3s, transform .4s var(--ease); }\n.faq summary i::before, .faq summary i::after { content: ''; position: absolute; left: 50%; top: 50%; width: 12px; height: 2px; margin: -1px 0 0 -6px; background: var(--pink-d); transition: transform .4s var(--ease); }\n.faq summary i::after { transform: rotate(90deg); }\n.faq details[open] summary i { background: var(--pink); transform: rotate(180deg); }\n.faq details[open] summary i::before, .faq details[open] summary i::after { background: #fff; }\n.faq details[open] summary i::after { transform: rotate(0deg); }\n.faq details .rich { padding: 0 24px 22px; color: var(--muted); animation: faqIn .5s var(--ease); }\n@keyframes faqIn { from { opacity: 0; transform: translateY(-6px); } }\n@media (max-width: 1024px) { .faq-wrap { grid-template-columns: 1fr; } }\n\n/* ---------- Accessibility panel ---------- */\n.a11y-panel { position: fixed; right: 20px; top: 96px; z-index: 95; width: min(340px, calc(100vw - 32px)); background: #fff; border-radius: 0 24px 0 24px; box-shadow: var(--shadow-lg); padding: 18px 20px; animation: zoomIn .35s var(--ease); }\n.a11y-panel[hidden] { display: none; }\n.a11y-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: var(--font-h); color: var(--navy); }\n.a11y-head .icon-btn { width: 36px; height: 36px; }\n.a11y-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--line); font-weight: 500; cursor: pointer; }\n.a11y-row input { width: 22px; height: 22px; accent-color: var(--pink); }\n.seg { display: inline-flex; background: var(--cream); border-radius: 0 12px 0 12px; padding: 4px; gap: 2px; }\n.seg button { border: 0; background: none; font-family: var(--font-h); font-weight: 700; color: var(--navy); width: 38px; height: 32px; border-radius: 0 9px 0 9px; cursor: pointer; }\n.seg button.on { background: var(--navy); color: #fff; }\nhtml.a11y-lg { font-size: 112.5%; } html.a11y-xl { font-size: 125%; }\nhtml.a11y-lg body { font-size: 18.5px; } html.a11y-xl body { font-size: 20.5px; }\nhtml.a11y-spacing body { letter-spacing: .03em; word-spacing: .12em; line-height: 1.85; }\nhtml.a11y-spacing p, html.a11y-spacing li { max-width: 70ch; }\nhtml.a11y-links a { text-decoration: underline !important; text-underline-offset: 3px; }\nhtml.a11y-contrast { --muted: #2B3E48; --line: #8A9AA3; --pink: #C8102E; --pink-d: #A50D26; --pink-soft: #FFE1E6; }\nhtml.a11y-contrast body { color: #000; }\nhtml.a11y-contrast .lead, html.a11y-contrast .muted, html.a11y-contrast .card p { color: #1E2F38; }\nhtml.a11y-contrast .page-hero .lead, html.a11y-contrast .bg-navy, html.a11y-contrast .bg-navy .lead { color: #fff !important; }\nhtml.a11y-contrast .blob, html.a11y-contrast .page-hero::before, html.a11y-contrast .page-hero::after { opacity: .25; }\nhtml.a11y-calm *, html.a11y-calm *::before, html.a11y-calm *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }\nhtml.a11y-calm [data-reveal] { opacity: 1 !important; transform: none !important; clip-path: none !important; }\nhtml.a11y-calm .hero h1 .w > span, html.a11y-calm .page-hero h1 .w > span { transform: none !important; }\nhtml.a11y-calm .hero-art .frame { clip-path: none !important; }\nhtml.a11y-calm .hero-art .frame img { transform: none !important; }\nhtml.a11y-calm .float-card { opacity: 1 !important; transform: none !important; }\n\n/* ---------- Quick exit ---------- */\n.quick-exit { position: fixed; left: 16px; bottom: 16px; z-index: 96; background: #111; color: #fff; text-decoration: none; font-family: var(--font-h); font-weight: 700; padding: 12px 18px; border-radius: 0 16px 0 16px; display: flex; align-items: center; gap: 10px; box-shadow: 0 12px 30px rgba(0,0,0,.3); }\n.quick-exit svg { width: 18px; height: 18px; }\n.quick-exit small { font-weight: 400; font-size: .72rem; opacity: .7; margin-left: 4px; }\n.quick-exit:hover { background: var(--pink); }\n@media (max-width: 680px) { .quick-exit small { display: none; } .quick-exit { bottom: 84px; } }\n\n/* ---------- Map consent, share, calendar ---------- */\n.map-consent { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 30px; background: linear-gradient(135deg, var(--cream), var(--pink-mist)); }\n.map-consent::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(var(--line) 1.5px, transparent 2px); background-size: 22px 22px; opacity: .8; }\n.map-consent > div { position: relative; max-width: 420px; }\n.map-consent .pin { width: 64px; height: 64px; margin: 0 auto 14px; border-radius: 0 20px 0 20px; background: var(--pink); color: #fff; display: grid; place-items: center; animation: bob 4s ease-in-out infinite; }\n.map-consent .pin svg { width: 30px; height: 30px; }\n.map-consent p { color: var(--muted); font-size: .92rem; }\n.share-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }\n.chip-btn { display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid var(--line); background: #fff; color: var(--navy); font-family: var(--font-h); font-weight: 600; font-size: .85rem; padding: 9px 14px; border-radius: 0 12px 0 12px; cursor: pointer; text-decoration: none; transition: all .3s var(--ease); }\n.chip-btn:hover { border-color: var(--pink); color: var(--pink-d); }\n.chip-btn svg { width: 16px; height: 16px; }\n.enquire .chip-btn { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.18); color: #fff; }\n.enquire .chip-btn:hover { background: rgba(255,255,255,.16); color: #fff; }\n@media print {\n  .site-header, .site-footer, .wa-float, .room-bar, .admin-bar, .quick-exit, .a11y-panel, .enquire .btn, .share-row, .progress { display: none !important; }\n  [data-reveal] { opacity: 1 !important; transform: none !important; clip-path: none !important; }\n  body { font-size: 12pt; }\n}\nhtml.a11y-lg .nav, html.a11y-xl .nav, html.a11y-lg .hdr-cta .btn, html.a11y-xl .hdr-cta .btn { display: none; }\nhtml.a11y-lg .menu-toggle, html.a11y-xl .menu-toggle { display: grid; }\nhtml.a11y-lg .hdr-cta, html.a11y-xl .hdr-cta { margin-left: auto; }\n@media (max-width: 1280px) and (min-width: 1025px) { .hdr-cta .btn.wa span { display: none; } .hdr-cta .btn.wa { padding: 13px; } }\n@media (max-width: 1180px) and (min-width: 1025px) { .hdr { gap: 12px; } .logo { padding: 6px 14px 7px 12px; } .logo b { font-size: 26px; } .nav > a, .nav .dd > button { padding: 10px 7px; } .hdr-cta { gap: 6px; } }\n/* Sticky side columns only where there is room for them (desktop) */\n@media (min-width: 1025px) { .sticky-lg { position: sticky; top: 110px; } }\n.timeline::before, .timeline::after { z-index: 0; }\n.tl-item { z-index: 1; }\n"]]},"public/js/shrink.js":{"new":"// Shrinks large photos in the browser before upload (faster uploads from phones, smaller files on the server).\nwindow.shrinkImage = async function (file, max = 2000, quality = 0.85) {\n  try {\n    if (!/^image\\/(jpeg|png|webp)$/.test(file.type) || file.size < 450 * 1024 || !window.createImageBitmap) return file;\n    const bmp = await createImageBitmap(file);\n    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));\n    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);\n    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);\n    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', quality));\n    if (!blob || blob.size >= file.size) return file;\n    return new File([blob], file.name.replace(/\\.(png|webp|jpe?g)$/i, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });\n  } catch (e) { return file; }\n};\nwindow.shrinkInput = async function (input) {\n  if (!window.DataTransfer) return;\n  const dt = new DataTransfer();\n  for (const f of input.files) dt.items.add(await window.shrinkImage(f));\n  input.files = dt.files;\n};\n"},"public/js/admin.js":{"h":"bd0e8e80e0","e":[[86,3,"    input.addEventListener('change', async () => {\n      const picked = [];\n      for (const f of input.files) picked.push(window.shrinkImage ? await window.shrinkImage(f) : f);\n      if (multi) { picked.forEach((f) => pending.items.add(f)); input.files = pending.files; }\n      else { pending = new DataTransfer(); if (picked[0]) pending.items.add(picked[0]); input.files = pending.files; }"]]},"public/js/live-edit.js":{"h":"3dac3a8985","e":[[62,1,"    $('input[type=file]', m).addEventListener('change', async (ev) => { file = ev.target.files[0]; if (file && window.shrinkImage) file = await window.shrinkImage(file); if (file) { setSrc(URL.createObjectURL(file)); x = y = 50; paint(); } });"]]},"public/js/site.js":{"h":"3d465b4e99","e":[[34,1,"  // Mask reveals start fully clipped, which some browsers treat as never visible, so watch their parent instead\n  $$('[data-reveal]').forEach((el) => {\n    if (el.dataset.reveal !== 'mask') return io.observe(el);\n    const mo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add('in'); mo.disconnect(); } }), { threshold: 0.05 });\n    mo.observe(el.parentElement);\n  });"],[134,1,"    input.addEventListener('change', async () => {\n      if (window.shrinkInput) await window.shrinkInput(input);"],[145,0,"\n  // Accessibility panel (preferences remembered on this device)\n  const html = document.documentElement, panel = $('#a11yPanel'), a11yBtn = $('[data-a11y-open]');\n  let prefs = {}; try { prefs = JSON.parse(localStorage.getItem('sh-a11y') || '{}'); } catch (e) {}\n  const applyPrefs = () => {\n    ['lg', 'xl', 'contrast', 'spacing', 'calm', 'links'].forEach((k) => html.classList.toggle('a11y-' + k, !!prefs[k]));\n    $$('[data-a11y]').forEach((c) => (c.checked = !!prefs[c.dataset.a11y]));\n    $$('[data-a11y-size]').forEach((b) => b.classList.toggle('on', (prefs.lg ? 'lg' : prefs.xl ? 'xl' : '') === b.dataset.a11ySize));\n    try { localStorage.setItem('sh-a11y', JSON.stringify(prefs)); } catch (e) {}\n  };\n  if (panel && a11yBtn) {\n    applyPrefs();\n    a11yBtn.addEventListener('click', () => { panel.hidden = !panel.hidden; a11yBtn.setAttribute('aria-expanded', !panel.hidden); if (!panel.hidden) $('button, input', panel).focus(); });\n    $('[data-a11y-close]', panel).addEventListener('click', () => { panel.hidden = true; a11yBtn.setAttribute('aria-expanded', 'false'); a11yBtn.focus(); });\n    $$('[data-a11y]', panel).forEach((c) => c.addEventListener('change', () => { prefs[c.dataset.a11y] = c.checked; applyPrefs(); }));\n    $$('[data-a11y-size]', panel).forEach((b) => b.addEventListener('click', () => { prefs.lg = b.dataset.a11ySize === 'lg'; prefs.xl = b.dataset.a11ySize === 'xl'; applyPrefs(); }));\n    $('[data-a11y-reset]', panel).addEventListener('click', () => { prefs = {}; applyPrefs(); });\n    document.addEventListener('click', (e) => { if (!panel.hidden && !panel.contains(e.target) && !a11yBtn.contains(e.target)) panel.hidden = true; });\n  }\n\n  // Quick exit: button, or press Esc twice\n  const qe = $('[data-quick-exit]');\n  if (qe) {\n    const leave = () => { try { document.body.style.display = 'none'; } catch (e) {} location.replace(qe.href); };\n    qe.addEventListener('click', (e) => { e.preventDefault(); leave(); });\n    let last = 0; addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; const n = Date.now(); if (n - last < 800) leave(); last = n; });\n  }\n\n  // Load the Google map only when asked\n  $$('[data-map-load]').forEach((b) => b.addEventListener('click', () => {\n    const box = b.closest('[data-map-src]');\n    const f = document.createElement('iframe'); f.src = box.dataset.mapSrc; f.title = 'Map showing our office'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';\n    box.replaceWith(f);\n  }));\n\n  // Share buttons (native share sheet on phones, copy link elsewhere)\n  $$('[data-share]').forEach((b) => b.addEventListener('click', async () => {\n    const url = location.href.split('#')[0];\n    if (navigator.share) { try { await navigator.share({ title: b.dataset.title, url }); return; } catch (e) { return; } }\n    try { await navigator.clipboard.writeText(url); } catch (e) {}\n    const old = b.innerHTML; b.textContent = 'Link copied'; setTimeout(() => (b.innerHTML = old), 1600);\n  }));\n"]]},"views/charter.ejs":{"h":"2946d99830","e":[[25,0,"<%- include('partials/faqs', { page: 'Tenants (Charter page)', bg: 'bg-cream', title: 'Questions from tenants' }) %>"]]},"views/event.ejs":{"h":"1f20d3e54d","e":[[13,0,"      <div class=\"share-row\"><a class=\"chip-btn\" href=\"/events/<%= ev.slug %>.ics\" style=\"background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)\"><svg><use href=\"#i-calendar\"/></svg>Add to calendar</a><button type=\"button\" class=\"chip-btn\" data-share data-title=\"<%= ev.title %>\" style=\"background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)\"><svg><use href=\"#i-share\"/></svg>Share</button></div>"],[24,1,"    <aside class=\"form-card sticky-lg\" id=\"register\" data-reveal=\"right\">"],[29,1,"        <div class=\"success\" style=\"padding:10px 0\"><div class=\"tick\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6 9 17l-5-5\"/></svg></div><h3>You're booked in!</h3><p class=\"muted\">We've saved your place. See you on <%= fmtDate(ev.date, 'dow') %>.</p><a class=\"btn navy sm\" href=\"/events/<%= ev.slug %>.ics\"><svg><use href=\"#i-calendar\"/></svg>Add to my calendar</a></div>"]]},"views/contact.ejs":{"h":"31ee4f20e3","e":[[36,1,"      <div class=\"map-consent\" data-map-src=\"https://maps.google.com/maps?q=<%= encodeURIComponent(mapQuery) %>&z=15&output=embed\"><div><span class=\"pin\"><svg><use href=\"#i-pin\"/></svg></span><h3>Find our office</h3><p>The map is provided by Google, which may set cookies when it loads.</p><div class=\"actions\" style=\"justify-content:center\"><button type=\"button\" class=\"btn sm\" data-map-load>Show the map</button><a class=\"btn ghost sm\" target=\"_blank\" rel=\"noopener\" href=\"https://www.google.com/maps/dir/?api=1&destination=<%= encodeURIComponent(mapQuery) %>\">Open directions</a></div></div></div>"],[42,0,"<%- include('partials/faqs', { page: 'Contact' }) %>"]]},"views/referrals.ejs":{"h":"058fa2f8d5","e":[[45,0,"<%- include('partials/faqs', { page: 'Referrals', bg: 'bg-cream' }) %>"]]},"views/rooms.ejs":{"h":"74983fc659","e":[[29,0,"<%- include('partials/faqs', { page: 'Rooms' }) %>"]]},"views/repairs.ejs":{"h":"c55e47603d","e":[[5,1,"      <div class=\"notice danger\" data-reveal style=\"margin:0\"><svg><use href=\"#i-alert\"/></svg><div><h4><%- cms('repairs.emergency.title') %></h4><p><%- cms('repairs.emergency.text') %></p><p style=\"margin-top:10px;display:flex;gap:8px;flex-wrap:wrap\"><a class=\"btn sm\" href=\"<%= telHref %>\"><svg><use href=\"#i-phone\"/></svg>Call <%= settings.phone %></a><% if (settings.out_of_hours) { %><a class=\"btn sm navy\" href=\"tel:<%= settings.out_of_hours.replace(/[^\\d+]/g,'') %>\"><svg><use href=\"#i-phone\"/></svg>Out of hours: <%= settings.out_of_hours %></a><% } %></p></div></div>"]]},"views/complaints.ejs":{"h":"5c262cf95f","e":[[4,1,"    <div class=\"sticky-lg\" data-reveal=\"left\"><span class=\"eyebrow\">Step one</span><h2><%- cms('complaints.how.title') %></h2><%- cmsRich('complaints.how.text', 'rich lead') %>"]]},"views/room.ejs":{"h":"929eb75362","e":[[38,0,"        <div class=\"share-row\"><button type=\"button\" class=\"chip-btn\" data-share data-title=\"<%= room.title %> (<%= room.ref %>)\"><svg><use href=\"#i-share\"/></svg>Share</button><button type=\"button\" class=\"chip-btn\" onclick=\"print()\"><svg><use href=\"#i-file\"/></svg>Print</button></div>"]]},"views/partials/footer.ejs":{"h":"472aa8fb69","e":[[26,1,"        <p><a href=\"<%= telHref %>\"><%= settings.phone %></a><br><a href=\"mailto:<%= settings.email %>\"><%= settings.email %></a><% if (settings.out_of_hours) { %><br><span style=\"color:#9fbfcd\">Tenant emergencies (out of hours):</span> <a href=\"tel:<%= settings.out_of_hours.replace(/[^\\d+]/g,'') %>\"><%= settings.out_of_hours %></a><% } %></p>"],[53,2,"<link rel=\"stylesheet\" href=\"/css/live-edit.css?v=2\">\n<script src=\"/js/live-edit.js?v=3\" defer></script>"],[56,1,"<script src=\"/js/shrink.js\" defer></script>\n<script src=\"/js/site.js?v=5\" defer></script>"]]},"views/partials/faqs.ejs":{"new":"<% const list = faqs(page); if (list.length) { %>\n<section class=\"section<%= typeof bg !== 'undefined' ? ' ' + bg : '' %>\">\n  <div class=\"wrap faq-wrap\">\n    <div data-reveal><span class=\"eyebrow\">Questions</span><h2><%= typeof title !== 'undefined' ? title : 'Frequently asked questions' %></h2><p class=\"lead\">Can't see your question? <a href=\"/wa?page=faq\" target=\"_blank\" rel=\"noopener\" class=\"pink\" style=\"font-weight:600\">Message us on WhatsApp</a> and we'll help.</p></div>\n    <div class=\"faq\" data-reveal>\n      <% list.forEach(function(f, i){ %>\n      <details <%= i === 0 ? 'open' : '' %>><summary><span><%= f.question %></span><i aria-hidden=\"true\"></i></summary><div class=\"rich\"><%- rich(f.answer) %></div></details>\n      <% }) %>\n    </div>\n  </div>\n  <script type=\"application/ld+json\"><%- JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }).replace(/</g, '\\\\u003c') %></script>\n</section>\n<% } %>\n"},"views/partials/icons.ejs":{"h":"c967f7e453","e":[[42,0,"<symbol id=\"i-eye\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"4.5\" r=\"2\"/><path d=\"M5 8.5l7 1.5 7-1.5M12 10v5l-3 6M12 15l3 6\"/></symbol>\n<symbol id=\"i-share\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"18\" cy=\"5\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"19\" r=\"3\"/><path d=\"m8.6 13.5 6.8 4M15.4 6.5l-6.8 4\"/></symbol>"]]},"views/partials/header.ejs":{"h":"058e0814dc","e":[[9,1,"<meta property=\"og:image\" content=\"<%= meta.image && !/\\.svg$/.test(meta.image) ? meta.image : '/img/favicon.svg' %>\">"],[15,2,"<link rel=\"stylesheet\" href=\"/css/site.css?v=5\">\n<script>document.documentElement.classList.replace('no-js','js');try{var a=JSON.parse(localStorage.getItem('sh-a11y')||'{}');for(var k in a)if(a[k])document.documentElement.classList.add('a11y-'+k)}catch(e){}</script>\n<script type=\"application/ld+json\"><%- JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: settings.org_name, description: t('home.hero.text'), telephone: settings.phone, email: settings.email, address: { '@type': 'PostalAddress', streetAddress: String(settings.address || '').split('\\n').slice(0, -1).join(', '), addressLocality: 'Birmingham', addressCountry: 'GB' }, areaServed: 'Birmingham', sameAs: [settings.facebook, settings.instagram, settings.tiktok, settings.linkedin].filter(Boolean) }).replace(/</g, '\\\\u003c') %></script>"],[35,0,"      <button class=\"icon-btn\" type=\"button\" aria-label=\"Accessibility options\" aria-expanded=\"false\" data-a11y-open title=\"Accessibility options\"><svg><use href=\"#i-eye\"/></svg></button>"],[39,0,"<div class=\"a11y-panel\" id=\"a11yPanel\" role=\"dialog\" aria-label=\"Accessibility options\" hidden>\n  <div class=\"a11y-head\"><b>Make the site easier to use</b><button type=\"button\" class=\"icon-btn\" aria-label=\"Close\" data-a11y-close><svg><use href=\"#i-close\"/></svg></button></div>\n  <div class=\"a11y-row\"><span>Text size</span><div class=\"seg\" role=\"group\" aria-label=\"Text size\"><button type=\"button\" data-a11y-size=\"\">A</button><button type=\"button\" data-a11y-size=\"lg\" style=\"font-size:1.1em\">A</button><button type=\"button\" data-a11y-size=\"xl\" style=\"font-size:1.25em\">A</button></div></div>\n  <label class=\"a11y-row\"><span>High contrast</span><input type=\"checkbox\" data-a11y=\"contrast\"></label>\n  <label class=\"a11y-row\"><span>Easier-to-read spacing</span><input type=\"checkbox\" data-a11y=\"spacing\"></label>\n  <label class=\"a11y-row\"><span>Turn off animations</span><input type=\"checkbox\" data-a11y=\"calm\"></label>\n  <label class=\"a11y-row\"><span>Underline all links</span><input type=\"checkbox\" data-a11y=\"links\"></label>\n  <button type=\"button\" class=\"link-arrow\" data-a11y-reset style=\"background:none;border:0;cursor:pointer;margin-top:6px\">Reset to default</button>\n</div>\n<% if (settings.quick_exit === '1') { %><a class=\"quick-exit\" href=\"<%= settings.quick_exit_url || 'https://www.bbc.co.uk/weather' %>\" data-quick-exit rel=\"noopener noreferrer\"><svg><use href=\"#i-close\"/></svg>Quick exit<small>or press Esc twice</small></a><% } %>"]]},"views/admin/settings.ejs":{"h":"a47bf0c2a9","e":[[24,1,"<button class=\"btn ghost\" formaction=\"/admin/settings/test-email\" formnovalidate style=\"justify-content:center\">Send a test email</button><p class=\"muted\" style=\"font-size:.8rem;margin:0\">Save first, then send a test email.</p></div>\n<div class=\"card\"><h3>Backup</h3><p class=\"muted\" style=\"font-size:.85rem;margin-top:0\">Download a copy of all rooms, events, bookings, messages, text and settings. Keep it somewhere safe.</p><a class=\"btn navy\" style=\"width:100%;justify-content:center\" href=\"/admin/backup\"><svg><use href=\"#i-download\"/></svg>Download backup</a></div></div>"]]},"views/admin/_foot.ejs":{"h":"44e1c0f812","e":[[1,1,"<script src=\"/js/shrink.js\"></script>\n<script src=\"/js/admin.js?v=3\"></script>"]]},"views/admin/login.ejs":{"h":"3b90ef7e7f","e":[[1,1,"<link rel=\"icon\" href=\"/img/favicon.svg\"><link href=\"https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Poppins:wght@500;600;700&display=swap\" rel=\"stylesheet\"><link rel=\"stylesheet\" href=\"/css/admin.css?v=3\"></head>"]]},"views/admin/_head.ejs":{"h":"15e4bc37f9","e":[[3,1,"<link rel=\"stylesheet\" href=\"/css/admin.css?v=3\"></head><body>"],[20,0,"  <%- nl('/admin/c/faqs', 'FAQs', 'chat') %>"]]},"views/admin/list.ejs":{"h":"9bac555011","e":[[1,1,"<% const sortable = ['services','partners','documents','rooms','faqs'].includes(cid); %>"],[11,1,"<% if (cid === 'partners' || cid === 'documents' || cid === 'faqs') { %><th>Section</th><% } %>"],[31,0,"  <% if (cid === 'faqs') { %><td><span class=\"badge\"><%= it.page %></span></td><% } %>"]]}};
  for (const [rel, p] of Object.entries(P)) {
    const fp = path.join(__dirname, rel);
    if (p.new !== undefined) { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, p.new); continue; }
    if (!fs.existsSync(fp)) continue;
    const buf = fs.readFileSync(fp);
    if (crypto.createHash('sha1').update(buf).digest('hex').slice(0, 10) !== p.h) { console.warn('Update 4 skipped a changed file: ' + rel); continue; }
    const lines = buf.toString('utf8').split('\n');
    for (const [i, d, ins] of [...p.e].reverse()) lines.splice(i, d, ...(ins === null ? [] : ins.split('\n')));
    fs.writeFileSync(fp, lines.join('\n'));
  }
  console.log('Update 4 applied.');
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
// Hotfix 3: room, event and map images not appearing (their reveal animation never started)
(() => {
  const fs = require('fs'), path = require('path');
  const fp = path.join(__dirname, 'public/js/site.js');
  if (!fs.existsSync(fp)) return;
  const s = fs.readFileSync(fp, 'utf8');
  const from = "  $$('[data-reveal]').forEach((el) => io.observe(el));";
  const to = "  $$('[data-reveal]').forEach((el) => {\n    if (el.dataset.reveal !== 'mask') return io.observe(el);\n    const mo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add('in'); mo.disconnect(); } }), { threshold: 0.05 });\n    mo.observe(el.parentElement);\n  });";
  if (s.includes(from)) fs.writeFileSync(fp, s.split(from).join(to));
  for (const f of ['views/partials/footer.ejs']) {
    const p = path.join(__dirname, f); if (!fs.existsSync(p)) continue;
    const t = fs.readFileSync(p, 'utf8');
    fs.writeFileSync(p, t.replace(/\/js\/site\.js(\?v=\d+)?"/, '/js/site.js?v=6"'));
  }
})();
// Update 5: videos on stories and events; stories shown on the News page and home page
(() => {
  const fs = require('fs'), path = require('path'), crypto = require('crypto');
  const P = {"src/collections.js": {"h": "307a7ec049", "e": [[46, 0, "      { name: 'video', label: 'Video (optional)', type: 'video', help: 'Upload a short clip (MP4 or iPhone MOV, up to 200 MB), or paste a YouTube, Vimeo or Facebook link below instead.' },\n      { name: 'video_url', label: 'Or video link (YouTube, Vimeo or Facebook)', type: 'url', placeholder: 'https://www.youtube.com/watch?v=...' },"], [62, 0, "      { name: 'video', label: 'Video (optional)', type: 'video', help: 'Upload a short clip (MP4 or iPhone MOV, up to 200 MB), or paste a YouTube, Vimeo or Facebook link below instead. Only include people who have given written consent.' },\n      { name: 'video_url', label: 'Or video link (YouTube, Vimeo or Facebook)', type: 'url', placeholder: 'https://www.youtube.com/watch?v=...' },"]]}, "src/admin.js": {"h": "0fa7402c5f", "e": [[22, 2, "  limits: { fileSize: 200 * 1024 * 1024 },\n  fileFilter: (req, f, cb) => cb(null, /\\.(jpe?g|png|webp|gif|svg|avif|pdf|docx?|xlsx?|pptx?|odt|rtf|txt|csv|mp4|m4v|mov|webm)$/i.test(f.originalname)),"], [142, 0, "      case 'video':"], [382, 0, "// Friendly message when an upload is too big or the connection drops mid-upload\nrouter.use((err, req, res, next) => {\n  if (!(err instanceof multer.MulterError) && !/Unexpected end of form|aborted/i.test(String(err && err.message))) return next(err);\n  flash(req, 'err', err.code === 'LIMIT_FILE_SIZE' ? 'That file is too large (the limit is 200 MB). Try a shorter clip, or upload it to YouTube and paste the link instead.' : 'The upload did not finish. Please check your connection and try again.');\n  res.redirect(String(req.get('referer') || '/admin').replace(/#.*$/, ''));\n});\n"]]}, "views/event.ejs": {"h": "bf4ffc1ecc", "e": [[21, 0, "      <%- include('partials/video', { item: ev }) %>"]]}, "views/home.ejs": {"h": "07f168136d", "e": [[86, 0, "    <% if (stories.length) { %>\n    <div class=\"sec-head\" style=\"margin-top:90px\"><div data-reveal><span class=\"eyebrow\">Latest stories</span><h3 style=\"color:#fff;font-size:clamp(1.5rem,2.6vw,2.1rem)\">Recent outings and achievements</h3></div><a class=\"link-arrow\" href=\"/stories\" style=\"color:#fff\" data-reveal>All stories <svg><use href=\"#i-arrow\"/></svg></a></div>\n    <div class=\"grid g3\"><% stories.forEach(function(x, i){ %><%- include('partials/story-card', { s: x, i }) %><% }) %></div>\n    <% } %>"]]}, "views/news.ejs": {"h": "b94e6b065f", "e": [[7, 3, "      <a class=\"card spot\" href=\"<%= p.href || '/news/' + p.slug %>\" data-reveal style=\"--i:<%= i % 3 %>\">\n        <div class=\"thumb\"><div class=\"badges\"><span class=\"badge <%= p.category === 'Newsletter' ? 'navy' : '' %>\"><%= p.category %></span><% if (p.video || p.video_url) { %><span class=\"badge navy\"><svg style=\"width:12px;height:12px\"><use href=\"#i-play\"/></svg>Video</span><% } %></div><% if (p.sample) { %><span class=\"sample-tag\">Sample</span><% } %><%- img(p.image, p.title) || (p.isStory ? '<img src=\"/img/placeholders/community.svg\" alt=\"\">' : '<img src=\"/img/placeholders/news.svg\" alt=\"\">') %></div>\n        <div class=\"body\"><span class=\"muted\" style=\"font-size:.85rem\"><%= fmtDate(p.date) %></span><h3><%= p.title %></h3><p><%= p.summary %></p><div class=\"foot\"><span class=\"link-arrow\"><%= p.isStory ? 'Read story' : 'Read' %> <svg><use href=\"#i-arrow\"/></svg></span><% if (p.attachment) { %><span class=\"badge grey\"><svg style=\"width:14px;height:14px\"><use href=\"#i-download\"/></svg>PDF</span><% } %></div></div>"]]}, "views/story.ejs": {"h": "defe4f887c", "e": [[15, 0, "      <%- include('partials/video', { item: s }) %>"]]}, "views/partials/story-card.ejs": {"h": "f6e25a84f8", "e": [[1, 1, "  <div class=\"thumb\"><% if (s.category || s.video || s.video_url) { %><div class=\"badges\"><% if (s.category) { %><span class=\"badge\"><%= s.category %></span><% } %><% if (s.video || s.video_url) { %><span class=\"badge navy\"><svg style=\"width:12px;height:12px\"><use href=\"#i-play\"/></svg>Video</span><% } %></div><% } %><% if (s.sample) { %><span class=\"sample-tag\">Sample</span><% } %><%- img((s.images || [])[0], s.title) || '<img src=\"/img/placeholders/community.svg\" alt=\"\">' %></div>"]]}, "views/partials/video.ejs": {"new": "<% const vsrc = item.video && item.video.src ? item.video.src : ''; const emb = !vsrc && item.video_url ? videoEmbed(item.video_url) : null; %>\n<% if (vsrc) { %>\n<div class=\"video-box\" data-reveal><video controls playsinline preload=\"metadata\" src=\"<%= vsrc %>#t=0.1\"><a href=\"<%= vsrc %>\">Download the video</a></video></div>\n<% } else if (emb) { %>\n<div class=\"video-box embed\" data-reveal><iframe src=\"<%= emb %>\" title=\"<%= item.title %> (video)\" loading=\"lazy\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe></div>\n<% } else if (item.video_url && /^https?:\\/\\//i.test(item.video_url)) { %>\n<p data-reveal><a class=\"btn\" href=\"<%= item.video_url %>\" target=\"_blank\" rel=\"noopener\"><svg><use href=\"#i-play\"/></svg>Watch the video</a></p>\n<% } %>\n"}, "views/partials/icons.ejs": {"h": "56b3a40e16", "e": [[42, 0, "<symbol id=\"i-play\" viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"none\"><path d=\"M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z\"/></symbol>"]]}, "views/partials/header.ejs": {"h": "41ca554584", "e": [[15, 1, "<link rel=\"stylesheet\" href=\"/css/site.css?v=6\">"]]}, "views/admin/_field.ejs": {"h": "5a98836f6c", "e": [[17, 0, "  <% } else if (f.type === 'video') { const vo = v && v.src ? v : null; %>\n    <div data-filefield data-videofield><input type=\"hidden\" name=\"<%= f.name %>__json\" value=\"<%= JSON.stringify(vo) %>\" data-json>\n      <% if (vo) { %><video src=\"<%= vo.src %>\" controls playsinline preload=\"metadata\" style=\"width:100%;max-width:520px;border-radius:0 14px 0 14px;background:#000;margin-bottom:12px;display:block\" data-vprev></video><% } %>\n      <div class=\"filebox\"><svg><use href=\"#i-file\"/></svg><div style=\"flex:1;min-width:0\"><div class=\"nm <%= vo ? '' : 'muted' %>\" data-name><%= vo ? vo.name : 'No video uploaded' %></div><% if (vo) { %><button type=\"button\" class=\"link-btn\" data-vremove style=\"background:none;border:0;padding:0;color:var(--pink);cursor:pointer;font-size:.82rem\">Remove video</button><% } %></div>\n        <label class=\"btn sm navy\" style=\"position:relative;overflow:hidden\"><%= vo ? 'Replace video' : 'Choose video' %><input type=\"file\" name=\"<%= f.name %>__new\" accept=\"video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm\" style=\"position:absolute;inset:0;opacity:0;cursor:pointer\" data-fileinput></label></div></div>"]]}, "views/admin/_foot.ejs": {"h": "70db51218b", "e": [[2, 1, "<script src=\"/js/admin.js?v=4\"></script>"]]}, "public/css/site.css": {"h": "a5831cba50", "e": [[745, 0, "/* Videos on stories and events */\n.video-box{margin:0 0 40px;border-radius:0 28px 0 28px;overflow:hidden;background:#011f2c;box-shadow:0 18px 50px rgba(1,63,88,.18)}\n.video-box video{display:block;width:100%;max-height:78vh;background:#000}\n.video-box.embed{position:relative;aspect-ratio:16/9}\n.video-box.embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0}\n.bg-navy .card .body h3{color:var(--navy)}\n"]]}, "public/js/admin.js": {"h": "b23d9922a0", "e": [[99, 1, "    inp.addEventListener('change', () => {\n      const file = inp.files[0]; if (!file) return;\n      const nm = $('[data-name]', f);\n      if (f.hasAttribute('data-videofield') && file.size > 200 * 1024 * 1024) {\n        inp.value = ''; nm.textContent = `${file.name} is ${Math.round(file.size / 1048576)} MB. The limit is 200 MB: trim the clip, or upload it to YouTube and paste the link below.`; nm.classList.remove('muted'); return;\n      }\n      nm.textContent = `${file.name} (${Math.max(1, Math.round(file.size / 1048576))} MB, new, click Save)`; nm.classList.remove('muted');\n    });\n    const rm = $('[data-vremove]', f);\n    if (rm) rm.addEventListener('click', () => { $('[data-json]', f).value = 'null'; const pv = $('[data-vprev]', f); if (pv) pv.remove(); $('[data-name]', f).textContent = 'Video will be removed when you click Save'; rm.remove(); });"], [101, 0, "  // Large uploads: tell staff to wait\n  $$('form').forEach((form) => form.addEventListener('submit', () => {\n    const big = $$('[data-videofield] input[type=file]', form).some((i) => i.files && i.files[0]);\n    if (!big) return;\n    const note = document.createElement('div');\n    note.className = 'flash ok'; note.setAttribute('role', 'status');\n    note.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999;padding:14px 20px;border-radius:0 14px 0 14px;background:#013F58;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.25)';\n    note.textContent = 'Uploading video… this can take a minute or two. Please keep this page open.';\n    document.body.appendChild(note);\n  }));"]]}};
  for (const [rel, p] of Object.entries(P)) {
    const fp = path.join(__dirname, rel);
    if (p.new !== undefined) { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, p.new); continue; }
    if (!fs.existsSync(fp)) continue;
    const buf = fs.readFileSync(fp);
    if (crypto.createHash('sha1').update(buf).digest('hex').slice(0, 10) !== p.h) { console.warn('Update 5 skipped a changed file: ' + rel); continue; }
    const lines = buf.toString('utf8').split('\n');
    for (const [i, d, ins] of [...p.e].reverse()) lines.splice(i, d, ...(ins === null ? [] : ins.split('\n')));
    fs.writeFileSync(fp, lines.join('\n'));
  }
  console.log('Update 5 applied.');
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
// Turns a YouTube / Vimeo / Facebook link into an embeddable player address
function videoEmbed(url) {
  url = String(url || '').trim(); if (!/^https?:\/\//i.test(url)) return null;
  let m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`;
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  if (/(^|\.)facebook\.com\/|fb\.watch\//i.test(url)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  return null;
}
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
    mapQuery: U.officeMapQuery(settings),
    editLink: null,
    faqs: (page) => Items.list('faqs').filter((f) => f.page === page),
    videoEmbed,
    meta: { title: '', description: '' },
    year: new Date().getFullYear(),
  });
  next();
});

const render = (res, view, data = {}) => res.render(view, data);
const visibleRooms = () => Items.list('rooms').filter((r) => r.status !== 'Let / allocated').map((r) => ({ ...r, status: U.roomStatus(r) }));
const publicPartners = () => Items.list('partners').filter(U.partnerReady);
const upcomingEvents = () => Items.list('events').filter((e) => e.date >= U.today()).sort((a, b) => (a.date + (a.start_time || '')).localeCompare(b.date + (b.start_time || '')));
const regCount = (id) => db.prepare("SELECT COUNT(*) n FROM registrations WHERE event_id = ? AND status = 'confirmed'").get(id).n;
const withSpaces = (e) => { const taken = regCount(e.id); const cap = Number(e.capacity) || 0; return { ...e, taken, spacesLeft: cap ? Math.max(cap - taken, 0) : null, full: cap ? taken >= cap : false }; };
const storiesPublic = () => Items.list('stories').filter((s) => s.consent).sort((a, b) => String(b.date || String(b.created_at || '').slice(0, 10)).localeCompare(String(a.date || String(a.created_at || '').slice(0, 10))));
const itemDate = (x) => String(x.date || String(x.created_at || '').slice(0, 10));
// News page feed: news posts plus published tenants' stories, newest first
const newsFeed = () => [
  ...Items.list('news').map((p) => ({ ...p, href: `/news/${p.slug}` })),
  ...storiesPublic().map((s) => ({ ...s, href: `/stories/${s.slug}`, category: 'Story', image: (s.images || [])[0] || null, isStory: true })),
].sort((a, b) => itemDate(b).localeCompare(itemDate(a)));
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
    stories: storiesPublic().slice(0, 3), partners: publicPartners(), news: Items.list('news').sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 2),
  });
});
app.get('/about', (req, res) => render(res, 'about', { meta: { title: 'About us' } }));
app.get('/services', (req, res) => render(res, 'services', { meta: { title: 'Services' }, services: Items.list('services') }));

app.get('/rooms', (req, res) => {
  const rooms = visibleRooms();
  const areas = [...new Set(rooms.map((r) => r.area).filter(Boolean))].sort();
  const types = [...new Set(rooms.map((r) => r.room_type).filter(Boolean))].sort();
  render(res, 'rooms', { meta: { title: 'Rooms available' }, rooms, roomCount: rooms.filter((r) => r.status === 'Available now').length, areas, types, src: clean(req.query.src || req.query.utm_source, 40) });
});
app.get('/rooms/:slug', (req, res, next) => {
  const storedRoom = Items.bySlug('rooms', req.params.slug);
  const room = storedRoom && { ...storedRoom, status: U.roomStatus(storedRoom) };
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
  const p = publicPartners();
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
app.get('/events/:slug.ics', (req, res, next) => {
  const ev = Items.bySlug('events', req.params.slug);
  if (!ev || !ev.published) return next();
  const d = String(ev.date || '').replace(/-/g, '');
  const t = (x) => (x ? String(x).replace(':', '') + '00' : '');
  const icsEsc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => '\\' + m).replace(/\r?\n/g, '\\n');
  const start = ev.start_time ? `DTSTART;TZID=Europe/London:${d}T${t(ev.start_time)}` : `DTSTART;VALUE=DATE:${d}`;
  const end = ev.start_time ? `DTEND;TZID=Europe/London:${d}T${t(ev.end_time || ev.start_time)}` : '';
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Solace Housing//Events//EN', 'BEGIN:VEVENT', `UID:event-${ev.id}@solacehousing`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, start, end, `SUMMARY:${icsEsc(ev.title)}`, `LOCATION:${icsEsc(ev.location)}`, `DESCRIPTION:${icsEsc(ev.summary)}`, `URL:${baseUrl(req)}/events/${ev.slug}`, 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean);
  res.type('text/calendar').attachment(`${ev.slug}.ics`).send(lines.join('\r\n'));
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
app.get('/news', (req, res) => render(res, 'news', { meta: { title: 'News & newsletter' }, posts: newsFeed(), subscribed: req.query.subscribed }));
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
if (require.main === module || process.env.SOLACE_LOADER) app.listen(PORT, () => console.log(`Solace Housing running on http://localhost:${PORT}`));
module.exports = app;
