// phonetic/rules.json
var rules_default = {
  version: "2026-10-06",
  folds: [
    "bn-case",
    "drop-vowels",
    "drop-y",
    "gu-case",
    "latin-w-u",
    "ml-case",
    "nasal-all",
    "ng-k",
    "or-case",
    "retroflex",
    "s-c",
    "ta-case",
    "ta-k-h",
    "te-case",
    "ur-w-u",
    "v-b"
  ],
  brahmic: {
    from: 2304,
    to: 3455,
    class_by_offset: {
      "2": "ṁ",
      "5": "a",
      "6": "a",
      "7": "i",
      "8": "i",
      "9": "u",
      "10": "u",
      "11": "r",
      "12": "l",
      "13": "e",
      "14": "e",
      "15": "e",
      "16": "e",
      "17": "o",
      "18": "o",
      "19": "o",
      "20": "o",
      "21": "k",
      "22": "k",
      "23": "k",
      "24": "k",
      "25": "ṅ",
      "26": "c",
      "27": "c",
      "28": "c",
      "29": "c",
      "30": "ñ",
      "31": "ṭ",
      "32": "ṭ",
      "33": "ṭ",
      "34": "ṭ",
      "35": "ṇ",
      "36": "t",
      "37": "t",
      "38": "t",
      "39": "t",
      "40": "n",
      "41": "n",
      "42": "p",
      "43": "p",
      "44": "p",
      "45": "p",
      "46": "m",
      "47": "y",
      "48": "r",
      "49": "r",
      "50": "l",
      "51": "l",
      "52": "l",
      "53": "v",
      "54": "s",
      "55": "s",
      "56": "s",
      "57": "h",
      "62": "a",
      "63": "i",
      "64": "i",
      "65": "u",
      "66": "u",
      "67": "r",
      "68": "r",
      "69": "e",
      "70": "e",
      "71": "e",
      "72": "e",
      "73": "o",
      "74": "o",
      "75": "o",
      "76": "o",
      "87": "o",
      "96": "r",
      "97": "l",
      "98": "l",
      "99": "l"
    },
    virama_offset: 77,
    candrabindu_offset: 1,
    candrabindu_class: "ṁ"
  },
  extra: {
    ৎ: "t",
    ৰ: "r",
    ৱ: "v",
    ୱ: "v",
    "ੰ": "ṁ",
    "ਂ": "ṁ",
    ൺ: "ṇ",
    ൻ: "n",
    ർ: "r",
    ൽ: "l",
    ൾ: "l",
    ൿ: "k",
    ൔ: "m",
    ൕ: "y",
    ൖ: "l"
  },
  urdu: {
    from: 1536,
    to: 1791,
    letters: {
      ا: "a",
      آ: "a",
      أ: "a",
      ب: "p",
      پ: "p",
      ت: "t",
      ٹ: "ṭ",
      ث: "s",
      ج: "c",
      چ: "c",
      ح: "h",
      خ: "k",
      د: "t",
      ڈ: "ṭ",
      ذ: "c",
      ر: "r",
      ڑ: "ṭ",
      ز: "c",
      ژ: "c",
      س: "s",
      ش: "s",
      ص: "s",
      ض: "c",
      ط: "t",
      ظ: "c",
      غ: "k",
      ف: "p",
      ق: "k",
      ک: "k",
      ك: "k",
      گ: "k",
      ل: "l",
      م: "m",
      ن: "n",
      ں: "ṁ",
      و: "v",
      ؤ: "u",
      ہ: "h",
      ه: "h",
      ۃ: "a",
      ی: "y",
      ي: "y",
      ى: "y",
      ئ: "y",
      ے: "e",
      ۓ: "e",
      ٻ: "p",
      ڀ: "p",
      ٺ: "ṭ",
      ٽ: "ṭ",
      ٿ: "t",
      ڄ: "c",
      ڃ: "ñ",
      ڇ: "c",
      ڊ: "ṭ",
      ڌ: "t",
      ڍ: "ṭ",
      ڏ: "t",
      ڙ: "ṭ",
      ڦ: "p",
      ڪ: "k",
      ڱ: "ṅ",
      ڳ: "k",
      ڻ: "ṇ",
      ٲ: "a",
      ٳ: "a",
      ۆ: "o",
      ۄ: "o",
      ێ: "e",
      ؠ: "y"
    },
    ain: "ع",
    waw: "و",
    waw_v_before: "اآ",
    final_he: "ہه",
    final_he_h_after: "اآو"
  },
  meetei: {
    ranges: [
      [
        43744,
        43775
      ],
      [
        43968,
        44031
      ]
    ],
    letters: {
      ꯀ: "k",
      ꯁ: "s",
      ꯂ: "l",
      ꯃ: "m",
      ꯄ: "p",
      ꯅ: "n",
      ꯆ: "c",
      ꯇ: "t",
      ꯈ: "k",
      ꯉ: "ṅ",
      ꯊ: "t",
      ꯋ: "v",
      ꯌ: "y",
      ꯍ: "h",
      ꯎ: "u",
      ꯏ: "i",
      ꯐ: "p",
      ꯑ: "a",
      ꯒ: "k",
      ꯓ: "c",
      ꯔ: "r",
      ꯕ: "p",
      ꯖ: "c",
      ꯗ: "t",
      ꯘ: "k",
      ꯙ: "t",
      ꯚ: "p",
      ꯛ: "k",
      ꯜ: "l",
      ꯝ: "m",
      ꯞ: "p",
      ꯟ: "n",
      ꯠ: "t",
      ꯡ: "ṅ",
      ꯢ: "i",
      "ꯣ": "o",
      "ꯤ": "i",
      "ꯥ": "a",
      "ꯦ": "e",
      "ꯧ": "o",
      "ꯨ": "u",
      "ꯩ": "e",
      "ꯪ": "ṁ",
      ꫠ: "e",
      ꫡ: "o",
      ꫢ: "c",
      ꫣ: "ñ",
      ꫤ: "ṭ",
      ꫥ: "ṭ",
      ꫦ: "ṭ",
      ꫧ: "ṭ",
      ꫨ: "ṇ",
      ꫩ: "s",
      ꫪ: "s",
      "ꫫ": "i",
      "ꫬ": "u",
      "ꫭ": "e",
      "ꫮ": "o",
      "ꫯ": "o"
    }
  },
  ol_chiki: {
    from: 7248,
    to: 7295,
    letters: {
      ᱚ: "o",
      ᱛ: "t",
      ᱜ: "k",
      ᱝ: "ṅ",
      ᱞ: "l",
      ᱟ: "a",
      ᱠ: "k",
      ᱡ: "c",
      ᱢ: "m",
      ᱣ: "v",
      ᱤ: "i",
      ᱥ: "s",
      ᱦ: "h",
      ᱧ: "ñ",
      ᱨ: "r",
      ᱩ: "u",
      ᱪ: "c",
      ᱫ: "t",
      ᱬ: "ṇ",
      ᱭ: "y",
      ᱮ: "e",
      ᱯ: "p",
      ᱰ: "ṭ",
      ᱱ: "n",
      ᱲ: "ṭ",
      ᱳ: "o",
      ᱴ: "ṭ",
      ᱵ: "p",
      ᱶ: "v",
      ᱷ: "h",
      ᱸ: "ṁ"
    },
    aspiration: "ᱷ"
  },
  latin: {
    groups: [
      [
        "chh",
        "c"
      ],
      [
        "ch",
        "c"
      ],
      [
        "jh",
        "c"
      ],
      [
        "kh",
        "k"
      ],
      [
        "gh",
        "k"
      ],
      [
        "th",
        "t"
      ],
      [
        "dh",
        "t"
      ],
      [
        "ph",
        "p"
      ],
      [
        "bh",
        "p"
      ],
      [
        "sh",
        "s"
      ],
      [
        "ck",
        "k"
      ],
      [
        "aa",
        "a"
      ],
      [
        "ai",
        "e"
      ],
      [
        "ei",
        "e"
      ],
      [
        "au",
        "o"
      ],
      [
        "ee",
        "i"
      ],
      [
        "oo",
        "u"
      ],
      [
        "x",
        "ks"
      ]
    ],
    letters: {
      a: "a",
      e: "e",
      i: "i",
      o: "o",
      u: "u",
      k: "k",
      g: "k",
      q: "k",
      j: "c",
      z: "c",
      t: "t",
      d: "t",
      n: "n",
      m: "m",
      p: "p",
      b: "p",
      f: "p",
      v: "v",
      w: "v",
      y: "y",
      r: "r",
      l: "l",
      s: "s",
      h: "h"
    },
    w_ambiguous_unless_before: "aeiou"
  },
  class_map: {
    m: "n",
    s: "c",
    v: "p",
    w: "p",
    ñ: "n",
    ṁ: "n",
    ṅ: "n",
    ṇ: "n",
    ṭ: "t"
  },
  vowels: "aeiou",
  steps: {
    "ng-k": true,
    "initial-vowels-alike": false,
    "drop-h": false,
    "drop-y": true,
    "drop-y-after-i": false,
    "drop-vowels": true,
    "drop-final-vowel": false
  },
  branches: [
    {
      from: 0,
      to: 127,
      class: "w",
      also: "u"
    },
    {
      from: 2944,
      to: 3071,
      class: "k",
      also: "h"
    },
    {
      from: 1536,
      to: 1791,
      class: "w",
      also: "u"
    }
  ],
  max_keys: 16,
  suffixes: [
    {
      from: 2432,
      to: 2559,
      endings: [
        "য়ের",
        "দের",
        "এর",
        "ের",
        "কে",
        "তে"
      ]
    },
    {
      from: 2688,
      to: 2815,
      endings: [
        "માં",
        "નું",
        "થી",
        "ના",
        "ની",
        "ને"
      ]
    },
    {
      from: 3328,
      to: 3455,
      endings: [
        "യ്ക്ക്",
        "ന്റെ",
        "യുടെ",
        "യിലെ",
        "ക്ക്",
        "ുടെ",
        "യിൽ",
        "ിലെ",
        "ോട്",
        "ിന്",
        "ിൽ",
        "നെ",
        "യെ",
        "ും"
      ]
    },
    {
      from: 2816,
      to: 2943,
      endings: [
        "ଙ୍କର",
        "ଙ୍କୁ",
        "ଙ୍କ",
        "ରେ",
        "ରୁ",
        "କୁ"
      ]
    },
    {
      from: 2944,
      to: 3071,
      endings: [
        "ுக்கு",
        "யின்",
        "வின்",
        "க்கு",
        "யில்",
        "ிடம்",
        "ுடன்",
        "ின்",
        "ில்",
        "ால்",
        "ும்"
      ]
    },
    {
      from: 3072,
      to: 3199,
      endings: [
        "యొక్క",
        "లోని",
        "గారు",
        "లో",
        "కు",
        "కి",
        "ని",
        "తో",
        "ను"
      ]
    }
  ]
};

