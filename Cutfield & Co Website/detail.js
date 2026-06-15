/* Shared property detail panel + enquiry/viewing modals for subpages.
   Self-contained: injects its own CSS + markup (all prefixed pdx- to avoid
   collisions), exposes window.PropDetail.{openDetail, wireGrid}.
   Matches the homepage behaviour: click a card -> detail panel ->
   context buttons (Enquire / Book a viewing / Request sale price). */
(function () {
  if (window.PropDetail) return;
  var ENQUIRY_TO = 'harrison.cutfield@raywhite.com';
  var ENQUIRY_CC = 'harrycutfield@gmail.com';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };

  var css = ''
    + '.pdx-modal{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.62)}'
    + '.pdx-modal.open{display:flex}'
    + '.pdx-detail .pdx-card{background:var(--paper,#FAF8F2);max-width:1060px;width:100%;max-height:94vh;overflow:auto;position:relative;display:grid;grid-template-columns:1fr 1fr;font-family:var(--sans,sans-serif)}'
    + '.pdx-detail .pdx-x{position:absolute;top:14px;right:16px;font-size:32px;line-height:1;background:rgba(20,20,20,.55);width:46px;height:46px;border:0;border-radius:50%;color:#fff;cursor:pointer;z-index:4}'
    + '.pdx-media{position:relative;background:linear-gradient(150deg,#1b1b18,#3a3a32);min-height:420px}'
    + '.pdx-media img{width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0}'
    + '.pdx-badge{position:absolute;top:18px;left:18px;z-index:2;background:var(--ink,#141414);color:var(--rw-yellow,#FFE512);font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;padding:9px 15px}'
    + '.pdx-body{padding:46px 48px 44px}'
    + '.pdx-sub{font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted,#5a5446)}'
    + '.pdx-body h3{font-family:var(--serif,serif);font-size:36px;font-weight:600;line-height:1.12;margin-top:7px}'
    + '.pdx-price{font-family:var(--serif,serif);font-size:30px;color:var(--rw-yellow-deep,#F2D200);font-weight:700;margin-top:16px}'
    + '.pdx-facts{display:flex;flex-wrap:wrap;gap:24px;margin:22px 0;padding:18px 0;border-top:1px solid var(--line,#e4e0d6);border-bottom:1px solid var(--line,#e4e0d6);font-size:17px;letter-spacing:.3px;color:var(--ink,#141414);font-weight:600}'
    + '.pdx-desc{font-size:18px;line-height:1.8;color:var(--ink-soft,#2b2b2b);white-space:pre-line}'
    + '.pdx-schools{margin-top:24px}'
    + '.pdx-schools h4{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:var(--rw-yellow-deep,#F2D200);margin-bottom:12px}'
    + '.pdx-schools .sc{font-size:16.5px;line-height:1.6;color:var(--ink-soft,#2b2b2b);margin-bottom:7px}'
    + '.pdx-schools .sc b{color:var(--ink,#141414);font-weight:700}'
    + '.pdx-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:30px}'
    + '.pdx-btn{display:inline-block;font-family:var(--sans,sans-serif);font-weight:600;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;padding:17px 32px;border:1px solid var(--ink,#141414);cursor:pointer;background:transparent;color:var(--ink,#141414);transition:.3s}'
    + '.pdx-btn.solid{background:var(--ink,#141414);color:#fff}'
    + '.pdx-btn:hover{background:var(--rw-yellow,#FFE512);color:var(--ink,#141414);border-color:var(--rw-yellow,#FFE512)}'
    + '@media(max-width:760px){.pdx-detail .pdx-card{grid-template-columns:1fr}.pdx-media{min-height:240px;aspect-ratio:3/2}.pdx-body{padding:32px 26px 30px}.pdx-body h3{font-size:30px}.pdx-price{font-size:26px}.pdx-desc{font-size:17px}.pdx-facts{font-size:16px;gap:18px}.pdx-schools .sc{font-size:16px}}'
    /* form modals */
    + '.pdx-fcard{background:var(--paper,#FAF8F2);max-width:520px;width:100%;padding:42px 40px;position:relative;max-height:92vh;overflow:auto;font-family:var(--sans,sans-serif)}'
    + '.pdx-fcard .pdx-x{position:absolute;top:14px;right:18px;font-size:26px;line-height:1;cursor:pointer;color:var(--muted,#5a5446);background:none;border:0}'
    + '.pdx-eyebrow{display:inline-block;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;color:var(--rw-yellow-deep,#F2D200)}'
    + '.pdx-fcard h3{font-family:var(--serif,serif);font-size:28px;font-weight:600;margin:10px 0 6px}'
    + '.pdx-fsub{font-size:13px;color:var(--muted,#5a5446);margin-bottom:22px}'
    + '.pdx-f{margin-bottom:13px;position:relative}.pdx-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}'
    + '.pdx-f label{display:block;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted,#5a5446);margin-bottom:6px}'
    + '.pdx-f input,.pdx-f textarea{width:100%;padding:12px 14px;border:1px solid var(--line,#e4e0d6);font-family:var(--sans,sans-serif);font-size:14px;background:#fff}'
    + '.pdx-msg{font-size:13px;margin-top:12px;min-height:18px;color:var(--muted,#5a5446)}'
    + '.pdx-suggest{position:absolute;left:0;right:0;top:100%;z-index:60;background:#fff;border:1px solid var(--line,#e4e0d6);border-top:0;max-height:236px;overflow:auto;box-shadow:0 18px 40px -22px rgba(0,0,0,.45);text-align:left}'
    + '.pdx-suggest div{padding:10px 14px;font-size:13px;line-height:1.35;cursor:pointer;color:var(--ink,#141414);border-bottom:1px solid #f1eee5}'
    + '.pdx-suggest div:last-child{border-bottom:0}'
    + '.pdx-suggest div:hover,.pdx-suggest div.active{background:var(--rw-yellow,#FFE512)}'
    + '@media(max-width:560px){.pdx-two{grid-template-columns:1fr}.pdx-fcard{padding:34px 24px}}';

  var html = ''
    + '<div class="pdx-modal pdx-detail" id="pdxDetail" aria-hidden="true"><div class="pdx-card">'
    + '<button class="pdx-x" id="pdxDetailClose" aria-label="Close">&times;</button>'
    + '<div class="pdx-media" id="pdxMedia"></div>'
    + '<div class="pdx-body"><div class="pdx-sub" id="pdxSub"></div><h3 id="pdxTitle"></h3>'
    + '<div class="pdx-price" id="pdxPrice"></div><div class="pdx-facts" id="pdxFacts"></div>'
    + '<div class="pdx-desc" id="pdxDesc"></div><div class="pdx-schools" id="pdxSchools"></div>'
    + '<div class="pdx-actions" id="pdxActions"></div></div></div></div>'
    /* enquiry modal */
    + '<div class="pdx-modal" id="pdxEnq" aria-hidden="true"><div class="pdx-fcard">'
    + '<button class="pdx-x" id="pdxEnqClose" aria-label="Close">&times;</button>'
    + '<span class="pdx-eyebrow">Enquiry</span><h3 id="pdxEnqTitle">Enquire about this property</h3>'
    + '<div class="pdx-fsub" id="pdxEnqSub">Send your details and Harrison will be in touch.</div>'
    + '<form id="pdxEnqForm" novalidate>'
    + '<div class="pdx-two"><div class="pdx-f"><label>Name</label><input type="text" name="Name" autocomplete="name" required></div><div class="pdx-f"><label>Mobile</label><input type="tel" name="Mobile" autocomplete="tel" required pattern="[0-9+()\\s-]{8,}"></div></div>'
    + '<div class="pdx-f"><label>Email</label><input type="email" name="Email" autocomplete="email" required></div>'
    + '<div class="pdx-f"><label>Property Address</label><input type="text" name="Property Address" class="pdx-addr" autocomplete="street-address" required placeholder="Start typing your address…"></div>'
    + '<div class="pdx-f"><label>Message</label><textarea name="Message" rows="3"></textarea></div>'
    + '<button class="pdx-btn solid" type="submit" id="pdxEnqBtn" style="width:100%">Send Enquiry</button>'
    + '<p class="pdx-msg" id="pdxEnqMsg"></p></form></div></div>'
    /* viewing modal */
    + '<div class="pdx-modal" id="pdxView" aria-hidden="true"><div class="pdx-fcard">'
    + '<button class="pdx-x" id="pdxViewClose" aria-label="Close">&times;</button>'
    + '<span class="pdx-eyebrow">Private Viewing</span><h3 id="pdxViewTitle">Request a Private Viewing</h3>'
    + '<div class="pdx-fsub" id="pdxViewSub">Confirm your details and a preferred time, Harrison will be in touch to arrange access.</div>'
    + '<form id="pdxViewForm" novalidate>'
    + '<div class="pdx-f"><label>Full Name</label><input type="text" name="Full Name" autocomplete="name" required></div>'
    + '<div class="pdx-two"><div class="pdx-f"><label>Email</label><input type="email" name="Email" autocomplete="email" required></div><div class="pdx-f"><label>Mobile</label><input type="tel" name="Mobile" autocomplete="tel" required pattern="[0-9+()\\s-]{8,}"></div></div>'
    + '<div class="pdx-f"><label>Your Address</label><input type="text" name="Your Address" class="pdx-addr" autocomplete="street-address" required placeholder="Start typing your address…"></div>'
    + '<div class="pdx-two"><div class="pdx-f"><label>Preferred day</label><input type="date" name="Preferred Day"></div><div class="pdx-f"><label>Preferred time</label><input type="time" name="Preferred Time"></div></div>'
    + '<button class="pdx-btn solid" type="submit" id="pdxViewBtn" style="width:100%">Send Viewing Request</button>'
    + '<p class="pdx-msg" id="pdxViewMsg"></p></form></div></div>';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var holder = document.createElement('div'); holder.innerHTML = html; document.body.appendChild(holder);

  var gid = function (id) { return document.getElementById(id); };
  var body = document.body;
  var detail = gid('pdxDetail'), enq = gid('pdxEnq'), view = gid('pdxView');

  function openModal(m) { m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); body.style.overflow = 'hidden'; }
  function closeModal(m) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); if (!document.querySelector('.pdx-modal.open')) body.style.overflow = ''; }

  function openDetail(item, kind) {
    if (!item) return;
    var d = item.detail || {};
    var ref = (item.address || item.title || '') + (item.suburb ? ', ' + item.suburb : '');
    var img = (item.gallery && item.gallery[0]) || item.image || '';
    var badge = kind === 'sale' ? 'Sold' : kind === 'offmarket' ? 'Off-Market' : (item.method || 'For Sale');
    gid('pdxMedia').innerHTML = '<span class="pdx-badge">' + esc(badge) + '</span>' + (img ? '<img src="' + esc(img) + '" alt="" onerror="this.remove()">' : '');
    gid('pdxSub').textContent = item.suburb || '';
    gid('pdxTitle').textContent = item.address || item.title || 'Private Listing';
    var price = '';
    if (kind === 'sale') price = d.soldPrice ? ('Sold for ' + d.soldPrice) : 'Sold';
    else if (kind === 'offmarket') price = item.priceDisplay || 'By Negotiation';
    else price = (item.price || 'By Negotiation') + (item.method ? '   ' + item.method : '');
    gid('pdxPrice').textContent = price;
    var facts = [];
    if (+item.beds) facts.push(item.beds + ' Bed'); if (+item.baths) facts.push(item.baths + ' Bath'); if (+item.cars) facts.push(item.cars + ' Car');
    if (d.floor) facts.push(d.floor); if (d.land) facts.push(d.land); if (d.year) facts.push('Built ' + d.year);
    gid('pdxFacts').innerHTML = facts.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('');
    gid('pdxDesc').textContent = d.description || '';
    var sc = d.schools || {}, rows = [];
    if (sc.primary) rows.push('<div class="sc"><b>Primary:</b> ' + esc(sc.primary) + '</div>');
    if (sc.intermediate) rows.push('<div class="sc"><b>Intermediate:</b> ' + esc(sc.intermediate) + '</div>');
    if (sc.secondary) rows.push('<div class="sc"><b>Secondary:</b> ' + esc(sc.secondary) + '</div>');
    gid('pdxSchools').innerHTML = rows.length ? ('<h4>School Zones</h4>' + rows.join('') + '<div class="sc" style="margin-top:8px;font-size:11.5px;opacity:.75">Zone boundaries can change. Confirm in-zone status for the exact address at educationcounts.govt.nz before relying on it.</div>') : '';
    var acts = '';
    if (kind === 'sale') { if (!d.soldPrice) acts += '<button class="pdx-btn solid pdx-enq" data-kind="price" data-ref="' + esc('Sale price, ' + ref) + '">Request sale price</button>'; acts += '<button class="pdx-btn pdx-enq" data-kind="sale" data-ref="' + esc(ref) + '">Ask about this sale</button>'; }
    else if (kind === 'offmarket') { acts += '<button class="pdx-btn solid pdx-view" data-ref="' + esc(ref) + '">Request a viewing</button>'; acts += '<button class="pdx-btn pdx-enq" data-kind="offmarket" data-ref="' + esc(ref) + '">Enquire</button>'; }
    else { acts += '<button class="pdx-btn solid pdx-enq" data-kind="listing" data-ref="' + esc(ref) + '">Enquire</button>'; acts += '<button class="pdx-btn pdx-view" data-ref="' + esc(ref) + '">Book a viewing</button>'; }
    gid('pdxActions').innerHTML = acts;
    openModal(detail);
    if (window.gtag) gtag('event', 'property_view', { property: ref, property_kind: kind });
  }

  function openEnq(ref, kind) {
    closeModal(detail);
    gid('pdxEnqForm').dataset.ref = ref || '';
    gid('pdxEnqTitle').textContent = (kind === 'price' ? 'Request the sale price' : (kind === 'sale' ? 'Ask about this sale' : 'Enquire about this property'));
    gid('pdxEnqSub').textContent = (kind === 'price' ? 'Send your details and Harrison will be in touch with the recent sale price for this property.' : (ref || 'Send your details and Harrison will be in touch.'));
    gid('pdxEnqMsg').textContent = '';
    openModal(enq);
  }
  function openView(ref) {
    closeModal(detail);
    gid('pdxViewForm').dataset.ref = ref || '';
    gid('pdxViewTitle').textContent = 'Private Viewing' + (ref ? ', ' + ref : '');
    gid('pdxViewMsg').textContent = '';
    openModal(view);
  }

  async function sendToInbox(fd, subject) {
    fd.append('_subject', subject); fd.append('_cc', ENQUIRY_CC); fd.append('_template', 'table'); fd.append('_captcha', 'false');
    try { var r = await fetch('https://formsubmit.co/ajax/' + ENQUIRY_TO, { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd }); var j = await r.json().catch(function () { return {}; }); return r.ok && (j.success === 'true' || j.success === true); } catch (e) { return false; }
  }

  /* close handlers */
  gid('pdxDetailClose').addEventListener('click', function () { closeModal(detail); });
  gid('pdxEnqClose').addEventListener('click', function () { closeModal(enq); });
  gid('pdxViewClose').addEventListener('click', function () { closeModal(view); });
  [detail, enq, view].forEach(function (m) { m.addEventListener('click', function (e) { if (e.target === m) closeModal(m); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(detail); closeModal(enq); closeModal(view); } });

  /* panel action buttons */
  detail.addEventListener('click', function (e) {
    var en = e.target.closest('.pdx-enq'); if (en) { e.preventDefault(); openEnq(en.dataset.ref, en.dataset.kind); return; }
    var vw = e.target.closest('.pdx-view'); if (vw) { e.preventDefault(); openView(vw.dataset.ref); }
  });

  /* enquiry submit */
  gid('pdxEnqForm').addEventListener('submit', async function (e) {
    e.preventDefault(); var f = e.target; if (!f.reportValidity()) return;
    var fd = new FormData(f), ref = f.dataset.ref || ''; if (ref) fd.append('Property', ref);
    var btn = gid('pdxEnqBtn'), msg = gid('pdxEnqMsg'); btn.disabled = true; btn.textContent = 'Sending…'; msg.style.color = 'var(--muted,#5a5446)'; msg.textContent = '';
    var ok = await sendToInbox(fd, 'Property enquiry' + (ref ? ', ' + ref : ''));
    if (ok) { if (window.gtag) gtag('event', 'generate_lead', { property: ref, lead_type: 'enquiry' }); msg.style.color = '#1a7a3a'; msg.textContent = 'Sent. Harrison will be in touch shortly.'; f.reset(); btn.textContent = 'Sent ✓'; setTimeout(function () { closeModal(enq); }, 2400); setTimeout(function () { btn.disabled = false; btn.textContent = 'Send Enquiry'; }, 2600); }
    else { msg.style.color = '#b00020'; msg.innerHTML = 'Could not send, please email <a href="mailto:' + ENQUIRY_TO + '">' + ENQUIRY_TO + '</a>.'; btn.disabled = false; btn.textContent = 'Send Enquiry'; }
  });
  /* viewing submit */
  gid('pdxViewForm').addEventListener('submit', async function (e) {
    e.preventDefault(); var f = e.target; if (!f.reportValidity()) return;
    var fd = new FormData(f), ref = f.dataset.ref || ''; if (ref) fd.append('Listing', ref);
    var btn = gid('pdxViewBtn'), msg = gid('pdxViewMsg'); btn.disabled = true; btn.textContent = 'Sending…'; msg.style.color = 'var(--muted,#5a5446)'; msg.textContent = '';
    var ok = await sendToInbox(fd, 'Private viewing request' + (ref ? ', ' + ref : ''));
    if (ok) { if (window.gtag) gtag('event', 'schedule_viewing', { property: ref }); msg.style.color = '#1a7a3a'; msg.textContent = 'Request received. Harrison will confirm a time and be in touch very soon.'; f.reset(); btn.textContent = 'Sent ✓'; setTimeout(function () { closeModal(view); }, 2400); setTimeout(function () { btn.disabled = false; btn.textContent = 'Send Viewing Request'; }, 2600); }
    else { msg.style.color = '#b00020'; msg.innerHTML = 'Could not send, please email <a href="mailto:' + ENQUIRY_TO + '">' + ENQUIRY_TO + '</a>.'; btn.disabled = false; btn.textContent = 'Send Viewing Request'; }
  });

  /* address autocomplete (Photon, NZ biased) */
  (function () {
    var label = function (p) { var out = []; if (p.name && !p.street) out.push(p.name); var l1 = [p.housenumber, p.street].filter(Boolean).join(' '); if (l1) out.push(l1); var l2 = [p.suburb || p.district, p.city, p.postcode].filter(Boolean).join(', '); if (l2) out.push(l2); return out.join(', '); };
    function attach(inp) {
      if (inp.__addr) return; inp.__addr = 1;
      var wrap = inp.closest('.pdx-f') || inp.parentElement; var box = null, items = [], active = -1, t = null;
      var close = function () { if (box) { box.remove(); box = null; } items = []; active = -1; };
      var render = function (list) { close(); if (!list.length) return; box = document.createElement('div'); box.className = 'pdx-suggest'; list.forEach(function (txt) { var dv = document.createElement('div'); dv.textContent = txt; dv.addEventListener('mousedown', function (e) { e.preventDefault(); inp.value = txt; close(); }); box.appendChild(dv); }); wrap.appendChild(box); items = [].slice.call(box.children); };
      var search = async function (q) { try { var r = await fetch('https://photon.komoot.io/api/?q=' + encodeURIComponent(q) + '&limit=6&lang=en&lat=-36.8&lon=174.76'); var j = await r.json(); var f = (j.features || []).filter(function (x) { return x.properties && x.properties.countrycode === 'NZ'; }).map(function (x) { return label(x.properties); }).filter(Boolean); render(Array.from(new Set(f))); } catch (_) { close(); } };
      inp.addEventListener('input', function () { var q = inp.value.trim(); if (t) clearTimeout(t); if (q.length < 3) { close(); return; } t = setTimeout(function () { search(q); }, 280); });
      inp.addEventListener('keydown', function (e) { if (!box) return; if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); } else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); } else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); inp.value = items[active].textContent; close(); return; } else if (e.key === 'Escape') { close(); return; } else { return; } items.forEach(function (it, i) { it.classList.toggle('active', i === active); }); });
      inp.addEventListener('blur', function () { setTimeout(close, 150); });
    }
    document.querySelectorAll('input.pdx-addr').forEach(attach);
  })();

  function wireGrid(gridEl, items, kind) {
    if (!gridEl) return;
    gridEl.style.cursor = 'pointer';
    gridEl.addEventListener('click', function (e) {
      var card = e.target.closest('[data-i]'); if (!card || !gridEl.contains(card)) return;
      var item = items[+card.dataset.i]; if (item) openDetail(item, kind);
    });
  }

  window.PropDetail = { openDetail: openDetail, wireGrid: wireGrid };
})();
