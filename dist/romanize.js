// romanize/rules.json
var rules_default = {
  beam: {
    names: 12,
    words: 8
  },
  bos: "<s>",
  eos: "</s>",
  families: {
    names: {
      as: {
        file: "as.names.bin",
        group: "brahmic",
        lookup: 669,
        pooled: "names-brahmic.bin",
        tag: "as"
      },
      bn: {
        file: "bn.names.bin",
        group: "brahmic",
        lookup: 1785,
        pooled: "names-brahmic.bin",
        tag: "bn"
      },
      gom: {
        file: "gom.names.bin",
        group: "brahmic",
        lookup: 17,
        pooled: "names-brahmic.bin",
        tag: "gom"
      },
      gu: {
        file: "gu.names.bin",
        group: "brahmic",
        lookup: 131,
        pooled: "names-brahmic.bin",
        tag: "gu"
      },
      hi: {
        file: "hi.names.bin",
        group: "brahmic",
        lookup: 1152,
        pooled: "names-brahmic.bin",
        tag: "hi"
      },
      kn: {
        file: "kn.names.bin",
        group: "brahmic",
        lookup: 448,
        pooled: "names-brahmic.bin",
        tag: "kn"
      },
      ks: {
        file: "ks.names.bin",
        group: "arabic",
        lookup: 130,
        pooled: "names-arabic.bin",
        tag: "ks"
      },
      mai: {
        file: "mai.names.bin",
        group: "brahmic",
        lookup: 150,
        pooled: "names-brahmic.bin",
        tag: "mai"
      },
      ml: {
        file: "ml.names.bin",
        group: "brahmic",
        lookup: 908,
        pooled: "names-brahmic.bin",
        tag: "ml"
      },
      mni: {
        file: "mni.names.bin",
        group: "brahmic",
        lookup: 253,
        pooled: "names-brahmic.bin",
        tag: "mni"
      },
      mr: {
        file: "mr.names.bin",
        group: "brahmic",
        lookup: 716,
        pooled: "names-brahmic.bin",
        tag: "mr"
      },
      ne: {
        file: "ne.names.bin",
        group: "brahmic",
        lookup: 146,
        pooled: "names-brahmic.bin",
        tag: "ne"
      },
      or: {
        file: "or.names.bin",
        group: "brahmic",
        lookup: 610,
        pooled: "names-brahmic.bin",
        tag: "or"
      },
      pa: {
        file: "pa.names.bin",
        group: "brahmic",
        lookup: 996,
        pooled: "names-brahmic.bin",
        tag: "pa"
      },
      sa: {
        file: "sa.names.bin",
        group: "brahmic",
        lookup: 66,
        pooled: "names-brahmic.bin",
        tag: "sa"
      },
      sat: {
        file: "sat.names.bin",
        group: "olchiki",
        lookup: 407,
        pooled: "names-olchiki.bin",
        tag: "sat"
      },
      sd: {
        file: "sd.names.bin",
        group: "arabic",
        lookup: 72,
        pooled: "names-arabic.bin",
        tag: "sd"
      },
      ta: {
        file: "ta.names.bin",
        group: "brahmic",
        lookup: 3961,
        pooled: "names-brahmic.bin",
        tag: "ta"
      },
      te: {
        file: "te.names.bin",
        group: "brahmic",
        lookup: 2126,
        pooled: "names-brahmic.bin",
        tag: "te"
      },
      ur: {
        file: "ur.names.bin",
        group: "arabic",
        lookup: 1961,
        pooled: "names-arabic.bin",
        tag: "ur"
      }
    },
    words: {
      as: {
        file: "as.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "as:w"
      },
      bn: {
        file: "bn.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "bn:w"
      },
      brx: {
        file: "brx.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "brx:w"
      },
      doi: {
        file: "doi.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "doi:w"
      },
      gom: {
        file: "gom.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "gom:w"
      },
      gu: {
        file: "gu.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "gu:w"
      },
      hi: {
        file: "hi.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "hi:w"
      },
      kn: {
        file: "kn.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "kn:w"
      },
      ks: {
        file: "ks.words.bin",
        group: "arabic",
        lookup: 0,
        pooled: "words-arabic.bin",
        tag: "ks:w"
      },
      mai: {
        file: "mai.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "mai:w"
      },
      ml: {
        file: "ml.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "ml:w"
      },
      mni: {
        file: "mni.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "mni:w"
      },
      mr: {
        file: "mr.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "mr:w"
      },
      ne: {
        file: "ne.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "ne:w"
      },
      or: {
        file: "or.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "or:w"
      },
      pa: {
        file: "pa.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "pa:w"
      },
      sa: {
        file: "sa.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "sa:w"
      },
      sd: {
        file: "sd.words.bin",
        group: "arabic",
        lookup: 0,
        pooled: "words-arabic.bin",
        tag: "sd:w"
      },
      ta: {
        file: "ta.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "ta:w"
      },
      te: {
        file: "te.words.bin",
        group: "brahmic",
        lookup: 0,
        pooled: "words-brahmic.bin",
        tag: "te:w"
      },
      ur: {
        file: "ur.words.bin",
        group: "arabic",
        lookup: 0,
        pooled: "words-arabic.bin",
        tag: "ur:w"
      }
    }
  },
  files: {
    "as.names.bin": 89974,
    "as.words.bin": 235757,
    "bn.names.bin": 182011,
    "bn.words.bin": 377491,
    "brx.words.bin": 208654,
    "doi.words.bin": 48681,
    "gom.names.bin": 9361,
    "gom.words.bin": 324293,
    "gu.names.bin": 38634,
    "gu.words.bin": 370117,
    "hi.names.bin": 162471,
    "hi.words.bin": 468425,
    "kn.names.bin": 73095,
    "kn.words.bin": 273776,
    "ks.names.bin": 36223,
    "ks.words.bin": 445883,
    "mai.names.bin": 40421,
    "mai.words.bin": 381362,
    "ml.names.bin": 133130,
    "ml.words.bin": 342656,
    "mni.names.bin": 12382,
    "mni.words.bin": 133350,
    "mr.names.bin": 119082,
    "mr.words.bin": 327753,
    "names-arabic.bin": 188775,
    "names-brahmic.bin": 600155,
    "names-olchiki.bin": 97591,
    "ne.names.bin": 37468,
    "ne.words.bin": 297072,
    "or.names.bin": 83867,
    "or.words.bin": 285972,
    "pa.names.bin": 140045,
    "pa.words.bin": 419426,
    "sa.names.bin": 24600,
    "sa.words.bin": 243993,
    "sat.names.bin": 73397,
    "sd.names.bin": 11896,
    "sd.words.bin": 463475,
    "ta.names.bin": 295030,
    "ta.words.bin": 244532,
    "te.names.bin": 229077,
    "te.words.bin": 295013,
    "ur.names.bin": 192400,
    "ur.words.bin": 540255,
    "words-arabic.bin": 1182486,
    "words-brahmic.bin": 2679161,
    "words-olchiki.bin": 61705
  },
  groups: {
    arabic: [
      [
        1536,
        1791
      ]
    ],
    brahmic: [
      [
        2304,
        3455
      ],
      [
        43744,
        44031
      ]
    ],
    olchiki: [
      [
        7248,
        7295
      ]
    ]
  },
  max_n: 3,
  order: 3,
  rules_version: "2026-10-08",
  unify: {
    from: [
      2432,
      3455
    ],
    mask: 127,
    to_block: 2304
  },
  unknown_penalty: 20,
  version: 1
};
// package.json
var version = "0.8.0";

