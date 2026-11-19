/* Stat strip. Every figure comes from /assets/stats.json or the card is absent:
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

  /* cards in order: pink, sun. hostnames_answering is still collected but not
     shown: it counts other people's hostnames too, and a partial figure reads
     as this host being unhealthy. Shown always or never, not only when 20/20. */
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
    }
  ];

  var fail = function (why) {
    stats.innerHTML = '<p class="state">Host figures could not be read: ' + esc(why) +
      '. Reload the page to try again.</p>';
    stamp.innerHTML = 'Snapshot unavailable. Check that <b>assets/stats.json</b> is generated on the host.';
    stats.setAttribute('aria-busy', 'false');
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
      var ageMinutes = Math.max(0, Math.floor((Date.now() - gen.getTime()) / 60000));
      var age = ageMinutes < 60 ? ageMinutes + ' min' :
        ageMinutes < 1440 ? Math.floor(ageMinutes / 60) + ' h' :
        Math.floor(ageMinutes / 1440) + ' d';

      var iso = gen.toISOString();
      var shown = iso.slice(0, 16).replace('T', ' ') + ' UTC';
      stamp.innerHTML = 'Snapshot generated on the host at <b><time datetime="' + esc(iso) + '">' + esc(shown) + '</time></b>, ' + age + ' old.' +
        (stale ? ' Older than ' + maxAge + ' hours; figures withheld.' : '');

      if (stale) {
        stats.innerHTML = '<p class="state">Figures withheld: this snapshot is older than ' + maxAge +
          ' hours. Run <b>scripts/collect-stats.sh</b> on the host.</p>';
        stats.setAttribute('aria-busy', 'false');
        return;
      }

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
      stats.innerHTML = html || '<p class="state">No sourced figures are in this snapshot.</p>';
      stats.setAttribute('aria-busy', 'false');
    })
    .catch(function (e) {
      fail(e.message);
    });
})();

/* Motion. Controls are always available; reduced motion keeps the poster until
   the visitor presses play, and never loops. */
(function () {
  var videos = document.querySelectorAll('video');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var sync = function () {
    Array.prototype.forEach.call(videos, function (v) {
      if (reduced.matches) {
        v.pause();
        v.loop = false;
        return;
      }
      v.loop = true;
      var started = v.play();
      if (started && started.catch) started.catch(function () {});
    });
  };

  sync();
  if (reduced.addEventListener) reduced.addEventListener('change', sync);
})();

/* How work moves: pick a path, then break something. Illustrative, not live data.
   Without script the static map below stays; with it, this replaces the map. */
