// The bench: each indickit package alone, live, one tab each.
//
// `kit` holds the indickit modules; `data` is out/bench.json: the words of 50
// PIB releases by language (after normalize, with their document counts) and
// one title a language.

const TOKEN = /[\p{L}\p{M}\u200C\u200D]+/gu;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hex = (s) => [...s].map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));
const fmt = (n) => n.toLocaleString("en-IN");

export const LANG_NAMES = {
  as: "Assamese", bn: "Bengali", brx: "Bodo", doi: "Dogri", gu: "Gujarati", hi: "Hindi", kn: "Kannada",
  ks: "Kashmiri", gom: "Konkani", mai: "Maithili", ml: "Malayalam", mni: "Manipuri", mr: "Marathi",
  ne: "Nepali", or: "Odia", pa: "Punjabi", sa: "Sanskrit", sat: "Santali", sd: "Sindhi", ta: "Tamil",
  te: "Telugu", ur: "Urdu", kha: "Khasi",
};
const RTL = new Set(["ur", "ks", "sd"]);
const dir = (lang) => (RTL.has(lang) ? 'dir="rtl"' : "");

// Tables that romanize, deromanize and phonetic-search load, one language at a time.
const loaded = new Map();
function once(key, make) {
  if (!loaded.has(key)) loaded.set(key, make().catch((e) => { loaded.delete(key); throw e; }));
  return loaded.get(key);
}
export const loadRomanizer = (kit, lang, mode) => once(`r:${lang}:${mode}`, () => kit.romanize.load(lang, mode));
export const loadDeromanizer = (kit, lang, mode) => once(`d:${lang}:${mode}`, () => kit.deromanize.load(lang, mode));

function options(langs, selected) {
  return langs.map((l) => `<option value="${l}" ${l === selected ? "selected" : ""}>${LANG_NAMES[l] ?? l} (${l})</option>`).join("");
}
function presets(list) {
  return `<div class="presets">${list.map((p, i) => `<button type="button" class="preset" data-i="${i}"><span ${p.lang ? `lang="${p.lang}" ${dir(p.lang)}` : ""}>${esc(p.label)}</span><small>${esc(p.note)}</small></button>`).join("")}</div>`;
}
function onPreset(root, list, apply) {
  root.querySelector(".presets").addEventListener("click", (e) => {
    const b = e.target.closest(".preset");
    if (b) apply(list[+b.dataset.i]);
  });
}
const debounce = (f, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };

// The releases' words in one language, after normalize, with how many documents hold each.
const vocabulary = (data, lang) => new Map(Object.entries(data.words[lang] ?? {}));

// ---- the panels ------------------------------------------------------------------

