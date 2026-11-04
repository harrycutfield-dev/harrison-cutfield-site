/* Shared enquiry sender with a guaranteed fallback.
   Harrison's forms used to post straight to FormSubmit. On 4 Nov 2026 FormSubmit went
   down (Cloudflare 522, whole service) and every form on the site silently failed, so
   every lead in that window was lost.

   ccSend() now:
     1. tries FormSubmit with a hard timeout, and
     2. on ANY failure hands back a ready to send mailto: link carrying the whole
        enquiry, so the buyer's own mail app delivers it.
   The lead can no longer be lost because a third party is offline. */
(function (w) {
  var TO = 'harrison.cutfield@raywhite.com';
  var CC = 'harrycutfield@gmail.com';
  var PHONE = '021 136 1955';
  var TIMEOUT = 9000;

  /* keys FormSubmit uses for control, never shown to the reader */
  function isMeta(k) { return k.charAt(0) === '_'; }

  function readable(fd) {
    var lines = [], seen = {};
    fd.forEach(function (v, k) {
      if (isMeta(k)) return;
      v = String(v == null ? '' : v).trim();
      if (!v) return;
      if (seen[k]) { seen[k] += ', ' + v; } else { seen[k] = v; lines.push(k); }
    });
    return lines.map(function (k) { return k + ': ' + seen[k]; }).join('\n');
  }

  function mailtoUrl(fd, subject) {
    var body = readable(fd) + '\n\nSent from harrisoncutfield.co.nz';
    return 'mailto:' + TO
      + '?cc=' + encodeURIComponent(CC)
      + '&subject=' + encodeURIComponent(subject || 'Website enquiry')
      + '&body=' + encodeURIComponent(body);
  }

  /* Returns a promise for { ok, mailto, reason }.
     ok true  = FormSubmit accepted it, nothing more to do.
     ok false = show the mailto link. Never treat this as a dead end. */
  function ccSend(fd, subject) {
    var mail = mailtoUrl(fd, subject);
    try {
      fd.append('_subject', subject || 'Website enquiry');
      fd.append('_cc', CC);
      fd.append('_template', 'table');
      fd.append('_captcha', 'false');
    } catch (e) { return Promise.resolve({ ok: false, mailto: mail, reason: 'formdata' }); }

    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT);

    return fetch('https://formsubmit.co/ajax/' + TO, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json().catch(function () { return {}; });
    }).then(function (j) {
      clearTimeout(timer);
      var ok = (j.success === 'true' || j.success === true);
      return ok ? { ok: true } : { ok: false, mailto: mail, reason: 'rejected' };
    }).catch(function (e) {
      clearTimeout(timer);
      return { ok: false, mailto: mail, reason: (e && e.name === 'AbortError') ? 'timeout' : 'offline' };
    });
  }

  /* Drops a friendly fallback panel into `el`. Not an error message: the buyer is one
     click from sending, and the click target is their own mail app. */
  function ccFallback(el, mail) {
    if (!el) return;
    el.innerHTML =
      '<div style="background:#fff8dc;border-left:5px solid #FFE512;padding:18px 20px;text-align:left;margin-top:14px">'
      + '<b style="display:block;font-size:16px;margin-bottom:6px">One more tap and it is on its way.</b>'
      + '<p style="font-size:14.5px;line-height:1.6;color:#2b2b2b;margin:0 0 14px">'
      + 'Our form service is having a moment. Everything you typed is ready to go, so send it '
      + 'straight from your own email instead.</p>'
      + '<a href="' + mail + '" style="display:inline-block;background:#FFE512;color:#141414;'
      + 'text-decoration:none;font-size:12.5px;letter-spacing:2px;text-transform:uppercase;'
      + 'font-weight:700;padding:14px 26px">Send it now</a>'
      + '<p style="font-size:13px;color:#5a5446;margin:14px 0 0">In a hurry? Call Harrison on '
      + '<a href="tel:+64211361955" style="color:#141414;font-weight:700">' + PHONE + '</a>.</p>'
      + '</div>';
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }
  }

  w.ccSend = ccSend;
  w.ccFallback = ccFallback;
  w.ccMailto = mailtoUrl;
})(window);