// js/lang.ts
var ISO_639_2 = "asm as ben bn guj gu hin hi kan kn kas ks mal ml mar mr nep ne ori or pan pa san sa snd sd tam ta tel te urd ur ";
function langCode(tag) {
  const t = (tag ?? "").toLowerCase().split(/[-_]/)[0];
  const i = t.length === 3 ? ISO_639_2.indexOf(t + " ") : -1;
  return i >= 0 && i % 7 === 0 ? ISO_639_2.slice(i + 4, i + 6) : t;
}
// internal/unidata/unicode15.json
var unicode15_default = {
  unicode: "15.0.0",
  python: "3.12.13",
  ranges: [1536, 1791, 1872, 1919, 2304, 3455, 7248, 7295, 7376, 7423, 43232, 43263, 43744, 44031, 64336, 65023, 65136, 65279, 72448, 72543],
  mn: [1552, 1562, 1611, 1631, 1648, 1648, 1750, 1756, 1759, 1764, 1767, 1768, 1770, 1773, 2304, 2306, 2362, 2362, 2364, 2364, 2369, 2376, 2381, 2381, 2385, 2391, 2402, 2403, 2433, 2433, 2492, 2492, 2497, 2500, 2509, 2509, 2530, 2531, 2558, 2558, 2561, 2562, 2620, 2620, 2625, 2626, 2631, 2632, 2635, 2637, 2641, 2641, 2672, 2673, 2677, 2677, 2689, 2690, 2748, 2748, 2753, 2757, 2759, 2760, 2765, 2765, 2786, 2787, 2810, 2815, 2817, 2817, 2876, 2876, 2879, 2879, 2881, 2884, 2893, 2893, 2901, 2902, 2914, 2915, 2946, 2946, 3008, 3008, 3021, 3021, 3072, 3072, 3076, 3076, 3132, 3132, 3134, 3136, 3142, 3144, 3146, 3149, 3157, 3158, 3170, 3171, 3201, 3201, 3260, 3260, 3263, 3263, 3270, 3270, 3276, 3277, 3298, 3299, 3328, 3329, 3387, 3388, 3393, 3396, 3405, 3405, 3426, 3427, 7376, 7378, 7380, 7392, 7394, 7400, 7405, 7405, 7412, 7412, 7416, 7417, 43232, 43249, 43263, 43263, 43756, 43757, 43766, 43766, 44005, 44005, 44008, 44008, 44013, 44013],
  m: [1552, 1562, 1611, 1631, 1648, 1648, 1750, 1756, 1759, 1764, 1767, 1768, 1770, 1773, 2304, 2307, 2362, 2364, 2366, 2383, 2385, 2391, 2402, 2403, 2433, 2435, 2492, 2492, 2494, 2500, 2503, 2504, 2507, 2509, 2519, 2519, 2530, 2531, 2558, 2558, 2561, 2563, 2620, 2620, 2622, 2626, 2631, 2632, 2635, 2637, 2641, 2641, 2672, 2673, 2677, 2677, 2689, 2691, 2748, 2748, 2750, 2757, 2759, 2761, 2763, 2765, 2786, 2787, 2810, 2815, 2817, 2819, 2876, 2876, 2878, 2884, 2887, 2888, 2891, 2893, 2901, 2903, 2914, 2915, 2946, 2946, 3006, 3010, 3014, 3016, 3018, 3021, 3031, 3031, 3072, 3076, 3132, 3132, 3134, 3140, 3142, 3144, 3146, 3149, 3157, 3158, 3170, 3171, 3201, 3203, 3260, 3260, 3262, 3268, 3270, 3272, 3274, 3277, 3285, 3286, 3298, 3299, 3315, 3315, 3328, 3331, 3387, 3388, 3390, 3396, 3398, 3400, 3402, 3405, 3415, 3415, 3426, 3427, 7376, 7378, 7380, 7400, 7405, 7405, 7412, 7412, 7415, 7417, 43232, 43249, 43263, 43263, 43755, 43759, 43765, 43766, 44003, 44010, 44012, 44013],
  l: [1568, 1610, 1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775, 1786, 1788, 1791, 1791, 1872, 1919, 2308, 2361, 2365, 2365, 2384, 2384, 2392, 2401, 2417, 2432, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529, 2544, 2545, 2556, 2556, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654, 2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785, 2809, 2809, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929, 2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3129, 3133, 3133, 3160, 3162, 3165, 3165, 3168, 3169, 3200, 3200, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261, 3293, 3294, 3296, 3297, 3313, 3314, 3332, 3340, 3342, 3344, 3346, 3386, 3389, 3389, 3406, 3406, 3412, 3414, 3423, 3425, 3450, 3455, 7258, 7293, 7401, 7404, 7406, 7411, 7413, 7414, 7418, 7418, 43250, 43255, 43259, 43259, 43261, 43262, 43744, 43754, 43762, 43764, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43824, 43866, 43868, 43881, 43888, 44002, 64336, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65140, 65142, 65276],
  ccc: [1552, 1559, 230, 1560, 1560, 30, 1561, 1561, 31, 1562, 1562, 32, 1611, 1611, 27, 1612, 1612, 28, 1613, 1613, 29, 1614, 1614, 30, 1615, 1615, 31, 1616, 1616, 32, 1617, 1617, 33, 1618, 1618, 34, 1619, 1620, 230, 1621, 1622, 220, 1623, 1627, 230, 1628, 1628, 220, 1629, 1630, 230, 1631, 1631, 220, 1648, 1648, 35, 1750, 1756, 230, 1759, 1762, 230, 1763, 1763, 220, 1764, 1764, 230, 1767, 1768, 230, 1770, 1770, 220, 1771, 1772, 230, 1773, 1773, 220, 2364, 2364, 7, 2381, 2381, 9, 2385, 2385, 230, 2386, 2386, 220, 2387, 2388, 230, 2492, 2492, 7, 2509, 2509, 9, 2558, 2558, 230, 2620, 2620, 7, 2637, 2637, 9, 2748, 2748, 7, 2765, 2765, 9, 2876, 2876, 7, 2893, 2893, 9, 3021, 3021, 9, 3132, 3132, 7, 3149, 3149, 9, 3157, 3157, 84, 3158, 3158, 91, 3260, 3260, 7, 3277, 3277, 9, 3387, 3388, 9, 3405, 3405, 9, 7376, 7378, 230, 7380, 7380, 1, 7381, 7385, 220, 7386, 7387, 230, 7388, 7391, 220, 7392, 7392, 230, 7394, 7400, 1, 7405, 7405, 220, 7412, 7412, 230, 7416, 7417, 230, 43232, 43249, 230, 43766, 43766, 9, 44013, 44013, 9],
  decomp: { "1570": [1575, 1619], "1571": [1575, 1620], "1572": [1608, 1620], "1573": [1575, 1621], "1574": [1610, 1620], "1728": [1749, 1620], "1730": [1729, 1620], "1747": [1746, 1620], "2345": [2344, 2364], "2353": [2352, 2364], "2356": [2355, 2364], "2392": [2325, 2364], "2393": [2326, 2364], "2394": [2327, 2364], "2395": [2332, 2364], "2396": [2337, 2364], "2397": [2338, 2364], "2398": [2347, 2364], "2399": [2351, 2364], "2507": [2503, 2494], "2508": [2503, 2519], "2524": [2465, 2492], "2525": [2466, 2492], "2527": [2479, 2492], "2611": [2610, 2620], "2614": [2616, 2620], "2649": [2582, 2620], "2650": [2583, 2620], "2651": [2588, 2620], "2654": [2603, 2620], "2888": [2887, 2902], "2891": [2887, 2878], "2892": [2887, 2903], "2908": [2849, 2876], "2909": [2850, 2876], "2964": [2962, 3031], "3018": [3014, 3006], "3019": [3015, 3006], "3020": [3014, 3031], "3144": [3142, 3158], "3264": [3263, 3285], "3271": [3270, 3285], "3272": [3270, 3286], "3274": [3270, 3266], "3275": [3274, 3285], "3402": [3398, 3390], "3403": [3399, 3390], "3404": [3398, 3415] },
  excl: [2392, 2393, 2394, 2395, 2396, 2397, 2398, 2399, 2524, 2525, 2527, 2611, 2614, 2649, 2650, 2651, 2654, 2908, 2909]
};