const PANELS = [
  {
    id: "normalize",
    render(root, { kit }) {
      const list = [
        { label: "হয়েছে", lang: "bn", note: "Bengali য়, one code point (111 times here)", text: "হয়েছে" },
        { label: "ঐখোয়গী", lang: "mni", note: "Manipuri, the same য় (204 times)", text: "ঐখোয়গী" },
        { label: "ഞാന്\u200D", lang: "ml", note: "Malayalam, the old chillu (59 times)", text: "ഞാന്\u200D" },
        { label: "ਦੇਸ਼", lang: "pa", note: "Punjabi ਸ਼, one code point (222 times)", text: "ਦੇਸ਼" },
        { label: "ज़िम्मेदारी", lang: "hi", note: "Hindi ज़, one code point", text: "ज़िम्मेदारी" },
        { label: "آج", lang: "ur", note: "Urdu آ, typed as ا + madda (35 times)", text: "آج" },
      ];
      root.innerHTML = `
        <div class="try">
          <label class="field"><span>Text</span><input id="nz-in" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field narrow"><span>Language</span><select id="nz-lang">${options(Object.keys(LANG_NAMES).filter((l) => l !== "kha"), "bn")}</select></label>
        </div>
        ${presets(list)}
        <div class="out" id="nz-out" aria-live="polite"></div>`;
      const show = () => {
        const lang = $("nz-lang").value, t = $("nz-in").value;
        const n = kit.normalize(t, lang);
        const a = hex(t), b = hex(n);
        let p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++;
        let s = 0; while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
        const chips = (cs) => cs.map((c, i) => `<span class="cp ${i >= p && i < cs.length - s ? "diff" : ""}">${c}</span>`).join("");
        $("nz-out").innerHTML = `
          <div class="pair"><span class="tag">typed</span><span class="big" lang="${lang}" ${dir(lang)}>${esc(t)}</span><span class="cps">${chips(a)}</span></div>
          <div class="pair"><span class="tag">stored</span><span class="big" lang="${lang}" ${dir(lang)}>${esc(n)}</span><span class="cps">${chips(b)}</span></div>
          <p class="verdict ${t === n ? "" : "good"}">${t === n ? "Already in the one encoding: nothing to change." : `Same look, ${a.length} code points became ${b.length}. A search for one form now finds the other.`}</p>`;
      };
      const apply = (p) => { $("nz-in").value = p.text; $("nz-lang").value = p.lang; show(); };
      onPreset(root, list, apply);
      $("nz-in").addEventListener("input", show);
      $("nz-lang").addEventListener("change", show);
      apply(list[0]);
    },
  },
  {
    id: "fold",
    render(root, { kit, data }) {
      const list = [
        { a: "केन्द्रीय", b: "केंद्रीय", lang: "hi", label: "केन्द्रीय · केंद्रीय", note: "half n or anusvara" },
        { a: "यहाँ", b: "यहां", lang: "hi", label: "यहाँ · यहां", note: "chandrabindu or bindu" },
        { a: "পবিত্ৰ", b: "পৱিত্ৰ", lang: "as", label: "পবিত্ৰ · পৱিত্ৰ", note: "Assamese ব or ৱ" },
        { a: "അദ്ദേഹത്തിന്റെ", b: "അദ്ദേഹത്തിൻറെ", lang: "ml", label: "…ന്റെ · …ൻറെ", note: "two ways to write nta" },
        { a: "ବଡ଼", b: "ବଡ", lang: "or", label: "ବଡ଼ · ବଡ", note: "Odia nukta" },
        { a: "माल", b: "मॉल", lang: "hi", label: "माल · मॉल", note: "kept apart: goods, a mall" },
      ];
      const langs = Object.keys(data.words).filter((l) => LANG_NAMES[l]).sort();
      root.innerHTML = `
        <div class="try">
          <label class="field"><span>One spelling</span><input id="fd-a" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field"><span>Another</span><input id="fd-b" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field narrow"><span>Language</span><select id="fd-lang">${options(langs, "hi")}</select></label>
        </div>
        ${presets(list)}
        <div class="out" id="fd-out" aria-live="polite"></div>`;
      const vocab = new Map();
      const show = () => {
        const lang = $("fd-lang").value, a = $("fd-a").value.trim(), b = $("fd-b").value.trim();
        const fa = kit.fold(kit.normalize(a, lang), lang), fb = kit.fold(kit.normalize(b, lang), lang);
        if (!vocab.has(lang)) vocab.set(lang, vocabulary(data, lang));
        const same = [...vocab.get(lang)].filter(([w]) => kit.fold(w, lang) === fa);
        $("fd-out").innerHTML = `
          <div class="pair"><span class="big" lang="${lang}">${esc(a)}</span><span class="arrow">→</span><span class="big key" lang="${lang}">${esc(fa)}</span></div>
          <div class="pair"><span class="big" lang="${lang}">${esc(b)}</span><span class="arrow">→</span><span class="big key" lang="${lang}">${esc(fb)}</span></div>
          <p class="verdict ${fa === fb ? "good" : ""}">${fa === fb ? "One key: a search for either finds both." : "Two keys: fold keeps these apart."}</p>
          ${same.length ? `<p class="also">Spellings in the ${LANG_NAMES[lang]} releases with the key <span lang="${lang}">${esc(fa)}</span>: ${same.map(([w, n]) => `<span class="word" lang="${lang}">${esc(w)}<small>${n}</small></span>`).join(" ")}</p>` : ""}`;
      };
      const apply = (p) => { $("fd-a").value = p.a; $("fd-b").value = p.b; $("fd-lang").value = p.lang; show(); };
      onPreset(root, list, apply);
      for (const id of ["fd-a", "fd-b"]) $(id).addEventListener("input", debounce(show));
      $("fd-lang").addEventListener("change", show);
      apply(list[0]);
    },
  },
  {
    id: "stem",
    render(root, { kit, data }) {
      const list = [
        { w: "योजनाओं", lang: "hi", note: "Hindi: schemes" },
        { w: "देशाच्या", lang: "mr", note: "Marathi: of the country" },
        { w: "করেছে", lang: "bn", note: "Bengali: has done" },
        { w: "ஆண்டில்", lang: "ta", note: "Tamil: in the year" },
        { w: "செய்தி", lang: "ta", note: "Tamil: news. Too short a stem" },
      ];
      root.innerHTML = `
        <div class="try">
          <label class="field"><span>Word</span><input id="st-in" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field narrow"><span>Language</span><select id="st-lang">${options(kit.STEM_LANGUAGES, "hi")}</select></label>
        </div>
        ${presets(list.map((p) => ({ ...p, label: p.w })))}
        <div class="out" id="st-out" aria-live="polite"></div>`;
      const vocab = new Map();
      const show = () => {
        const lang = $("st-lang").value, w = kit.normalize($("st-in").value.trim(), lang);
        const s = kit.stem(w, lang);
        const inArchive = lang in data.words;
        let also = "";
        if (inArchive && w) {
          if (!vocab.has(lang)) vocab.set(lang, vocabulary(data, lang));
          const forms = [...vocab.get(lang)].filter(([x]) => kit.stem(x, lang) === s).sort((a, b) => b[1] - a[1]);
          also = forms.length
            ? `<p class="also">${forms.length} word form${forms.length > 1 ? "s" : ""} in the ${LANG_NAMES[lang]} releases share this stem (number of documents): ${forms.slice(0, 40).map(([x, n]) => `<span class="word" lang="${lang}" ${dir(lang)}>${esc(x)}<small>${n}</small></span>`).join(" ")}</p>`
            : `<p class="also">No word in the ${LANG_NAMES[lang]} releases has this stem.</p>`;
        } else if (w) also = `<p class="also">The PIB releases have no ${LANG_NAMES[lang]} text; the stem is live, the list of forms is not.</p>`;
        $("st-out").innerHTML = `<div class="pair"><span class="big" lang="${lang}" ${dir(lang)}>${esc(w)}</span><span class="arrow">→</span><span class="big key" lang="${lang}" ${dir(lang)}>${esc(s)}</span></div>${also}`;
      };
      const apply = (p) => { $("st-in").value = p.w; $("st-lang").value = p.lang; show(); };
      onPreset(root, list, apply);
      $("st-in").addEventListener("input", debounce(show));
      $("st-lang").addEventListener("change", show);
      apply(list[0]);
    },
  },
  {
    id: "segment",
    render(root, { kit }) {
      const list = [
        { t: "ಲಕ್ಷ್ಮಿ", note: "Kannada: Lakshmi" },
        { t: "ಕನ್ನಡ", note: "Kannada: Kannada" },
        { t: "ਪ੍ਰੀਤ", note: "Punjabi: Preet" },
        { t: "क्षत्रिय", note: "Hindi: both agree" },
        { t: "ಪ್ರಧಾನಮಂತ್ರಿ ಶ್ರೀ ನರೇಂದ್ರ ಮೋದಿ", note: "Kannada: a title" },
      ];
      root.innerHTML = `
        <div class="try">
          <label class="field"><span>Text</span><input id="sg-in" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field narrow"><span>Cut at <b id="sg-n-v">4</b> units</span><input id="sg-n" type="range" min="1" max="40" value="4"></label>
        </div>
        ${presets(list.map((p) => ({ ...p, label: p.t })))}
        <div class="out" id="sg-out" aria-live="polite"></div>`;
      const intl = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      const show = () => {
        const t = $("sg-in").value, n = +$("sg-n").value;
        $("sg-n").max = Math.max(1, t.length);
        $("sg-n-v").textContent = n;
        const ours = kit.segment(t), theirs = [...intl.segment(t)].map((s) => s.segment);
        const boxes = (gs) => gs.map((g) => `<span class="letter">${esc(g)}</span>`).join("");
        let at = 0, cut = 0;
        for (const g of ours) { if (at + g.length > n) break; at += g.length; cut = at; }
        const sliced = t.slice(0, n);
        const split = n < t.length && !ours.reduce((s, g) => (s.push(s[s.length - 1] + g.length), s), [0]).includes(n);
        $("sg-out").innerHTML = `
          <div class="seg"><span class="tag">.length</span><span class="num">${t.length}</span><span class="note">UTF-16 code units, what <code>slice</code> counts</span></div>
          <div class="seg"><span class="tag">Intl.Segmenter</span><span class="num">${theirs.length}</span><span class="letters">${boxes(theirs)}</span></div>
          <div class="seg"><span class="tag">segment</span><span class="num">${ours.length}</span><span class="letters">${boxes(ours)}</span></div>
          <div class="seg"><span class="tag">slice(0, ${n})</span><span class="cut">${esc(sliced)}${split ? ` <span class="cutmark">✂ split letter</span>` : ""}</span></div>
          <div class="seg"><span class="tag">cut by segment</span><span class="cut">${esc(t.slice(0, cut))}</span></div>`;
      };
      const apply = (p) => { $("sg-in").value = p.t; $("sg-n").value = Math.min(4, p.t.length); show(); };
      onPreset(root, list, apply);
      $("sg-in").addEventListener("input", show);
      $("sg-n").addEventListener("input", show);
      apply(list[0]);
    },
  },
  {
    id: "phonetic",
    render(root, { kit }) {
      const list = [
        { a: "Narendra Modi", b: "நரேந்திர மோடி", note: "Latin and Tamil" },
        { a: "Rajnath Singh", b: "راجناتھ سنگھ", note: "Latin and Urdu" },
        { a: "Singh", b: "सिंह", note: "fixed in 0.8.0" },
        { a: "Singh", b: "Sinha", note: "the cost of that fix" },
        { a: "Imran", b: "عمران", note: "a known miss" },
        { a: "Block 1", b: "Block 2", note: "numbers keep their value" },
      ];
      root.innerHTML = `
        <div class="try">
          <label class="field"><span>A name</span><input id="ph-a" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field"><span>Another</span><input id="ph-b" type="text" spellcheck="false" autocomplete="off"></label>
        </div>
        ${presets(list.map((p) => ({ ...p, label: `${p.a} · ${p.b}` })))}
        <div class="out" id="ph-out" aria-live="polite"></div>`;
      const show = () => {
        const a = $("ph-a").value, b = $("ph-b").value;
        const row = (s) => `<div class="pair"><span class="big">${esc(s)}</span><span class="arrow">→</span><span class="keys">${kit.words(s).map((w) => `<span class="kw"><span>${esc(w)}</span>${kit.keys(w).map((k) => `<code>${esc(k)}</code>`).join(" ")}</span>`).join("")}</span></div>`;
        const m = a.trim() && b.trim() && kit.match(a, b);
        $("ph-out").innerHTML = `${row(a)}${row(b)}<p class="verdict ${m ? "good" : ""}">${m ? "match: every word shares a key." : "No match."}</p>`;
      };
      const apply = (p) => { $("ph-a").value = p.a; $("ph-b").value = p.b; show(); };
      onPreset(root, list, apply);
      for (const id of ["ph-a", "ph-b"]) $(id).addEventListener("input", show);
      apply(list[0]);
    },
  },
  {
    id: "phonetic-search",
    render(root, { kit, data }) {
      const langs = Object.keys(data.words).filter((l) => LANG_NAMES[l] && l !== "kha").sort();
      const list = [
        { q: "murmu", lang: "hi", note: "Hindi" },
        { q: "rajnath", lang: "ur", note: "Urdu" },
        { q: "chandrayaan", lang: "ta", note: "Tamil" },
        { q: "tilak", lang: "bn", note: "Bengali" },
        { q: "singh", lang: "hi", note: "Hindi: संघ ranks above सिंह" },
      ];
      root.innerHTML = `
        <div class="try">
          <label class="field"><span>A name, one word, in Latin letters</span><input id="ps-in" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field narrow"><span>Releases in</span><select id="ps-lang">${options(langs, "hi")}</select></label>
        </div>
        ${presets(list.map((p) => ({ ...p, label: p.q })))}
        <div class="out" id="ps-out" aria-live="polite"></div>`;
      const indexes = new Map();
      const getIndex = (lang) => once(`ps:${lang}`, async () => {
        const vocab = vocabulary(data, lang);
        const words = [...vocab.keys()];
        const s = await kit.phoneticSearch.loadSearch(lang);
        const t0 = performance.now();
        const ix = s.index(words, "text");
        return { ix, words, vocab, ms: Math.round(performance.now() - t0) };
      });
      const T = kit.phoneticSearch.THRESHOLDS;
      const show = async () => {
        const lang = $("ps-lang").value, q = $("ps-in").value.trim();
        if (!q) { $("ps-out").innerHTML = ""; return; }
        $("ps-out").innerHTML = `<p class="also">Indexing the ${LANG_NAMES[lang]} words…</p>`;
        let got;
        try { got = await getIndex(lang); } catch (e) { $("ps-out").innerHTML = `<p class="verdict">The ${LANG_NAMES[lang]} table did not load (${esc(e.message)}).</p>`; return; }
        const { ix, words, vocab, ms } = got;
        const hits = ix.search(q, 50).slice(0, 8);
        const bar = (h) => `<div class="hitrow ${h.score >= T.text_10 ? "strict" : h.score >= T.text_20 ? "loose" : "below"}">
            <span class="word big" lang="${lang}" ${dir(lang)}>${esc(words[h.name])}</span>
            <span class="meter"><span style="width:${h.score}%"></span><i style="left:${T.text_20}%"></i><i style="left:${T.text_10}%"></i></span>
            <span class="num">${h.score}</span><span class="note">${vocab.get(words[h.name])} doc${vocab.get(words[h.name]) > 1 ? "s" : ""}</span></div>`;
        $("ps-out").innerHTML = `
          <p class="also">${fmt(words.length)} ${LANG_NAMES[lang]} word forms indexed in ${ms} ms. Lines on each bar: ${T.text_20} (at most 20% of hits wrong) and ${T.text_10} (at most 10%).</p>
          ${hits.length ? hits.map(bar).join("") : `<p class="verdict">No candidate scored 50 or more.</p>`}`;
      };
      const apply = (p) => { $("ps-in").value = p.q; $("ps-lang").value = p.lang; show(); };
      onPreset(root, list, apply);
      $("ps-in").addEventListener("input", debounce(show, 250));
      $("ps-lang").addEventListener("change", show);
      apply(list[0]);
    },
  },
  {
    id: "romanize",
    render(root, { kit, data }) {
      const langs = kit.romanize.languages("words").concat(kit.romanize.languages("names")).filter((v, i, a) => a.indexOf(v) === i).sort();
      const title = (lang) => data.titles[lang];
      const list = [
        { lang: "hi", mode: "words", text: title("hi"), label: "A Hindi title", note: "words mode" },
        { lang: "ta", mode: "words", text: title("ta"), label: "A Tamil title", note: "words mode" },
        { lang: "kn", mode: "names", text: "ದ್ರೌಪದಿ ಮುರ್ಮು", label: "ದ್ರೌಪದಿ ಮುರ್ಮು", note: "names mode" },
        { lang: "hi", mode: "words", text: "प्राप्\u200Dत विश्\u200Dव", label: "प्राप्\u200Dत विश्\u200Dव", note: "fault: a joiner cuts the word" },
        { lang: "mni", mode: "names", text: "রামেন ওরাম", label: "রামেন ওরাম", note: "fault: Manipuri drops syllables" },
        { lang: "hi", mode: "words", text: "एक देकर", label: "एक देकर", note: "fault: English look-alikes" },
      ];
      root.innerHTML = `
        <div class="try">
          <label class="field"><span>Text in an Indian script</span><input id="rm-in" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field narrow"><span>Language</span><select id="rm-lang">${options(langs, "hi")}</select></label>
          <label class="field narrow"><span>Mode</span><select id="rm-mode"><option value="words">words (text)</option><option value="names">names</option></select></label>
        </div>
        ${presets(list.map((p) => ({ ...p, lang: p.lang })))}
        <div class="out" id="rm-out" aria-live="polite"></div>`;
      const show = async () => {
        const lang = $("rm-lang").value, t = $("rm-in").value;
        let mode = $("rm-mode").value;
        if (!kit.romanize.languages(mode).includes(lang)) mode = mode === "names" ? "words" : "names";
        $("rm-out").innerHTML = `<p class="also">Loading the ${LANG_NAMES[lang]} ${mode} tables…</p>`;
        let r;
        try { r = await loadRomanizer(kit, lang, mode); } catch (e) { $("rm-out").innerHTML = `<p class="verdict">The tables did not load (${esc(e.message)}).</p>`; return; }
        const words = [...new Set(t.match(TOKEN) ?? [])].slice(0, 6);
        $("rm-out").innerHTML = `
          <div class="pair col"><span class="big" lang="${lang}" ${dir(lang)}>${esc(t)}</span><span class="big latin">${esc(r.text(t))}</span></div>
          <p class="also">${mode} mode${mode !== $("rm-mode").value ? ` (${LANG_NAMES[lang]} has no ${$("rm-mode").value} tables)` : ""}. Top four spellings of each word:</p>
          <div class="cands">${words.map((w) => `<div><span class="word" lang="${lang}" ${dir(lang)}>${esc(w)}</span> ${r.word(w, 4).map((x, i) => `<code class="${i ? "" : "first"}">${esc(x)}</code>`).join(" ")}</div>`).join("")}</div>`;
      };
      const apply = (p) => { $("rm-in").value = p.text ?? ""; $("rm-lang").value = p.lang; $("rm-mode").value = p.mode; show(); };
      onPreset(root, list, apply);
      $("rm-in").addEventListener("input", debounce(show, 250));
      for (const id of ["rm-lang", "rm-mode"]) $(id).addEventListener("change", show);
      apply(list[0]);
    },
  },
  {
    id: "deromanize",
    render(root, { kit }) {
      const langs = kit.deromanize.languages("words").concat(kit.deromanize.languages("names")).filter((v, i, a) => a.indexOf(v) === i).sort();
      const list = [
        { t: "sarkar ki yojanaon", lang: "hi", mode: "words", note: "Hindi" },
        { t: "amar sonar bangla", lang: "bn", mode: "words", note: "Bengali" },
        { t: "vanakkam", lang: "ta", mode: "words", note: "Tamil" },
        { t: "chandrayaan", lang: "te", mode: "words", note: "Telugu" },
        { t: "murmu", lang: "ml", mode: "names", note: "fault: names mode cuts it" },
        { t: "chandrayaan", lang: "ur", mode: "names", note: "fault: Urdu names mode" },
      ];
      root.innerHTML = `
        <div class="try">
          <label class="field"><span>Latin typing</span><input id="dr-in" type="text" spellcheck="false" autocomplete="off"></label>
          <label class="field narrow"><span>Language</span><select id="dr-lang">${options(langs, "hi")}</select></label>
          <label class="field narrow"><span>Mode</span><select id="dr-mode"><option value="words">words (text)</option><option value="names">names</option></select></label>
        </div>
        ${presets(list.map((p) => ({ ...p, label: p.t, lang: undefined })))}
        <div class="out" id="dr-out" aria-live="polite"></div>`;
      const show = async () => {
        const lang = $("dr-lang").value, t = $("dr-in").value;
        let mode = $("dr-mode").value;
        if (!kit.deromanize.languages(mode).includes(lang)) mode = mode === "names" ? "words" : "names";
        $("dr-out").innerHTML = `<p class="also">Loading the ${LANG_NAMES[lang]} ${mode} tables and word list…</p>`;
        let d;
        try { d = await loadDeromanizer(kit, lang, mode); } catch (e) { $("dr-out").innerHTML = `<p class="verdict">The tables did not load (${esc(e.message)}).</p>`; return; }
        const out = d.text(t);
        const words = [...new Set(t.match(/[A-Za-z]+/g) ?? [])].slice(0, 6);
        $("dr-out").innerHTML = `
          <div class="pair col"><span class="big latin">${esc(t)}</span><span class="big" lang="${lang}" ${dir(lang)}>${esc(out)}</span></div>
          <p class="also">${mode} mode${mode !== $("dr-mode").value ? ` (${LANG_NAMES[lang]} has no ${$("dr-mode").value} tables)` : ""}. Top four spellings of each word:</p>
          <div class="cands">${words.map((w) => `<div><span class="word">${esc(w)}</span> ${d.word(w, 4).map((x, i) => `<code lang="${lang}" class="${i ? "" : "first"}">${esc(x)}</code>`).join(" ")}</div>`).join("")}</div>`;
      };
      const apply = (p) => { $("dr-in").value = p.t; $("dr-lang").value = p.lang; $("dr-mode").value = p.mode; show(); };
      onPreset(root, list, apply);
      $("dr-in").addEventListener("input", debounce(show, 250));
      for (const id of ["dr-lang", "dr-mode"]) $(id).addEventListener("change", show);
      apply(list[0]);
    },
  },
];