(function () {
  var host = document.getElementById('flow');
  if (!host) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* nodes: [label, colour]. Each scenario says how far the work gets (reach), whether
     it is held there (stop), a note pinned to one node, the end state's colour, and
     what the little agent says when it gets there. */
  var LANES = [
    {
      name: 'Handoff', bot: '#ff6fae',
      nodes: [['human', 'pink'], ['agent', ''], ['handoff', 'cobalt'], ['coding agent', '']],
      stops: 'The handoff itself. Context and chat travel with the work, so it never arrives as a bare sentence.',
      good: {reach: 3, note: [2, 'thread attached'], end: 'ok', mood: 'got it',
        say: 'The brief goes out with its context and the chat it came from, and the reply comes back in the same thread.'},
      bad: {reach: 3, note: [1, 'a one-line ask'], end: 'ok', mood: 'I see why',
        say: 'The agent wrote a one-line ask. The handoff still carries the thread, so the coding agent sees the reasoning, not just the sentence.'}
    },
    {
      name: 'Review', bot: '#7bffbf',
      nodes: [['mission', 'mint'], ['pull request', ''], ['review gate', 'cobalt'], ['merge', '']],
      stops: 'The review gate. A reviewer agent checks the exact commit, and nothing merges until it passes.',
      good: {reach: 3, note: [2, 'passes'], end: 'ok', mood: 'merged',
        say: 'A reviewer agent checks the exact commit on the pull request. It passes, so it merges.'},
      bad: {reach: 2, stop: true, note: [2, 'a test fails'], mood: 'blocked',
        say: 'A test fails on that commit. Nothing merges until it passes, however sure the agent sounded.'}
    },
    {
      name: 'Watch', bot: '#ffd42e', unit: 'drone',
      nodes: [['cron', 'sun'], ['agent', ''], ['check', 'cobalt'], ['alert', '']],
      stops: 'A scheduled job that speaks only when something is wrong, so a failure is not found weeks later.',
      good: {reach: 2, stop: true, note: [2, 'all fine'], mood: 'shh',
        say: 'Every check passes, so nothing is sent. Silence here means healthy, not forgotten.'},
      bad: {reach: 3, note: [2, 'disk almost full'], end: 'bad', mood: 'heads up!',
        say: 'Something is wrong, so one message goes to a person today, not weeks later.'}
    },
    {
      name: 'Release', bot: '#7bffbf',
      nodes: [['change', 'mint'], ['approval', 'cobalt'], ['deployment', '']],
      stops: 'An approval step. Nothing destructive happens without a person saying yes.',
      good: {reach: 2, note: [1, 'a person said yes'], end: 'ok', mood: 'shipped',
        say: 'A person says yes, and it deploys.'},
      bad: {reach: 1, stop: true, note: [1, 'no one yet'], mood: 'waiting',
        say: 'No one has said yes, so the deploy waits. It never times out into a release.'}
    }
  ];

  var make = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };
  var group = function (label) {
    var g = make('div', 'seg');
    g.setAttribute('role', 'group');
    g.setAttribute('aria-label', label);
    return g;
  };

  host.className = 'flow';
  var ctl = make('div', 'flow-ctl');
  var lanes = group('Path');
  var mode = group('What happens');

  var stage = make('div', 'stage');
  var track = make('div', 'track');
  var walker = make('div', 'walker');
  walker.setAttribute('aria-hidden', 'true');
  var bubble = make('span', 'bubble');
  var bot = document.createElementNS(SVGNS, 'svg');
  bot.setAttribute('viewBox', '0 0 64 84');
  var use = document.createElementNS(SVGNS, 'use');
  use.setAttribute('href', '#bot');
  bot.appendChild(use);
  walker.appendChild(bubble);
  walker.appendChild(bot);
  stage.appendChild(walker);
  stage.appendChild(track);

  var foot = make('div', 'flow-foot');
  var what = make('div', 'what');
  what.appendChild(make('p', 'k', 'What happened'));
  var say = what.appendChild(make('p', 'say'));
  say.setAttribute('aria-live', 'polite');
  var stops = make('div', 'stops');
  stops.appendChild(make('p', 'k', 'What stops it'));
  var stopsSay = stops.appendChild(make('p', 'say'));
  foot.appendChild(what);
  foot.appendChild(stops);
  var tryIt = make('p', 'try', 'Try it: pick a path, then press break it. Illustrative, not live data.');

  var cur = 0, broken = false, timers = [], nodes = [];
  var laneBtns = LANES.map(function (l, i) {
    var b = make('button', '', l.name);
    b.type = 'button';
    b.addEventListener('click', function () { cur = i; render(); });
    lanes.appendChild(b);
    return b;
  });
  var okBtn = make('button', '', 'All good');
  var badBtn = make('button', 'brk', 'Break it');
  [okBtn, badBtn].forEach(function (b, i) {
    b.type = 'button';
    b.addEventListener('click', function () { broken = i === 1; render(); });
    mode.appendChild(b);
  });

  ctl.appendChild(lanes);
  ctl.appendChild(mode);
  host.appendChild(ctl);
  host.appendChild(stage);
  host.appendChild(foot);
  host.appendChild(tryIt);

  /* the agent stands over node i */
  var place = function (i) {
    var n = nodes[i];
    if (!n) return;
    walker.style.transform = 'translateX(' + Math.round(n.offsetLeft + n.offsetWidth / 2 - walker.offsetWidth / 2) + 'px)';
  };

  function render() {
    timers.forEach(clearTimeout);
    timers = [];
    var lane = LANES[cur];
    var sc = broken ? lane.bad : lane.good;
    laneBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === cur)); });
    okBtn.setAttribute('aria-pressed', String(!broken));
    badBtn.setAttribute('aria-pressed', String(broken));

    track.textContent = '';
    nodes = [];
    var links = [];
    lane.nodes.forEach(function (n, i) {
      if (i) links.push(track.appendChild(make('div', 'flink')));
      nodes.push(track.appendChild(make('div', 'fnode ' + n[1], n[0])));
    });
    say.textContent = '';
    stopsSay.textContent = lane.stops;
    bot.style.color = lane.bot;
    var flying = lane.unit === 'drone';
    bot.setAttribute('viewBox', flying ? '0 0 64 46' : '0 0 64 84');
    use.setAttribute('href', flying ? '#drone' : '#bot');
    walker.classList.toggle('flying', flying);
    bubble.textContent = '';
    bubble.className = 'bubble';
    walker.classList.remove('held');

    var step = reduced.matches ? 0 : 460;
    walker.classList.add('jump');
    place(0);
    void walker.offsetWidth;
    walker.classList.remove('jump');

    var finish = function () {
      if (sc.stop) {
        nodes[sc.reach].classList.add('held');
        walker.classList.add('held');
      }
      if (sc.end && sc.reach === nodes.length - 1) nodes[sc.reach].classList.add(sc.end);
      if (sc.note) nodes[sc.note[0]].appendChild(make('span', 'fnote', sc.note[1]));
      bubble.textContent = sc.mood;
      bubble.className = 'bubble on' + (sc.stop || sc.end === 'bad' ? ' warn' : '');
      say.textContent = sc.say;
    };
    for (var i = 0; i <= sc.reach; i++) {
      (function (i) {
        var go = function () {
          nodes[i].classList.add('on');
          if (i) links[i - 1].classList.add('on');
          place(i);
          if (i === sc.reach) timers.push(setTimeout(finish, step ? 260 : 0));
        };
        if (step) timers.push(setTimeout(go, 120 + i * step)); else go();
      })(i);
    }
  }

  window.addEventListener('resize', function () {
    var lit = track.querySelectorAll('.fnode.on');
    walker.classList.add('jump');
    place(lit.length - 1);
    void walker.offsetWidth;
    walker.classList.remove('jump');
  });

  render();
})();