// js/unidata.ts
var UNICODE_VERSION = unicode15_default.unicode;
var MN = 1;
var M = 2;
var L = 4;
var SECOND = 8;
var prop = new Map;
var decomp = new Map;
var pairs = new Map;
for (let i = 0;i < unicode15_default.ranges.length; i += 2)
  for (let c = unicode15_default.ranges[i];c <= unicode15_default.ranges[i + 1]; c++)
    prop.set(c, 0);
var set = (flat, f) => {
  for (let i = 0;i < flat.length; i += 2)
    for (let c = flat[i];c <= flat[i + 1]; c++)
      prop.set(c, prop.get(c) | f);
};
set(unicode15_default.mn, MN);
set(unicode15_default.m, M);
set(unicode15_default.l, L);
for (let i = 0;i < unicode15_default.ccc.length; i += 3) {
  for (let c = unicode15_default.ccc[i];c <= unicode15_default.ccc[i + 1]; c++)
    prop.set(c, prop.get(c) | unicode15_default.ccc[i + 2] << 4);
}
var excl = new Set(unicode15_default.excl);
for (const [k, d] of Object.entries(unicode15_default.decomp)) {
  const c = Number(k);
  decomp.set(c, d);
  if (d.length === 2 && !excl.has(c)) {
    pairs.set(d[0] * 1114112 + d[1], c);
    prop.set(d[1], prop.get(d[1]) | SECOND);
  }
}
var ch = (cp) => String.fromCodePoint(cp);
function str(cps, i, j) {
  let out = "";
  for (let k = i;k < j; k += 8192)
    out += String.fromCodePoint(...cps.slice(k, Math.min(j, k + 8192)));
  return out;
}
function isMark(cp) {
  const p = prop.get(cp);
  return p === undefined ? /\p{M}/u.test(ch(cp)) : (p & M) !== 0;
}
function isLetter(cp) {
  const p = prop.get(cp);
  return p === undefined ? /\p{L}/u.test(ch(cp)) : (p & L) !== 0;
}
function nfd(cp) {
  if (!prop.has(cp))
    return Array.from(ch(cp).normalize("NFD"), (x) => x.codePointAt(0));
  const d = decomp.get(cp);
  return d ? d.flatMap(nfd) : [cp];
}
var stable = (p, cp) => p >> 4 === 0 && (p & SECOND) === 0 && !decomp.has(cp);
function nfc(s) {
  const cps = Array.from(s, (x) => x.codePointAt(0));
  let out = "";
  for (let i = 0;i < cps.length; ) {
    let j = i + 1;
    let pure = prop.has(cps[i]);
    for (;j < cps.length; j++) {
      const p = prop.get(cps[j]);
      if (p === undefined)
        pure = false;
      else if (stable(p, cps[j]))
        break;
    }
    out += pure ? compose(cps, i, j) : str(cps, i, j).normalize("NFC");
    i = j;
  }
  return out;
}
function compose(cps, i, j) {
  let last = 0, normal = true;
  for (let k = i;k < j && normal; k++) {
    const p = prop.get(cps[k]), c = p >> 4;
    if (decomp.has(cps[k]) || (p & SECOND) !== 0 || c !== 0 && c < last)
      normal = false;
    last = c;
  }
  if (normal)
    return str(cps, i, j);
  const d = [];
  for (let k = i;k < j; k++)
    d.push(...nfd(cps[k]));
  const ccc = (cp) => prop.get(cp) >> 4;
  for (let a = 0;a < d.length; ) {
    if (ccc(d[a]) === 0) {
      a++;
      continue;
    }
    let b = a;
    while (b < d.length && ccc(d[b]) !== 0)
      b++;
    const run = d.slice(a, b).sort((x, y) => ccc(x) - ccc(y));
    for (let n = 0;n < run.length; n++)
      d[a + n] = run[n];
    a = b;
  }
  const out = [];
  let starter = -1;
  for (const c of d) {
    const cc = ccc(c);
    if (starter >= 0 && (out.length - 1 === starter || ccc(out[out.length - 1]) < cc)) {
      const p = pairs.get(out[starter] * 1114112 + c);
      if (p !== undefined) {
        out[starter] = p;
        continue;
      }
    }
    if (cc === 0)
      starter = out.length;
    out.push(c);
  }
  return str(out, 0, out.length);
}