// js/phonetic.ts
function compile(rules) {
  const b = rules.brahmic;
  const byOffset = new Array(128);
  for (const [o, c] of Object.entries(b.class_by_offset))
    byOffset[Number(o)] = c;
  const extra = new Map(Object.entries(rules.extra));
  const urdu = new Map(Object.entries(rules.urdu.letters));
  const meetei = new Map(Object.entries(rules.meetei.letters));
  const olChiki = new Map(Object.entries(rules.ol_chiki.letters));
  const latin = new Array(128);
  for (const [l, c] of Object.entries(rules.latin.letters))
    latin[l.charCodeAt(0)] = c;
  const groups = rules.latin.groups;
  const wUnlessNext = rules.latin.w_ambiguous_unless_before;
  const classMap = new Map(Object.entries(rules.class_map));
  const vowels = new Set(rules.vowels);
  const steps = rules.steps;
  const u = rules.urdu;
  function inMeetei(o) {
    return rules.meetei.ranges.some(([lo, hi]) => o >= lo && o <= hi);
  }
  function readBrahmic(word) {
    let out = "";
    for (let i = 0;i < word.length; i++) {
      const ch = word[i];
      const x = extra.get(ch);
      if (x !== undefined) {
        out += x;
        continue;
      }
      const o = word.charCodeAt(i);
      if (o < b.from || o > b.to)
        continue;
      const off = o & 127;
      if (off === b.virama_offset)
        continue;
      if (off === b.candrabindu_offset) {
        out += b.candrabindu_class;
        continue;
      }
      const c = byOffset[off];
      if (c !== undefined)
        out += c;
    }
    return out;
  }
  function readLatin(word) {
    let out = "";
    let i = 0;
    outer:
      while (i < word.length) {
        for (const [g, cls] of groups) {
          if (word.startsWith(g, i)) {
            out += cls;
            i += g.length;
            continue outer;
          }
        }
        const ch = word.charCodeAt(i);
        if (ch === 99) {
          const next = word[i + 1];
          out += next === "e" || next === "i" || next === "y" ? "s" : "k";
        } else if (ch === 119 && i > 0 && !wUnlessNext.includes(word[i + 1] ?? " ")) {
          out += "w";
        } else {
          out += latin[ch] ?? "";
        }
        i++;
      }
    return out;
  }
  function readUrdu(word) {
    let out = word[0] === u.ain ? "a" : "";
    for (let i = 0;i < word.length; i++) {
      const ch = word[i];
      if (ch === u.waw && i > 0 && !(i + 1 < word.length && u.waw_v_before.includes(word[i + 1])))
        out += "w";
      else
        out += urdu.get(ch) ?? "";
    }
    const n = word.length;
    if (n > 1 && u.final_he.includes(word[n - 1]) && !u.final_he_h_after.includes(word[n - 2])) {
      out = out.slice(0, -1) + "a";
    }
    return out;
  }
  function readOlChiki(word) {
    let out = "";
    for (const ch of word) {
      if (ch === rules.ol_chiki.aspiration && out && !vowels.has(out[out.length - 1]))
        continue;
      out += olChiki.get(ch) ?? "";
    }
    return out;
  }
  function readMeetei(word) {
    let out = "";
    for (const ch of word)
      out += meetei.get(ch) ?? "";
    return out;
  }
  function read(word) {
    let ascii = true;
    for (let i = 0;i < word.length; i++)
      if (word.charCodeAt(i) > 127) {
        ascii = false;
        break;
      }
    if (ascii)
      return readLatin(word);
    let ol = false, me = false;
    for (let i = 0;i < word.length; i++) {
      const o = word.charCodeAt(i);
      if (o >= u.from && o <= u.to)
        return readUrdu(word);
      if (o >= rules.ol_chiki.from && o <= rules.ol_chiki.to)
        ol = true;
      else if (inMeetei(o))
        me = true;
    }
    if (ol)
      return readOlChiki(word);
    if (me)
      return readMeetei(word);
    return readBrahmic(word);
  }
  function fold(codes) {
    if (steps["ng-k"]) {
      let s = "";
      for (let i = 0;i < codes.length; i++) {
        s += codes[i];
        if (codes[i] === "ṅ" && codes[i + 1] !== "k")
          s += "k";
      }
      codes = s;
    }
    let mapped = "";
    for (let i = 0;i < codes.length; i++)
      mapped += classMap.get(codes[i]) ?? codes[i];
    if (!mapped)
      return mapped;
    let head = mapped[0];
    if (steps["initial-vowels-alike"] && vowels.has(head))
      head = "a";
    let out = head;
    for (let i = 1;i < mapped.length; i++) {
      const c = mapped[i];
      if (steps["drop-h"] && c === "h")
        continue;
      if (steps["drop-y"] && c === "y")
        continue;
      if (steps["drop-vowels"] && vowels.has(c))
        continue;
      out += c;
    }
    if (steps["drop-final-vowel"] && out.length > 1 && vowels.has(out[out.length - 1]))
      out = out.slice(0, -1);
    let runs = out[0];
    for (let i = 1;i < out.length; i++)
      if (out[i] !== out[i - 1])
        runs += out[i];
    return runs;
  }
  function variants(word) {
    const classes = read(word);
    let vs = [classes];
    for (const br of rules.branches) {
      if (!classes.includes(br.class))
        continue;
      let inScript = false;
      for (let i = 0;i < word.length; i++) {
        const o = word.charCodeAt(i);
        if (o >= br.from && o <= br.to) {
          inScript = true;
          break;
        }
      }
      if (!inScript)
        continue;
      for (let i = 0;i < classes.length; i++) {
        if (classes[i] === br.class && vs.length * 2 <= rules.max_keys) {
          vs = vs.concat(vs.map((v) => v.slice(0, i) + br.also + v.slice(i + 1)));
        }
      }
    }
    return vs;
  }
  return function keys(word) {
    const bases = [word];
    const first = word.charCodeAt(0);
    for (const sf of rules.suffixes) {
      if (first < sf.from || first > sf.to)
        continue;
      for (const e of sf.endings) {
        if (word.endsWith(e) && word.length - e.length >= 2) {
          bases.push(word.slice(0, -e.length));
          break;
        }
      }
    }
    const out = new Set;
    for (const base of bases)
      for (const v of variants(base))
        out.add(fold(v));
    return [...out].sort();
  };
}
var engine = compile(rules_default);
var RULES_VERSION = rules_default.version;
var MAX_NAME_KEYS = 256;
function normalize(word) {
  const plain = word.normalize("NFD").replace(/\p{Mn}/gu, "");
  return /^[\x00-\x7f]*$/.test(plain) ? plain.toLowerCase() : word.normalize("NFC");
}
function keys(word) {
  const w = normalize(word);
  return w ? engine(w) : [];
}
function words(name) {
  return name.replace(/\([^)]*\)/g, " ").split(/[\s.\-,'’]+/u).filter(Boolean);
}
function nameKeys(name) {
  let out = [""];
  for (const w of words(name)) {
    const ks = keys(w);
    if (!ks.length)
      continue;
    const next = [];
    for (const p of out)
      for (const k of ks) {
        if (next.length < MAX_NAME_KEYS)
          next.push(p ? p + " " + k : k);
      }
    out = next;
  }
  return out[0] === "" ? [] : out;
}
function match(a, b) {
  const wa = words(a), wb = words(b);
  if (!wa.length || wa.length !== wb.length)
    return false;
  return wa.every((w, i) => {
    const kb = new Set(keys(wb[i]));
    return keys(w).some((k) => kb.has(k));
  });
}
export {
  words,
  nameKeys,
  match,
  keys,
  RULES_VERSION,
  MAX_NAME_KEYS
};