// The tabs and panes are in the page's HTML (their text is there, for readers
// without JavaScript and for search engines); this adds each pane's live demo,
// built the first time its tab opens.
export function initBench(ctx) {
  const tabs = $("bench-tabs");
  const done = new Set();
  const select = (id, focus) => {
    for (const p of PANELS) {
      const on = p.id === id;
      $(`tab-${p.id}`).setAttribute("aria-selected", String(on));
      $(`tab-${p.id}`).tabIndex = on ? 0 : -1;
      $(`pane-${p.id}`).hidden = !on;
    }
    if (!done.has(id)) { done.add(id); PANELS.find((p) => p.id === id).render($(`body-${id}`), ctx); }
    if (focus) $(`tab-${id}`).focus();
  };
  tabs.addEventListener("click", (e) => { const b = e.target.closest("[role=tab]"); if (b) select(b.id.slice(4)); });
  tabs.addEventListener("keydown", (e) => {
    const i = PANELS.findIndex((p) => $(`tab-${p.id}`).getAttribute("aria-selected") === "true");
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step) { e.preventDefault(); select(PANELS[(i + step + PANELS.length) % PANELS.length].id, true); }
  });
  const start = PANELS.find((p) => p.id === location.hash.slice(1))?.id ?? PANELS[0].id;
  select(start);
  return { select };
}