// js/romanize.ts
var RULES = rules_default;
var RULES_VERSION = RULES.rules_version;
function languages(mode = "words") {
  return Object.keys(RULES.families[mode]).sort();
}
var CDN = `https://cdn.jsdelivr.net/gh/micahchoo/indickit@v${version}/romanize/lang/`;
async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`romanize: ${url}: ${res.status}`);
  return res.arrayBuffer();
}
function defaultFetcher(local) {
  return async (url) => {
    try {
      return await fetchBytes(url);
    } catch {
      return fetchBytes(new URL(url.href.slice(local.href.length), CDN));
    }
  };
}
function code(lang) {
  const c = langCode(lang);
  return c === "kok" ? "gom" : c;
}
var pooledCache = new Map;
async function load(lang, mode = "words", opts = {}) {
  const c = code(lang);
  const l = RULES.families[mode][c];
  if (!l)
    throw new Error(`romanize: no ${mode} tables for "${lang}"`);
  const base = new URL(opts.base ?? "../romanize/lang/", import.meta.url);
  const get = opts.fetch ?? (opts.base ? fetchBytes : defaultFetcher(base));
  const poolKey = `${base}${l.group}/${l.pooled}`;
  if (!pooledCache.has(poolKey))
    pooledCache.set(poolKey, get(new URL(`${l.group}/${l.pooled}`, base)));
  const [own, pool] = await Promise.all([get(new URL(`${c}/${l.file}`, base)), pooledCache.get(poolKey)]);
  return fromBytes(c, mode, new Uint8Array(own), new Uint8Array(pool));
}
function fromBytes(lang, mode, own, pool) {
  const l = RULES.families[mode][lang];
  if (!l)
    throw new Error(`romanize: no ${mode} tables for "${lang}"`);
  const x = new Mix(own, pool, l.tag, RULES.beam[mode]);
  const ranges = RULES.groups[l.group];
  const inScript = (ch2) => {
    const cp = ch2.codePointAt(0);
    return cp === 8204 || cp === 8205 || ranges.some(([lo, hi]) => cp >= lo && cp <= hi);
  };
  const letter = (c) => {
    const cp = c.codePointAt(0);
    return cp === 8204 || cp === 8205 || isLetter(cp) || isMark(cp);
  };
  const word = (w, n = 4) => {
    const s = stripJoiners(nfc(w));
    const known = x.lookup.get(s);
    if (known)
      return known.slice(0, n);
    return x.decode(unify(s), n).filter((o) => o !== "");
  };
  const r = {
    lang,
    mode,
    word,
    text(t) {
      const cs = [...nfc(t)];
      let out = "";
      for (let i = 0;i < cs.length; ) {
        if (!(inScript(cs[i]) && letter(cs[i]))) {
          out += cs[i++];
          continue;
        }
        let j = i;
        while (j < cs.length && inScript(cs[j]) && letter(cs[j]))
          j++;
        const run = cs.slice(i, j).join("");
        out += word(run, 1)[0] ?? run;
        i = j;
      }
      return out;
    }
  };
  Object.defineProperty(r, "_mix", { value: x });
  return r;
}
var JOINERS = /[\u200c\u200d]/gu;
function stripJoiners(s) {
  return s.replace(JOINERS, "");
}
function unify(w) {
  const u = RULES.unify;
  let out = "";
  for (const ch2 of w) {
    const cp = ch2.codePointAt(0);
    out += cp >= u.from[0] && cp <= u.from[1] ? String.fromCodePoint(u.to_block + (cp & u.mask)) : ch2;
  }
  return out;
}

