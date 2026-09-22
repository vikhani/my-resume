(function () {
  "use strict";

  var STORAGE_THEME = "resume-theme";
  var STORAGE_LANG = "resume-lang";
  var root = document.documentElement;

  var ICONS = {
    github: '<svg viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.6.24 2.77.12 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.08.78 2.18 0 1.57-.02 2.84-.02 3.23 0 .31.21.67.8.56A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.95v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.57 8.16l-1.86 8.77c-.14.63-.51.78-1.03.49l-2.85-2.1-1.37 1.32c-.15.15-.28.28-.57.28l.2-2.88 5.24-4.74c.23-.2-.05-.32-.35-.12l-6.48 4.08-2.79-.87c-.61-.19-.62-.61.13-.9l10.9-4.2c.51-.19.96.12.79.86z"/></svg>',
    habr: '<svg viewBox="0 0 24 24"><path d="M2 2h6.3v6.3H2V2zm13.7 0H22v6.3h-6.3V2zM2 15.7h6.3V22H2v-6.3zm11.3-4.2h2.4v4.2H22V22h-6.3v-6.3h-2.4V22H2v-2.4h4.2v-4.2H2v-2.4h9.1V9.1h2.2v2.4z"/></svg>'
  };

  var state = {
    lang: null,
    data: {}
  };

  // ---------- Theme ----------

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function currentSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_THEME); } catch (e) {}

    applyTheme(saved);

    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () {
        var explicit = null;
        try { explicit = localStorage.getItem(STORAGE_THEME); } catch (e) {}
        if (!explicit) applyTheme(null);
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    var btn = document.getElementById("themeToggle");
    btn.addEventListener("click", function () {
      var effective = root.getAttribute("data-theme") || currentSystemTheme();
      var next = effective === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_THEME, next); } catch (e) {}
    });
  }

  // ---------- Language ----------

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_LANG); } catch (e) {}
    if (saved === "ru" || saved === "en") return saved;
    var nav = (navigator.language || "ru").toLowerCase();
    return nav.indexOf("ru") === 0 ? "ru" : "en";
  }

  function setLang(lang) {
    if (lang !== "ru" && lang !== "en") lang = "ru";
    state.lang = lang;
    try { localStorage.setItem(STORAGE_LANG, lang); } catch (e) {}

    document.querySelectorAll("#langSwitch button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });

    loadData(lang);
  }

  function loadData(lang) {
    if (state.data[lang]) {
      render(state.data[lang]);
      return;
    }
    fetch("assets/data/" + lang + ".json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.data[lang] = data;
        render(data);
      })
      .catch(function (err) {
        console.error("Failed to load resume data", err);
      });
  }

  // ---------- Rendering ----------

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function renderBullets(bullets) {
    var ul = el("ul", "resume-item-bullets");
    bullets.forEach(function (b) {
      if (typeof b === "string") {
        ul.appendChild(el("li", null, b));
      } else if (b && b.group) {
        ul.appendChild(el("li", "bullet-group", b.group));
        var subWrapper = el("li", "bullet-group-items");
        var sub = el("ul", "resume-item-bullets");
        b.items.forEach(function (item) {
          sub.appendChild(el("li", null, item));
        });
        subWrapper.appendChild(sub);
        ul.appendChild(subWrapper);
      }
    });
    return ul;
  }

  function renderJobBody(job) {
    var frag = document.createDocumentFragment();
    if (job.summary) {
      frag.appendChild(el("p", "resume-item-summary", job.summary));
    }
    if (job.bullets && job.bullets.length) {
      frag.appendChild(renderBullets(job.bullets));
    }
    if (job.stack) {
      frag.appendChild(el("p", "resume-item-stack", job.stack));
    }
    return frag;
  }

  function renderExperienceItem(job, presentLabel) {
    var item = el("article", "resume-item");
    var header = el("div", "resume-item-header");
    header.appendChild(el("h3", "resume-item-title", job.company));
    header.appendChild(el("span", "resume-item-period", job.period));
    item.appendChild(header);

    if (job.positions) {
      var group = el("div", "positions-group");
      job.positions.forEach(function (pos) {
        var sub = el("article", "resume-item");
        var subHeader = el("div", "resume-item-header");
        subHeader.appendChild(el("h4", "resume-item-role", pos.role));
        subHeader.appendChild(el("span", "resume-item-period", pos.period));
        sub.appendChild(subHeader);
        var body = renderJobBody(pos);
        sub.appendChild(body);
        group.appendChild(sub);
      });
      item.appendChild(group);
    } else {
      if (job.role) item.appendChild(el("div", "resume-item-role", job.role));
      item.appendChild(renderJobBody(job));
    }

    return item;
  }

  function render(data) {
    var m = data.meta, p = data.profile, l = data.labels;

    document.documentElement.lang = m.htmlLang;
    document.title = m.pageTitle;
    var descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", m.description);

    document.getElementById("avatar").alt = p.avatarAlt || p.name;
    document.getElementById("name").textContent = p.name;
    document.getElementById("role").textContent = p.role;

    var pdfLink = document.getElementById("pdfLink");
    pdfLink.href = m.pdf;
    document.getElementById("pdfLabel").textContent = m.pdfLabel;
    pdfLink.setAttribute("aria-label", m.pdfAriaLabel || m.pdfLabel);
    pdfLink.title = m.pdfAriaLabel || m.pdfLabel;

    var socialList = document.getElementById("socialIcons");
    socialList.innerHTML = "";
    (data.socialIcons || []).forEach(function (s) {
      var li = document.createElement("li");
      var a = el("a", null, ICONS[s.type] || "");
      a.href = s.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", s.label);
      li.appendChild(a);
      socialList.appendChild(li);
    });

    document.getElementById("skillsTitle").textContent = l.skills;
    document.getElementById("aboutTitle").textContent = l.about;
    document.getElementById("experienceTitle").textContent = l.experience;
    document.getElementById("educationTitle").textContent = l.education;
    document.getElementById("contactsTitle").textContent = l.contacts;

    var skillsList = document.getElementById("skillsList");
    skillsList.innerHTML = "";
    data.skills.forEach(function (s) {
      skillsList.appendChild(el("dt", null, s.label));
      skillsList.appendChild(el("dd", null, s.value));
    });

    var aboutText = document.getElementById("aboutText");
    aboutText.innerHTML = "";
    data.about.forEach(function (p) {
      aboutText.appendChild(el("p", null, p));
    });

    var expList = document.getElementById("experienceList");
    expList.innerHTML = "";
    data.experience.forEach(function (job) {
      expList.appendChild(renderExperienceItem(job, l.present));
    });

    var eduList = document.getElementById("educationList");
    eduList.innerHTML = "";
    data.education.forEach(function (ed) {
      var item = el("div", "education-item resume-item");
      var header = el("div", "resume-item-header");
      header.appendChild(el("h3", "resume-item-title", ed.school));
      header.appendChild(el("span", "resume-item-period", ed.period));
      item.appendChild(header);
      item.appendChild(el("div", "resume-item-role", ed.degree));
      if (ed.note) item.appendChild(el("p", "education-note", ed.note));
      eduList.appendChild(item);
    });

    var contactsList = document.getElementById("contactsList");
    contactsList.innerHTML = "";
    data.contacts.forEach(function (c) {
      var dtLi = document.createElement("li");
      dtLi.className = "contact-label";
      dtLi.textContent = c.label;
      var ddLi = document.createElement("li");
      var a = el("a", null, c.value);
      a.href = c.href;
      if (c.href.indexOf("http") === 0) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      ddLi.appendChild(a);
      contactsList.appendChild(dtLi);
      contactsList.appendChild(ddLi);
    });
  }

  // ---------- Init ----------

  function logEasterEgg() {
    console.log(
      "%cHi, you're actually looking inside!%c\n" +
        "Yes, this resume was vibe-coded, I cherish my time.\n" +
        "No, I don't vibe-code production, because I'm the one\n" +
        "responsible for my changes. Invite me to an interview\n" +
        "round and we can discuss this!",
      "font-weight: bold;",
      "font-weight: normal;"
    );
  }

  function initLangSwitch() {
    document.querySelectorAll("#langSwitch button").forEach(function (b) {
      b.addEventListener("click", function () {
        setLang(b.getAttribute("data-lang"));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initLangSwitch();
    setLang(detectLang());
    logEasterEgg();
  });
})();