/* Scrolling: eased jumps from the nav, a sliding indicator for the section in view,
   a reading-progress line, and cards that rise in as they arrive. Reduced motion
   gets plain jumps and no reveal. */
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nav = document.querySelector('nav');
  var links = nav && nav.querySelector('.links');
  if (!nav || !links) return;
  root.classList.add('js');

  var sticky = function () { return getComputedStyle(nav).position === 'sticky'; };
  var offset = function () { return (sticky() ? nav.offsetHeight : 0) + 14; };

  /* reading progress, along the bottom edge of the nav */
  var bar = document.createElement('span');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  nav.appendChild(bar);

  /* the sliding pill behind the current section's link */
  var ind = document.createElement('span');
  ind.className = 'ind';
  ind.setAttribute('aria-hidden', 'true');
  links.insertBefore(ind, links.firstChild);
  var spy = Array.prototype.filter.call(links.querySelectorAll('a[href^="#"]'), function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  });
  var current;
  var setActive = function (a) {
    if (a === current) return;
    current = a;
    spy.forEach(function (x) {
      if (x === a) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current');
    });
    if (!a || a.offsetParent === null) { ind.classList.remove('on'); return; }
    var first = !ind.classList.contains('on');
    if (first) ind.style.transition = 'none';
    ind.style.width = a.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    if (first) { void ind.offsetWidth; ind.style.transition = ''; }
    ind.classList.add('on');
  };

  var tick = false;
  var update = function () {
    tick = false;
    var max = root.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    var line = offset() + window.innerHeight * 0.3, active = null;
    spy.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el.getBoundingClientRect().top <= line) active = a;
    });
    if (max - window.scrollY < 4) active = spy[spy.length - 1] || active;
    setActive(active);
  };
  var request = function () { if (!tick) { tick = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', request, {passive: true});
  window.addEventListener('resize', function () { current = undefined; request(); });
  update();

  /* eased jump to a section, then a marker sweeps across its label */
  var anim = null;
  var stop = function () {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    if (root.classList.contains('gliding')) { settle(); root.classList.remove('gliding'); }
  };
  ['wheel', 'touchstart', 'keydown'].forEach(function (e) { window.addEventListener(e, stop, {passive: true}); });
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var arrive = function (el) {
    var label = el.querySelector('h2') || el;
    label.classList.remove('arrive');
    void label.offsetWidth;
    label.classList.add('arrive');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({preventScroll: true});
  };
  /* set below once the reveal is wired; shows everything the glide will pass */
  var settle = function () {};
  var go = function (el, hash) {
    stop();
    root.classList.add('gliding');
    var from = window.scrollY;
    var to = Math.max(0, Math.min(el.getBoundingClientRect().top + from - offset(), root.scrollHeight - window.innerHeight));
    if (history.pushState) history.pushState(null, '', hash);
    var done = function () { anim = null; settle(); root.classList.remove('gliding'); arrive(el); };
    if (reduced.matches || Math.abs(to - from) < 2) { window.scrollTo(0, to); done(); return; }
    var dur = Math.min(1100, Math.max(450, Math.abs(to - from) * 0.32));
    var t0 = null;
    var step = function (t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      window.scrollTo(0, from + (to - from) * ease(p));
      if (p < 1) anim = requestAnimationFrame(step); else done();
    };
    anim = requestAnimationFrame(step);
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var hash = a.getAttribute('href');
    var el = hash.length > 1 && document.getElementById(hash.slice(1));
    if (!el) return;
    e.preventDefault();
    go(el, hash);
  });

  /* cards rise in as they reach the screen, a few at a time */
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  var items = document.querySelectorAll('.hero-text > *, .hero-pic, .path, .fcard, .proj, .mcard, .mech, figure.mo, .lane, .flow, .pcard, .grp, .about, #contact .cta, section > .big');
  var io = new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (x) { return x.isIntersecting; });
    batch.forEach(function (x, i) {
      x.target.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
      x.target.classList.add('in');
      io.unobserve(x.target);
    });
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
  /* after a glide, everything above the fold's bottom is already shown: mark it so */
  settle = function () {
    Array.prototype.forEach.call(document.querySelectorAll('.rv:not(.in)'), function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('in'); io.unobserve(el); }
    });
  };
  Array.prototype.forEach.call(items, function (el) {
    /* what is already on screen at load stays put, so nothing flashes */
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add('rv');
    io.observe(el);
  });
  /* drop the delay once shown, so hover transitions stay instant */
  document.addEventListener('transitionend', function (e) {
    if (e.target.classList && e.target.classList.contains('in')) e.target.style.transitionDelay = '';
  });
})();