class Reader {
  b;
  pos = 4;
  constructor(b) {
    this.b = b;
    if (b[0] !== 73 || b[1] !== 75 || b[2] !== 82 || b[3] !== 49)
      throw new Error("romanize: not an IKR1 file");
  }
  varint() {
    let v = 0;
    let shift = 1;
    for (;; ) {
      const byte = this.b[this.pos++];
      v += (byte & 127) * shift;
      if (byte < 128)
        return v;
      shift *= 128;
    }
  }
  str() {
    const n = this.varint();
    const s = DECODER.decode(this.b.subarray(this.pos, this.pos + n));
    this.pos += n;
    return s;
  }
  float64() {
    const v = new DataView(this.b.buffer, this.b.byteOffset + this.pos, 8).getFloat64(0, true);
    this.pos += 8;
    return v;
  }
}
var DECODER = new TextDecoder;
var ID = 2 ** 21;
function ctxKey(ctx, from) {
  let k = 0;
  for (let i = from;i < ctx.length; i++)
    k = k * ID + (ctx[i] + 1);
  return k;
}

class Model {
  vocab;
  levels = [];
  constructor(r, strs, ids) {
    this.vocab = r.varint();
    for (let l = r.varint();l > 0; l--) {
      const lv = { stats: new Map, counts: new Map };
      for (let c = r.varint();c > 0; c--) {
        const ctx = [];
        for (let i = r.varint();i > 0; i--)
          ctx.push(ids.id(strs[r.varint()]));
        const key = ctxKey(ctx, 0);
        const counts = new Map;
        let total = 0;
        let prev = 0;
        for (let t = r.varint();t > 0; t--) {
          prev += r.varint();
          const k = r.varint();
          counts.set(ids.id(strs[prev]), k);
          total += k;
        }
        lv.stats.set(key, [total, counts.size]);
        lv.counts.set(key, counts);
      }
      this.levels.push(lv);
    }
  }
  stats(ctx) {
    const s = { counts: [], total: [], wb: [] };
    for (let n = 0;n < this.levels.length; n++) {
      const key = ctxKey(ctx, ctx.length - n);
      const st = this.levels[n].stats.get(key);
      if (st && st[1] !== 0) {
        s.counts[n] = this.levels[n].counts.get(key);
        s.total[n] = st[0];
        s.wb[n] = st[0] / (st[0] + st[1]);
      }
    }
    return s;
  }
  prob(s, tok) {
    let p = 1 / (this.vocab + 1);
    for (let n = 0;n < this.levels.length; n++) {
      const c = s.counts[n];
      if (!c)
        continue;
      const lam = s.wb[n];
      p = lam * (c.get(tok) ?? 0) / s.total[n] + (1 - lam) * p;
    }
    return p;
  }
}

