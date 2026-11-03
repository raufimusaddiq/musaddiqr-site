/* Stat strip. Every figure comes from /assets/stats.json or the card is absent —
   never zero, never a fallback. Freshness window comes from the file itself. */
(function () {
  var stats = document.getElementById('stats');
  var stamp = document.getElementById('stamp');
  var FILE = 'assets/stats.json';
  var DEFAULT_MAX_AGE_H = 24;

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  var num = function (v) {
    return typeof v === 'number' && isFinite(v) && v >= 0 ? v : null;
  };

  var when = function (iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  };

  /* cards in mockup order: pink, sun, cobalt */
  var CARDS = [
    {
      key: 'services_running',
      tone: 'pink',
      label: 'services running',
      value: function (s) {
        var n = num(s.services_running);
        return n === null ? null : String(Math.round(n));
      },
      unit: 'running at the last check'
    },
    {
      key: 'host_uptime_seconds',
      tone: 'sun',
      label: 'host uptime',
      value: function (s) {
        var n = num(s.host_uptime_seconds);
        if (n === null) return null;
        var d = Math.floor(n / 86400);
        return { v: d > 0 ? String(d) : String(Math.floor(n / 3600)), u: d > 0 ? 'days, uninterrupted' : 'hours, uninterrupted' };
      },
      unit: 'without an interruption'
    },
    {
      key: 'hostnames_answering',
      tone: 'cobalt',
      label: 'hostnames answering',
      value: function (s) {
        var a = num(s.hostnames_answering), t = num(s.hostnames_checked);
        return a === null || t === null ? null : a + ' / ' + t;
      },
      unit: 'answered at the last sweep'
    }
  ];

  var fail = function (why) {
    stats.innerHTML = '';
    stamp.innerHTML = 'the latest numbers, read from the machine that serves this page';
    stats.innerHTML = '';
    return;
  };

  fetch(FILE, { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (s) {
      var gen = when(s.generated_at);
      if (!gen) return fail('carries no valid generated_at');

      var maxAge = num(s.max_age_hours) || DEFAULT_MAX_AGE_H;
      var stale = Date.now() - gen.getTime() > maxAge * 3600e3;

      var iso = gen.toISOString();
      var shown = iso.slice(0, 16).replace('T', ' ') + ' UTC';
      stamp.innerHTML = 'read from the machine that serves this page at <b><time datetime="' + esc(iso) + '">' + esc(shown) + '</time></b>' +
        (stale ? ' · older than ' + maxAge + ' hours, figures withheld' : '');

      if (stale) { stats.innerHTML = ''; return; }

      var html = '';
      CARDS.forEach(function (c) {
        var out = c.value(s);
        if (out === null) return;
        var v = typeof out === 'string' ? out : out.v;
        var u = typeof out === 'string' ? c.unit : out.u;
        if (!v) return;
        html += '<div class="st ' + c.tone + '"><div class="k">' + esc(c.label) +
          '</div><div class="v">' + esc(v) + '</div><div class="u">' + esc(u) + '</div></div>';
      });
      stats.innerHTML = html;
    })
    .catch(function (e) {
      fail('could not be read (' + e.message + ')');
    });
})();

/* Autoplay nudge. A strict autoplay policy, or iOS low-power mode, can leave a
   muted looping teaser parked on its poster. Start it, and retry once on the
   first real interaction. No controls, no second script. */
(function () {
  var videos = document.querySelectorAll('video[autoplay]');
  var kick = function () {
    Array.prototype.forEach.call(videos, function (v) {
      if (!v.paused) return;
      var started = v.play();
      if (started && started.catch) started.catch(function () {});
    });
  };
  kick();
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, kick, { once: true, passive: true });
  });
})();