class Interner {
  ids = new Map;
  strs = [];
  id(s) {
    let v = this.ids.get(s);
    if (v === undefined) {
      v = this.strs.length;
      this.ids.set(s, v);
      this.strs.push(s);
    }
    return v;
  }
}
function before(a, b) {
  if (a.score !== b.score)
    return a.score > b.score;
  if (a.out !== b.out)
    return a.out < b.out;
  return a.idx < b.idx;
}
function top(cs, k) {
  const best = [];
  for (const c of cs) {
    if (best.length === k && !before(c, best[k - 1]))
      continue;
    let lo = 0;
    let hi = best.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (before(c, best[mid]))
        hi = mid;
      else
        lo = mid + 1;
    }
    best.splice(lo, 0, c);
    if (best.length > k)
      best.pop();
  }
  return best;
}

class Mix {
  beam;
  a;
  b;
  lam;
  start = [];
  eos;
  options = new Map;
  lookup = new Map;
  constructor(own, pool, tag, beam) {
    this.beam = beam;
    const ids = new Interner;
    let r = new Reader(pool);
    let strs = readStrings(r);
    this.b = new Model(r, strs, ids);
    r = new Reader(own);
    strs = readStrings(r);
    this.lam = r.float64();
    this.a = new Model(r, strs, ids);
    for (let k = r.varint();k > 0; k--) {
      const native = r.str();
      const sp = [];
      for (let i = r.varint();i > 0; i--)
        sp.push(strs[r.varint()]);
      this.lookup.set(native, sp);
    }
    for (let i = 0;i < RULES.order - 2; i++)
      this.start.push(ids.id(RULES.bos));
    this.start.push(ids.id(`<s:${tag}>`));
    this.eos = ids.id(RULES.eos);
    const seen = new Set;
    for (const m of [this.a, this.b]) {
      for (const counts of m.levels[0].counts.values()) {
        for (const t of counts.keys()) {
          if (t === this.eos || seen.has(t))
            continue;
          seen.add(t);
          const s = ids.strs[t];
          const i = s.indexOf("|");
          const chunk = s.slice(0, i);
          const list = this.options.get(chunk) ?? [];
          list.push({ tok: t, en: s.slice(i + 1) });
          this.options.set(chunk, list);
        }
      }
    }
    for (const list of this.options.values())
      list.sort((p, q) => p.en < q.en ? -1 : p.en > q.en ? 1 : 0);
    if (this.start.length > 2 || ids.strs.length >= ID)
      throw new Error("romanize: beyond the engine's limits");
  }
  logp(sa, sb, tok) {
    const pa = Math.exp(Math.log(this.a.prob(sa, tok)));
    const pb = Math.exp(Math.log(this.b.prob(sb, tok)));
    return Math.log(this.lam * pa + (1 - this.lam) * pb);
  }
  decode(word, n) {
    const w = [...stripJoiners(word)];
    const h = RULES.order - 1;
    const root = { score: 0, out: "", ctx: this.start };
    const beams = Array.from({ length: w.length + 1 }, () => []);
    beams[0].push({ score: 0, out: "", parent: null, tok: -1, idx: 0 });
    const context = (c) => {
      if (c.tok < 0)
        return c.parent.ctx;
      const ctx = [...c.parent.ctx, c.tok];
      return ctx.slice(ctx.length - h);
    };
    for (let i = 0;i < w.length; i++) {
      if (beams[i].length === 0)
        continue;
      for (const c of top(beams[i], this.beam)) {
        const hy = i === 0 ? root : { score: c.score, out: c.out, ctx: context(c) };
        let moved = false;
        const sa = this.a.stats(hy.ctx);
        const sb = this.b.stats(hy.ctx);
        for (let k = 1;k <= RULES.max_n && i + k <= w.length; k++) {
          const opts = this.options.get(w.slice(i, i + k).join(""));
          if (!opts)
            continue;
          for (const o of opts) {
            const next = beams[i + k];
            next.push({ score: hy.score + this.logp(sa, sb, o.tok), out: hy.out + o.en, parent: hy, tok: o.tok, idx: next.length });
            moved = true;
          }
        }
        if (!moved) {
          const next = beams[i + 1];
          next.push({ score: hy.score - RULES.unknown_penalty, out: hy.out, parent: hy, tok: -1, idx: next.length });
        }
      }
    }
    const final = new Map;
    for (const c of beams[w.length]) {
      const ctx = c.parent === null ? this.start : context(c);
      const s = c.score + this.logp(this.a.stats(ctx), this.b.stats(ctx), this.eos);
      const v = final.get(c.out);
      if (v === undefined || s > v)
        final.set(c.out, s);
    }
    return [...final].sort((p, q) => p[1] !== q[1] ? q[1] - p[1] : p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0).slice(0, n).map((e) => e[0]);
  }
}
function readStrings(r) {
  const strs = [];
  for (let i = r.varint();i > 0; i--)
    strs.push(r.str());
  return strs;
}
function _decode(r, word, n) {
  return r._mix.decode(word, n);
}
export {
  unify,
  load,
  languages,
  fromBytes,
  _decode,
  RULES_VERSION,
  CDN
};
