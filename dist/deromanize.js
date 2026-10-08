// deromanize/rules.json
var rules_default = {
  alpha: {
    names: 0.5,
    words: 1
  },
  beam: 40,
  blocks: {
    as: 2432,
    bn: 2432,
    gu: 2688,
    kn: 3200,
    ml: 3328,
    mni: 2432,
    or: 2816,
    pa: 2560,
    ta: 2944,
    te: 3072
  },
  bos: "<s>",
  eos: "</s>",
  families: {
    names: {
      as: {
        file: "as.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "as"
      },
      bn: {
        file: "bn.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "bn"
      },
      gom: {
        file: "gom.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "gom"
      },
      gu: {
        file: "gu.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "gu"
      },
      hi: {
        file: "hi.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "hi"
      },
      kn: {
        file: "kn.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "kn"
      },
      ks: {
        file: "ks.names.bin",
        group: "arabic",
        pooled: "names-arabic.bin",
        tag: "ks"
      },
      mai: {
        file: "mai.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "mai"
      },
      ml: {
        file: "ml.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "ml"
      },
      mni: {
        file: "mni.names.bin",
        group: "meetei",
        pooled: "names-meetei.bin",
        tag: "mni"
      },
      mr: {
        file: "mr.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "mr"
      },
      ne: {
        file: "ne.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "ne"
      },
      or: {
        file: "or.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "or"
      },
      pa: {
        file: "pa.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "pa"
      },
      sa: {
        file: "sa.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "sa"
      },
      sat: {
        file: "sat.names.bin",
        group: "olchiki",
        pooled: "names-olchiki.bin",
        tag: "sat"
      },
      sd: {
        file: "sd.names.bin",
        group: "arabic",
        pooled: "names-arabic.bin",
        tag: "sd"
      },
      ta: {
        file: "ta.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "ta"
      },
      te: {
        file: "te.names.bin",
        group: "brahmic",
        pooled: "names-brahmic.bin",
        tag: "te"
      },
      ur: {
        file: "ur.names.bin",
        group: "arabic",
        pooled: "names-arabic.bin",
        tag: "ur"
      }
    },
    words: {
      as: {
        file: "as.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "as:w"
      },
      bn: {
        file: "bn.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "bn:w"
      },
      brx: {
        file: "brx.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "brx:w"
      },
      doi: {
        file: "doi.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "doi:w"
      },
      gom: {
        file: "gom.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "gom:w"
      },
      gu: {
        file: "gu.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "gu:w"
      },
      hi: {
        file: "hi.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "hi:w"
      },
      kn: {
        file: "kn.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "kn:w"
      },
      ks: {
        file: "ks.words.bin",
        group: "arabic",
        pooled: "words-arabic.bin",
        tag: "ks:w"
      },
      mai: {
        file: "mai.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "mai:w"
      },
      ml: {
        file: "ml.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "ml:w"
      },
      mni: {
        file: "mni.words.bin",
        group: "meetei",
        pooled: "words-meetei.bin",
        tag: "mni:w"
      },
      mr: {
        file: "mr.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "mr:w"
      },
      ne: {
        file: "ne.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "ne:w"
      },
      or: {
        file: "or.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "or:w"
      },
      pa: {
        file: "pa.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "pa:w"
      },
      sa: {
        file: "sa.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "sa:w"
      },
      sd: {
        file: "sd.words.bin",
        group: "arabic",
        pooled: "words-arabic.bin",
        tag: "sd:w"
      },
      ta: {
        file: "ta.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "ta:w"
      },
      te: {
        file: "te.words.bin",
        group: "brahmic",
        pooled: "words-brahmic.bin",
        tag: "te:w"
      },
      ur: {
        file: "ur.words.bin",
        group: "arabic",
        pooled: "words-arabic.bin",
        tag: "ur:w"
      }
    }
  },
  files: {
    "as.list.bin": 968637,
    "as.names-list.bin": 36290,
    "as.names.bin": 56650,
    "as.words.bin": 176986,
    "bn.list.bin": 3079000,
    "bn.names-list.bin": 80018,
    "bn.names.bin": 93290,
    "bn.words.bin": 274214,
    "brx.list.bin": 1380902,
    "brx.words.bin": 178898,
    "doi.list.bin": 130906,
    "doi.words.bin": 31566,
    "gom.list.bin": 539579,
    "gom.names-list.bin": 2161,
    "gom.names.bin": 8019,
    "gom.words.bin": 213860,
    "gu.list.bin": 1340814,
    "gu.names-list.bin": 14290,
    "gu.names.bin": 28406,
    "gu.words.bin": 269838,
    "hi.list.bin": 2135004,
    "hi.names-list.bin": 67117,
    "hi.names.bin": 95894,
    "hi.words.bin": 346268,
    "kn.list.bin": 5503072,
    "kn.names-list.bin": 31357,
    "kn.names.bin": 49035,
    "kn.words.bin": 180882,
    "ks.list.bin": 79144,
    "ks.names-list.bin": 9689,
    "ks.names.bin": 25155,
    "ks.words.bin": 282541,
    "mai.list.bin": 300299,
    "mai.names-list.bin": 15030,
    "mai.names.bin": 30010,
    "mai.words.bin": 265014,
    "ml.list.bin": 7515032,
    "ml.names-list.bin": 54838,
    "ml.names.bin": 77706,
    "ml.words.bin": 216480,
    "mni.list.bin": 143844,
    "mni.names-list.bin": 5010,
    "mni.names.bin": 5929,
    "mni.words.bin": 124789,
    "mr.list.bin": 2490422,
    "mr.names-list.bin": 52737,
    "mr.names.bin": 73778,
    "mr.words.bin": 227461,
    "names-arabic.bin": 150824,
    "names-brahmic.bin": 453871,
    "names-meetei.bin": 47333,
    "names-olchiki.bin": 108903,
    "ne.list.bin": 1360103,
    "ne.names-list.bin": 13305,
    "ne.names.bin": 28449,
    "ne.words.bin": 218450,
    "or.list.bin": 875046,
    "or.names-list.bin": 33026,
    "or.names.bin": 49200,
    "or.words.bin": 198961,
    "pa.list.bin": 1194784,
    "pa.names-list.bin": 59690,
    "pa.names.bin": 75324,
    "pa.words.bin": 289107,
    "sa.list.bin": 1837666,
    "sa.names-list.bin": 6983,
    "sa.names.bin": 20106,
    "sa.words.bin": 169505,
    "sat.list.bin": 484539,
    "sat.names-list.bin": 34457,
    "sat.names.bin": 65022,
    "sd.list.bin": 402905,
    "sd.names-list.bin": 2602,
    "sd.names.bin": 8121,
    "sd.words.bin": 327439,
    "ta.list.bin": 5456850,
    "ta.names-list.bin": 115847,
    "ta.names.bin": 118779,
    "ta.words.bin": 178395,
    "te.list.bin": 2904372,
    "te.names-list.bin": 114224,
    "te.names.bin": 119410,
    "te.words.bin": 199661,
    "ur.list.bin": 1546931,
    "ur.names-list.bin": 61255,
    "ur.names.bin": 99309,
    "ur.words.bin": 380888,
    "words-arabic.bin": 858744,
    "words-brahmic.bin": 1682820,
    "words-meetei.bin": 204368,
    "words-olchiki.bin": 70815
  },
  groups: {
    arabic: [
      [
        1536,
        1791
      ],
      [
        1872,
        1919
      ],
      [
        64336,
        65023
      ]
    ],
    brahmic: [
      [
        2304,
        3455
      ]
    ],
    meetei: [
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
  lists: {
    as: {
      names: "as.names-list.bin",
      words: "as.list.bin"
    },
    bn: {
      names: "bn.names-list.bin",
      words: "bn.list.bin"
    },
    brx: {
      words: "brx.list.bin"
    },
    doi: {
      words: "doi.list.bin"
    },
    gom: {
      names: "gom.names-list.bin",
      words: "gom.list.bin"
    },
    gu: {
      names: "gu.names-list.bin",
      words: "gu.list.bin"
    },
    hi: {
      names: "hi.names-list.bin",
      words: "hi.list.bin"
    },
    kn: {
      names: "kn.names-list.bin",
      words: "kn.list.bin"
    },
    ks: {
      names: "ks.names-list.bin",
      words: "ks.list.bin"
    },
    mai: {
      names: "mai.names-list.bin",
      words: "mai.list.bin"
    },
    ml: {
      names: "ml.names-list.bin",
      words: "ml.list.bin"
    },
    mni: {
      names: "mni.names-list.bin",
      words: "mni.list.bin"
    },
    mr: {
      names: "mr.names-list.bin",
      words: "mr.list.bin"
    },
    ne: {
      names: "ne.names-list.bin",
      words: "ne.list.bin"
    },
    or: {
      names: "or.names-list.bin",
      words: "or.list.bin"
    },
    pa: {
      names: "pa.names-list.bin",
      words: "pa.list.bin"
    },
    sa: {
      names: "sa.names-list.bin",
      words: "sa.list.bin"
    },
    sat: {
      names: "sat.names-list.bin",
      words: "sat.list.bin"
    },
    sd: {
      names: "sd.names-list.bin",
      words: "sd.list.bin"
    },
    ta: {
      names: "ta.names-list.bin",
      words: "ta.list.bin"
    },
    te: {
      names: "te.names-list.bin",
      words: "te.list.bin"
    },
    ur: {
      names: "ur.names-list.bin",
      words: "ur.list.bin"
    }
  },
  max_n: 3,
  nbest: 16,
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
// normalize/rules.json
var rules_default2 = {
  version: "2026-10-07",
  max_passes: 8,
  chillu: { map: { ണ: "ൺ", ന: "ൻ", ര: "ർ", ല: "ൽ", ള: "ൾ", ക: "ൿ" }, virama: "്", joiner: "‍", not_before: "റ" },
  ra: { virama: "্", assamese: "ৰ", bengali: "র", assamese_langs: ["as"] },
  khanda_ta: { from: "ত্‍", to: "ৎ", not_before: [[2433, 2435], [2492, 2519], [2530, 2531]] },
  invisible: { "‌": "n", "‍": "j", "​": "s", "⁠": "w", "\uFEFF": "f", "­": "h" },
  width: [3, 3],
  scripts: [["Devanagari", [[2304, 2431], [43232, 43263]]], ["Bengali", [[2432, 2559]]], ["Gurmukhi", [[2560, 2687]]], ["Gujarati", [[2688, 2815]]], ["Oriya", [[2816, 2943]]], ["Tamil", [[2944, 3071]]], ["Telugu", [[3072, 3199]]], ["Kannada", [[3200, 3327]]], ["Malayalam", [[3328, 3455]]], ["MeeteiMayek", [[43744, 43775], [43968, 44031]]], ["OlChiki", [[7248, 7295]]], ["Arabic", [[1536, 1791], [1872, 1919], [64336, 65023], [65136, 65279]]]],
  classes: [[1536, 1541, "U"], [1544, 1544, "U"], [1547, 1547, "U"], [1552, 1562, "M"], [1568, 1568, "A"], [1569, 1569, "U"], [1570, 1573, "R"], [1574, 1574, "A"], [1575, 1575, "R"], [1576, 1576, "A"], [1577, 1577, "R"], [1578, 1582, "A"], [1583, 1586, "R"], [1587, 1599, "A"], [1600, 1600, "K"], [1601, 1607, "A"], [1608, 1608, "R"], [1609, 1610, "A"], [1611, 1631, "M"], [1646, 1647, "A"], [1648, 1648, "M"], [1649, 1651, "R"], [1652, 1652, "U"], [1653, 1655, "R"], [1656, 1671, "A"], [1672, 1689, "R"], [1690, 1727, "A"], [1728, 1728, "R"], [1729, 1730, "A"], [1731, 1739, "R"], [1740, 1740, "A"], [1741, 1741, "R"], [1742, 1742, "A"], [1743, 1743, "R"], [1744, 1745, "A"], [1746, 1747, "R"], [1749, 1749, "R"], [1750, 1756, "M"], [1757, 1757, "U"], [1759, 1764, "M"], [1767, 1768, "M"], [1770, 1773, "M"], [1774, 1775, "R"], [1786, 1788, "A"], [1791, 1791, "A"], [1872, 1880, "A"], [1881, 1883, "R"], [1884, 1898, "A"], [1899, 1900, "R"], [1901, 1904, "A"], [1905, 1905, "R"], [1906, 1906, "A"], [1907, 1908, "R"], [1909, 1911, "A"], [1912, 1913, "R"], [1914, 1919, "A"], [2304, 2307, "B"], [2308, 2324, "I"], [2325, 2361, "C"], [2362, 2363, "M"], [2364, 2364, "N"], [2366, 2380, "M"], [2381, 2381, "V"], [2382, 2383, "M"], [2389, 2391, "M"], [2392, 2399, "C"], [2400, 2401, "I"], [2402, 2403, "M"], [2418, 2423, "I"], [2424, 2431, "C"], [2433, 2435, "B"], [2437, 2444, "I"], [2447, 2448, "I"], [2451, 2452, "I"], [2453, 2472, "C"], [2474, 2480, "C"], [2482, 2482, "C"], [2486, 2489, "C"], [2492, 2492, "N"], [2494, 2500, "M"], [2503, 2504, "M"], [2507, 2508, "M"], [2509, 2509, "V"], [2510, 2510, "D"], [2519, 2519, "M"], [2524, 2525, "C"], [2527, 2527, "C"], [2528, 2529, "I"], [2530, 2531, "M"], [2544, 2545, "C"], [2556, 2556, "B"], [2561, 2563, "B"], [2565, 2570, "I"], [2575, 2576, "I"], [2579, 2580, "I"], [2581, 2600, "C"], [2602, 2608, "C"], [2610, 2611, "C"], [2613, 2614, "C"], [2616, 2617, "C"], [2620, 2620, "N"], [2622, 2626, "M"], [2631, 2632, "M"], [2635, 2636, "M"], [2637, 2637, "V"], [2649, 2652, "C"], [2654, 2654, "C"], [2672, 2672, "B"], [2689, 2691, "B"], [2693, 2701, "I"], [2703, 2705, "I"], [2707, 2708, "I"], [2709, 2728, "C"], [2730, 2736, "C"], [2738, 2739, "C"], [2741, 2745, "C"], [2748, 2748, "N"], [2750, 2757, "M"], [2759, 2761, "M"], [2763, 2764, "M"], [2765, 2765, "V"], [2784, 2785, "I"], [2786, 2787, "M"], [2809, 2809, "C"], [2813, 2815, "N"], [2817, 2819, "B"], [2821, 2828, "I"], [2831, 2832, "I"], [2835, 2836, "I"], [2837, 2856, "C"], [2858, 2864, "C"], [2866, 2867, "C"], [2869, 2873, "C"], [2876, 2876, "N"], [2878, 2884, "M"], [2887, 2888, "M"], [2891, 2892, "M"], [2893, 2893, "V"], [2901, 2903, "M"], [2908, 2909, "C"], [2911, 2911, "C"], [2912, 2913, "I"], [2914, 2915, "M"], [2929, 2929, "C"], [2946, 2946, "B"], [2949, 2954, "I"], [2958, 2960, "I"], [2962, 2964, "I"], [2965, 2965, "C"], [2969, 2970, "C"], [2972, 2972, "C"], [2974, 2975, "C"], [2979, 2980, "C"], [2984, 2986, "C"], [2990, 3001, "C"], [3006, 3010, "M"], [3014, 3016, "M"], [3018, 3020, "M"], [3021, 3021, "V"], [3031, 3031, "M"], [3072, 3076, "B"], [3077, 3084, "I"], [3086, 3088, "I"], [3090, 3092, "I"], [3093, 3112, "C"], [3114, 3129, "C"], [3132, 3132, "N"], [3134, 3140, "M"], [3142, 3144, "M"], [3146, 3148, "M"], [3149, 3149, "V"], [3157, 3158, "M"], [3160, 3162, "C"], [3165, 3165, "D"], [3168, 3169, "I"], [3170, 3171, "M"], [3200, 3203, "B"], [3205, 3212, "I"], [3214, 3216, "I"], [3218, 3220, "I"], [3221, 3240, "C"], [3242, 3251, "C"], [3253, 3257, "C"], [3260, 3260, "N"], [3262, 3268, "M"], [3270, 3272, "M"], [3274, 3276, "M"], [3277, 3277, "V"], [3285, 3286, "M"], [3293, 3293, "D"], [3294, 3294, "C"], [3296, 3297, "I"], [3298, 3299, "M"], [3315, 3315, "B"], [3328, 3332, "B"], [3333, 3340, "I"], [3342, 3344, "I"], [3346, 3348, "I"], [3349, 3386, "C"], [3387, 3388, "V"], [3390, 3396, "M"], [3398, 3400, "M"], [3402, 3404, "M"], [3405, 3405, "V"], [3412, 3414, "D"], [3415, 3415, "M"], [3423, 3425, "I"], [3426, 3427, "M"], [3450, 3455, "D"], [7258, 7287, "C"], [7288, 7293, "B"], [43250, 43251, "B"], [43262, 43262, "I"], [43263, 43263, "M"], [43744, 43745, "I"], [43746, 43754, "C"], [43755, 43759, "M"], [43765, 43765, "B"], [43766, 43766, "V"], [43968, 43981, "C"], [43982, 43983, "I"], [43984, 43984, "C"], [43985, 43985, "I"], [43986, 43994, "C"], [44003, 44010, "M"], [44013, 44013, "V"], [64336, 64433, "U"], [64467, 64829, "U"], [64848, 64911, "U"], [64914, 64967, "U"], [65008, 65019, "U"], [65136, 65140, "U"], [65142, 65276, "U"]],
  features: ["script", "char", "left1", "left2", "left3", "right1", "right2", "right3"],
  tree: [0, { b: [7, { $: [6, { $: [2, { "?": [5, { "$?KUjns": 1 }], A: [1, { fw: [5, { $: [3, { AKU: 1 }], "?AKRUjns": 1 }], h: [5, { $: [3, { AKU: 1 }], "?AKUjns": 1, R: [4, { "?AMR^s": 1 }] }], j: [5, { Kj: 1 }], n: [5, { $: [3, { AKU: 1 }], "?Uns": 1, M: [4, { "MR^": 1 }] }], s: [5, { $: [3, { AKU: 1 }], "?AKRUjns": 1, M: [4, { "MR^": 1 }] }] }], K: [5, { $Ujns: 1, AR: [1, { fhsw: 1 }] }], U: [5, { "$?jns": 1, AR: [1, { fhnsw: 1 }], M: [1, { ns: 1 }] }], j: [1, { fhjsw: 1, n: [5, { $: [4, { "?AKMRUjn": 1 }], "?MUjns": 1, K: [3, { A: 1 }] }] }], n: [1, { fhw: [5, { "$?AKRUjns": 1 }], j: [5, { $: [4, { "?AKMRUjn": 1 }], "?KUjns": 1 }], ns: 1 }], s: [1, { fhw: [5, { "$?AKRUjns": 1 }], j: [5, { $: [3, { "?KUjn": 1 }], "?": [3, { "?R": 1 }], Kj: 1, U: [3, { R: 1 }] }], n: [5, { "$?Uns": 1, A: [3, { RU: 1 }], M: [3, { AUn: 1 }], R: [3, { R: 1 }] }], s: 1 }], M: [3, { A: [1, { fhsw: [5, { "$?ARjns": 1 }], j: [5, { j: 1 }], n: [5, { "$?ns": 1 }] }], M: [4, { A: [1, { fhsw: 1 }], M: [5, { $jns: 1 }], R: [1, { fhnsw: 1 }], "U^": 1 }], R: [5, { "$?Ujns": 1, AR: [1, { fhnsw: 1 }] }], U: [5, { "$?jns": 1 }], n: 1, "^": [5, { $hjns: 1 }] }], R: [5, { $s: [3, { AKMRUn: 1 }], AR: [1, { fhnsw: 1 }], "?KUjn": 1, M: [1, { n: [3, { A: 1 }], s: 1 }] }], h: 1, "^": [1, { fhnsw: 1 }] }], "?": [2, { "?^": 1, j: [1, { fhjsw: 1, n: [5, { "?M": 1 }] }], n: [1, { fhw: [5, { "?AR": 1 }], j: [5, { "?": 1 }], ns: 1 }], s: [1, { fhw: [5, { "?AR": 1 }], j: [3, { "?": 1 }], n: [3, { "?R": 1, A: [5, { M: 1 }] }], s: 1 }], A: [1, { fhw: [5, { ARjns: 1 }], j: [5, { R: [3, { A: 1 }], j: 1 }], n: [5, { Mns: 1 }], s: 1 }], M: [3, { A: [1, { fhsw: [5, { jns: 1 }], j: [5, { j: 1 }], n: [5, { ns: 1 }] }], M: [1, { fhsw: 1 }], R: [5, { jns: 1 }], U: 1 }], R: [5, { AR: [1, { fhnsw: 1 }], Ujns: 1, M: [1, { ns: 1 }] }], U: [5, { jns: 1 }] }], A: [5, { "?": 1, j: [1, { fhjsw: 1, n: [2, { KRUn: 1, M: [3, { R: 1 }] }] }], n: [1, { fhnsw: 1, j: [2, { KRUjn: 1, M: [3, { R: 1 }] }] }], s: [1, { fhsw: 1, n: [2, { RUn: 1, M: [3, { R: 1 }] }] }], R: [1, { fsw: 1, h: [3, { "?KMRU^fjn": 1, A: [2, { KMRjn: 1 }] }], j: [2, { j: 1 }], n: [2, { Rn: 1, Ms: [3, { R: 1 }] }] }], A: [1, { fhsw: 1, j: [2, { A: [3, { U: 1 }], j: 1 }], n: [2, { RUn: 1, s: [3, { Rn: 1 }], M: [3, { R: 1 }] }] }], K: [1, { fhsw: 1, jn: [2, { jn: 1 }] }], M: [1, { s: [2, { ARjns: 1 }], n: [2, { Rn: 1 }], fhjw: [2, { j: 1 }] }], U: [1, { fhnsw: 1, j: [2, { Rjn: 1, s: [3, { R: 1 }] }] }] }], U: [1, { fhw: [5, { "?AKRjns": 1 }], j: [2, { "?K^j": 1, s: [5, { K: 1 }], A: [5, { j: 1 }], R: [5, { jns: 1 }], M: [4, { A: 1 }] }], n: [2, { "?KR^n": 1, j: [5, { K: 1 }], Ms: [3, { R: 1 }], A: [5, { ns: 1 }] }], s: 1 }], K: [1, { fhsw: 1, j: [5, { "?Kjs": 1, n: [3, { "?": 1 }], A: [2, { Aj: 1 }] }], n: [2, { "?^n": 1, A: [5, { n: 1 }] }] }], R: [1, { fw: [5, { AKRUjns: 1, M: [2, { j: 1 }] }], h: [5, { AKUjn: 1, s: [4, { "?KMR^n": 1, A: [3, { AKM: 1 }] }], M: [2, { j: 1 }], R: [3, { "AMR^jn": 1, K: [4, { K: 1 }] }] }], n: [2, { "U^n": 1, A: [5, { n: 1 }], M: [5, { n: 1, ARjs: [3, { R: 1 }] }], R: [5, { ARjns: 1, M: [3, { MR: 1 }] }], s: [3, { R: [5, { AR: 1 }], "U^n": 1 }], K: [5, { jn: 1 }], j: [5, { KU: 1 }] }], s: [5, { AKRUjns: 1, M: [2, { Ajns: 1, R: [3, { AMR: 1 }] }] }], j: [2, { A: [5, { j: 1 }], M: [5, { j: 1, n: [3, { R: 1 }] }], j: 1, KRU: [5, { jn: 1 }], n: [5, { KU: 1 }] }] }], M: [1, { fw: [5, { ARUj: 1, Mn: [2, { j: 1 }] }], h: [5, { AUj: 1, R: [2, { A: [4, { "MR^": 1 }], KMRjn: 1, s: [3, { KMR: 1 }] }], Mn: [2, { j: 1 }] }], j: [5, { A: [2, { A: [3, { A: 1 }], j: 1 }], j: 1, MRn: [2, { j: 1 }], U: [2, { Rjn: 1, Ms: [3, { R: 1 }] }] }], s: [5, { ARUjns: 1, M: [2, { ARjns: 1 }] }], n: [5, { M: [2, { Ajn: 1, Rs: [3, { A: 1 }] }], Un: 1, s: [2, { A: [4, { "MR^": 1 }], Un: 1 }], AR: [2, { Rn: 1, Ms: [3, { R: 1 }] }], j: [2, { RUn: 1, M: [3, { R: 1 }] }] }] }], j: [1, { fhsw: 1, j: [5, { A: [2, { Aj: 1 }], js: 1 }], n: [2, { A: [5, { n: 1 }], Rn: 1 }] }], n: [1, { fw: [5, { AKRjns: 1, M: [2, { j: 1 }] }], h: [5, { AKjns: 1, R: [2, { Ajn: 1 }], M: [2, { j: 1 }] }], j: [5, { Kj: 1, AMR: [2, { j: 1 }], ns: [2, { R: 1 }] }], n: [2, { AM: [5, { ns: 1 }], KRn: 1, j: [3, { j: 1 }], s: [3, { R: 1 }] }], s: 1 }], s: [1, { fhsw: 1, j: [2, { A: [5, { j: 1 }], R: [5, { jns: 1 }], j: 1 }], n: [2, { A: [5, { ns: 1 }], Rn: 1 }] }], h: 1 }], R: [1, { fw: [5, { "?ARUhj": 1, n: [6, { "?AKRUjn": 1 }], s: [6, { "?AKRUjns": 1 }], K: [6, { AKR: 1 }], M: [2, { j: 1 }] }], h: [5, { "?AUhj": 1, n: [6, { "?AKRUjn": 1 }], s: [6, { "?AKUjns": 1, R: [4, { "?AKMR^n": 1 }] }], R: [3, { A: [4, { "?AKMUhjs": 1, R: [2, { ARjns: 1 }], "^": [2, { AMRjn: 1 }], n: [6, { A: 1 }] }], "?KMRUjns": 1, "^": [2, { "R^jns": 1 }] }], K: [6, { AKR: 1 }], M: [2, { j: 1 }] }], j: [5, { "?": [3, { "?R^": 1 }], U: [2, { Rjn: 1, s: [3, { R: 1 }] }], j: 1, n: [2, { "?^j": 1, U: [6, { A: 1 }], R: [6, { "?ARU": 1 }], K: [6, { AKR: 1 }], n: [6, { AR: 1 }], M: [3, { K: 1, R: [6, { AR: 1 }] }], s: [3, { "^s": 1 }] }], R: [2, { A: [3, { K: 1 }], j: 1 }], s: [2, { A: [3, { A: [4, { K: 1 }] }], R: [6, { "?U": 1 }], j: 1 }], AM: [2, { j: 1 }], K: [2, { A: [3, { A: 1 }], j: 1, n: [6, { AKR: 1 }], s: [3, { A: [4, { K: 1 }] }] }] }], n: [5, { "?Un": 1, j: [2, { "?KRU^jn": 1, M: [3, { KR: 1 }], s: [4, { "^": 1 }] }], s: [2, { "?U^ns": 1, R: [6, { "?ARU": 1, M: [3, { M: 1 }] }], A: [6, { "?n": 1 }], M: [6, { n: 1, AR: [3, { R: 1 }] }] }], A: [2, { "?RUn": 1, s: [3, { "?RUns": 1, M: [4, { R: 1 }] }], M: [3, { R: 1 }] }], R: [2, { "?R^n": 1, s: [3, { "?R^ns": 1, M: [4, { R: 1 }] }], M: [3, { R: 1 }] }], M: [2, { A: [6, { n: 1 }], R: [3, { "A^": 1, M: [4, { R: 1 }], R: [4, { "^": 1 }] }], j: [6, { Kn: 1 }], n: 1, s: [6, { n: 1, MR: [3, { R: 1 }] }] }], K: [2, { jn: 1 }] }], s: [5, { "?AKRUhjns": 1, M: [2, { AKjns: 1, R: [4, { "AR^": 1 }] }] }] }], A: [1, { fw: [5, { "?ARUfj": 1, ns: [6, { "?AKRUjns": 1 }], K: [6, { AKR: 1, M: [2, { j: 1 }] }], M: [2, { "^j": 1, ns: [3, { "^": 1 }] }] }], h: [5, { "?AUfj": 1, n: [6, { "?AKRUjns": 1 }], s: [6, { "?AKUjns": 1, R: [3, { "?AKMU^jns": 1, R: [4, { "AM^": 1 }] }] }], R: [3, { A: [2, { A: [6, { ARU: 1 }], KRjn: 1, s: [4, { "AMR^": 1 }], M: [4, { "AM^": 1 }] }], "?KMRU^fjns": 1 }], K: [6, { AKR: 1, M: [2, { j: 1 }] }], M: [2, { "^j": 1, ns: [3, { "^": 1 }] }] }], j: [5, { "?": [2, { "?Rjn": 1, s: [3, { "?": 1 }] }], U: [3, { "?MR^": 1, A: [2, { Rj: 1 }] }], j: 1, n: [2, { "?j": 1, U: [6, { A: 1 }], R: [6, { "?ARUn": 1 }], K: [6, { AKR: 1 }], n: [6, { AR: 1 }], M: [3, { K: [4, { K: 1 }], R: [6, { AR: 1 }], U: 1 }], s: [3, { "^s": 1 }] }], s: [2, { "?": [3, { "?": 1 }], A: [3, { U: [6, { A: 1 }], j: 1 }], M: [3, { K: [4, { K: 1 }] }], R: [6, { "?Un": 1 }], j: 1 }], A: [2, { j: 1, s: [3, { K: [4, { M: 1 }], j: 1 }], A: [3, { U: 1 }] }], R: [2, { A: [3, { A: [4, { M: 1 }] }], j: 1 }], K: [2, { A: [3, { A: [6, { R: 1 }] }], j: 1, n: [6, { AKR: 1 }] }], M: [2, { j: 1 }] }], n: [5, { "?Un": 1, A: [2, { "?U^n": 1, s: [3, { "?U^ns": 1, R: [4, { "AKMR^": 1 }], M: [4, { R: 1 }] }], R: [3, { "AKMR^": 1, n: [6, { R: 1 }] }], M: [3, { R: 1 }] }], j: [2, { "?KRUjn": 1, M: [3, { "KRU^": 1 }], s: [3, { "R^s": 1 }] }], s: [2, { "?U^n": 1, R: [6, { "?RUn": 1, A: [3, { AKMRn: 1 }] }], A: [6, { "?Un": 1 }], M: [6, { n: 1, AR: [3, { R: 1 }] }], s: [3, { "^s": 1 }] }], R: [2, { "?R^n": 1, s: [3, { "?R^ns": 1, M: [4, { R: 1 }] }], M: [3, { R: 1 }] }], M: [2, { A: [6, { n: 1 }], "U^n": 1, j: [6, { Kn: 1 }], s: [3, { A: [6, { n: 1 }], R: [4, { AR: 1 }], "U^": 1 }], R: [4, { R: [3, { A: 1 }], "^": 1 }] }], K: [2, { jn: 1 }] }], s: [5, { "?AKRUfjns": 1, M: [2, { A: [4, { "AR^": 1, M: [6, { AR: 1 }] }], "KU^jns": 1, R: [3, { "AM^": 1, R: [6, { R: 1 }] }] }] }] }], "?": [1, { fhw: [5, { "?ARUj": 1, ns: [6, { "?AR": 1 }], M: [2, { j: 1 }] }], j: [2, { "?j": 1, n: [5, { "?": 1 }], s: [3, { "?": 1 }], A: [5, { R: [3, { A: [4, { "A^": 1 }] }], j: 1 }], M: [5, { j: 1 }], R: [5, { "?Uj": 1, n: [6, { "?AR": 1 }], s: [6, { "?": 1 }] }], "^": [6, { "?": 1 }] }], n: [2, { "?RU^n": 1, j: [5, { "?": 1 }], s: [3, { "?R^": 1, M: [4, { R: 1 }] }], A: [5, { n: 1, s: [6, { "?M": 1 }] }], M: [3, { A: [5, { n: 1 }], R: 1 }] }], s: 1 }], U: [1, { f: [5, { "?AKRj": 1, ns: [6, { AR: 1 }], M: [2, { j: 1 }] }], h: [5, { "?AKj": 1, n: [6, { AR: 1 }], s: [6, { AKR: 1 }], R: [6, { AR: 1, M: [2, { jn: 1 }] }], M: [2, { j: 1 }] }], j: [5, { "?j": 1, n: [2, { R: [6, { AR: 1 }], K: 1, M: [3, { R: 1 }] }], AM: [2, { j: 1 }], R: [2, { A: [3, { A: [4, { "^": 1 }] }], j: 1, s: [3, { A: [4, { A: 1 }] }] }], K: [2, { jn: 1 }] }], n: [2, { "?^n": 1, j: [5, { K: 1 }], s: [3, { "R^": 1 }], A: [5, { n: 1, s: [6, { M: 1 }] }], R: [3, { "AKR^": 1, M: [6, { AR: 1 }] }], K: [5, { jn: 1 }], M: [3, { R: 1, A: [5, { n: 1 }] }] }], s: 1, w: [5, { "?AKRj": 1, n: [6, { AKR: 1 }], s: [6, { AR: 1 }], M: [2, { j: 1 }] }] }], M: [5, { j: [1, { fhjsw: 1, n: [2, { K: [6, { AR: 1 }], "R^n": 1, M: [3, { R: 1, M: [4, { R: 1 }] }] }] }], n: [1, { fhw: [6, { ARU: 1 }], ns: 1, j: [2, { K: [6, { AR: 1 }], R: [6, { ARU: 1 }], "^jn": 1, M: [3, { R: [6, { ARU: 1 }] }] }] }], s: [1, { fw: [6, { ARU: 1 }], h: [6, { AU: 1, R: [2, { AKR: 1, M: [3, { MR: 1 }] }] }], j: [2, { M: [3, { R: [6, { U: 1 }] }], R: [6, { U: 1 }] }], s: 1, n: [6, { M: [2, { R: [4, { "^": 1 }] }], Un: 1, A: [2, { Rn: 1, M: [3, { R: 1 }] }], R: [2, { R: 1, M: [3, { R: 1 }] }] }] }], A: [1, { f: [6, { AKRUn: 1, M: [2, { A: [3, { A: 1 }], MRjn: 1, s: [4, { "AR^": 1 }] }] }], hw: [6, { AKRU: 1, M: [2, { A: [3, { A: 1 }], MRjn: 1, s: [4, { "AR^": 1 }] }], n: [2, { jn: 1 }] }], j: [2, { j: 1, s: [3, { A: [6, { K: 1 }] }], A: [3, { A: [4, { M: 1 }] }] }], s: 1, n: [2, { "R^n": 1, M: [3, { R: 1 }], s: [3, { "R^": 1, M: [4, { R: 1 }] }] }] }], K: [2, { AK: [1, { s: 1 }], Ms: [1, { fhw: [6, { AR: 1 }], s: 1 }], j: 1, n: [6, { AR: 1, K: [1, { ns: 1 }] }] }], R: [1, { fsw: 1, h: [2, { A: [6, { ARU: 1 }], M: [3, { AR: 1 }], "R^jn": 1, s: [3, { A: [4, { AR: 1 }], "MR^": 1 }] }], j: [2, { A: [3, { A: [6, { U: 1 }], M: [4, { A: 1 }] }], j: 1 }], n: [2, { "R^n": 1, M: [3, { R: 1 }], s: [3, { "R^": 1, M: [4, { R: 1 }] }] }] }], M: [1, { s: [2, { ARjns: 1 }], n: [2, { R: [3, { A: [4, { A: 1 }], M: [6, { A: 1 }], R: [4, { "^": 1 }], "^": 1 }], j: [6, { Un: 1, M: [3, { M: 1 }] }], n: 1, s: [6, { n: 1, R: [3, { R: 1 }] }] }], fhjw: [2, { j: 1 }] }], U: [1, { fhnsw: 1 }], "?": 1, f: [1, { fhsw: 1 }] }], n: [1, { fw: [5, { "?ARUj": 1, ns: [6, { AR: 1 }], M: [2, { j: 1 }] }], h: [5, { "?AUj": 1, R: [2, { A: [6, { A: 1 }], Rjns: 1 }], ns: [6, { AR: 1 }], M: [2, { j: 1 }] }], j: [5, { "?Uj": 1, n: [2, { Rj: 1 }], AMR: [2, { j: 1 }] }], n: [5, { "?Un": 1, s: [2, { A: [6, { M: 1 }], R: [6, { AR: 1 }] }], A: [2, { Rn: 1, Ms: [3, { R: 1 }] }], R: [2, { Rn: 1, s: [3, { R: 1 }] }], j: [2, { Rn: 1 }], M: [6, { M: 1 }] }], s: 1 }], K: [1, { fhw: [5, { "?ARUj": 1, K: [6, { K: [3, { A: [4, { "AK^": 1 }], "KM^": 1 }], A: 1, M: [2, { j: 1 }] }], ns: [6, { A: 1, K: [4, { A: [2, { A: 1 }], K: 1, "^": [2, { K: 1 }] }] }], M: [2, { j: 1 }] }], j: [5, { A: [2, { A: [3, { A: 1 }], K: [4, { K: 1 }], Mj: 1 }], K: [2, { A: [3, { A: [6, { K: 1 }] }], Mj: 1, n: [6, { A: 1, K: [4, { "K^": 1 }] }], s: [3, { M: 1 }] }], MR: [2, { j: 1 }], "?Uj": 1, s: [2, { K: [3, { M: 1 }] }], n: [2, { K: [6, { A: 1, K: [4, { "K^": 1 }] }], "R^": 1 }] }], n: [2, { A: [5, { n: 1 }], K: [5, { j: [3, { AKM: 1 }], n: 1 }], "?RU^n": 1, j: [3, { AM: [5, { K: 1 }], K: [6, { M: 1 }] }], M: [3, { R: 1 }], s: [3, { "R^": 1 }] }], s: 1 }], s: [1, { fw: [6, { ARs: 1, M: [5, { R: 1 }] }], h: [3, { ARs: 1, "^": [2, { "^jns": 1 }] }], j: [5, { AR: [2, { j: 1 }], j: 1, n: [6, { s: 1 }] }], n: [2, { A: [5, { n: 1 }], "R^n": 1, s: [3, { "R^s": 1 }] }], s: 1 }], j: [1, { fw: [6, { ARUjn: 1, M: [5, { A: 1 }] }], h: [2, { A: [6, { ARjn: 1 }], "R^jn": 1, s: [4, { A: [5, { A: 1 }], "R^": 1 }] }], j: [5, { j: 1, s: [6, { A: [2, { A: 1 }], j: 1 }], n: [2, { "R^": 1 }], AR: [2, { j: 1 }] }], n: [2, { A: [5, { n: 1 }], "R^n": 1, s: [3, { "R^": 1 }], j: [5, { jns: 1 }] }], s: 1 }], h: 1 }], "1": [2, { "?": [5, { "$?Ihs": 1, C: [6, { $BCDNV: 1, M: [7, { $: [4, { "?^": 1 }], "?": 1, C: [3, { "?CI^": 1 }], I: [3, { "?C": 1 }], B: [4, { "C^": 1 }] }] }], jn: [6, { "$?CIhjn": 1 }], B: [1, { jn: 1 }] }], B: [3, { "?^": 1, C: [4, { "?": 1, BINn: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }], C: [1, { fhjsw: [5, { CIjs: 1 }], n: [5, { n: 1 }] }], D: [1, { fhjsw: [5, { js: 1 }], n: [5, { n: 1 }] }], M: [6, { "?": 1, C: [1, { fhjsw: [5, { CIjs: 1 }], n: [5, { n: 1 }] }], M: [1, { fhjsw: [5, { C: 1 }] }] }], V: [6, { "?": 1, C: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }], M: [1, { fhjsw: 1 }] }], "^": [1, { fhjsw: [5, { CIs: 1, j: [6, { C: 1 }] }], n: [5, { n: [6, { C: 1 }] }] }] }], I: [4, { "?": 1, CI: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }], M: [1, { fhjsw: [5, { Cs: 1, j: [6, { C: 1 }] }], n: [5, { n: [6, { C: 1 }] }] }], "^": [1, { fhjsw: [5, { CIjs: 1 }], n: [5, { n: 1 }] }], n: [1, { fhjsw: [5, { js: 1 }], n: [5, { n: 1 }] }] }], M: [1, { fhjsw: [5, { $CIs: 1, j: [6, { $CIn: 1 }] }], n: [4, { C: [5, { n: [6, { CIn: 1 }] }], N: [5, { n: 1 }] }] }], BV: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }], N: [6, { "?V": 1, C: [1, { fjsw: [5, { Cjs: 1 }], h: [7, { CIMV: 1 }], n: [5, { n: 1 }] }], I: [5, { I: 1 }], M: [1, { fhjsw: 1 }] }], j: [7, { C: [1, { j: [4, { M: 1 }] }], B: 1 }], n: [4, { M: [1, { fhjsw: [5, { Cs: 1, j: [6, { C: 1 }] }], n: [5, { n: [6, { C: 1 }] }] }], V: 1 }] }], C: [4, { "?": [5, { "$?CIs": 1, j: [6, { "$?CI": 1, B: [1, { j: 1 }], M: [1, { jn: 1 }] }], n: [6, { "$?CIN": 1, B: [1, { j: 1 }], M: [1, { jn: 1 }] }], B: [1, { jn: 1 }], M: [1, { jn: [3, { "?": [7, { C: 1 }], CI: 1 }] }] }], B: [5, { "$?CIs": 1, j: [6, { "$?CIn": 1 }], n: [6, { "$?CINn": 1 }] }], C: [1, { fhsw: [5, { "$?CDIhs": 1, j: [3, { BDNjn: [6, { C: 1 }], C: [6, { CDI: 1 }], I: [6, { CI: 1 }], M: [6, { "?CDI": 1 }] }], n: [6, { "$?CDINhs": 1, j: [7, { $CIV: 1 }], n: [7, { $CIVn: 1 }] }] }], j: [3, { "?": [7, { $BI: 1, C: [6, { C: 1 }] }], B: [5, { Cs: 1, j: [6, { C: 1 }], n: [6, { CNj: 1 }] }], C: [5, { CDIs: 1, j: [6, { CDI: 1 }], n: [6, { CDIN: 1 }] }], D: [5, { Cs: 1, jn: [6, { C: 1 }] }], I: [5, { CIs: 1, j: [6, { CI: 1 }], n: [6, { CIN: 1 }] }], M: [5, { "?CDIs": 1, M: [6, { "?": 1 }], j: [6, { "?CDI": 1 }], n: [6, { "?CDIN": 1 }] }], Njn: [5, { Cs: 1, j: [6, { C: 1 }], n: [6, { CN: 1 }] }], V: [5, { M: [7, { "?": 1 }], j: [6, { "?CIs": 1 }] }], h: [6, { $: 1 }] }], n: [5, { "$?CDIhs": 1, M: [3, { "?": [7, { $: 1 }], M: [6, { "?": 1 }], V: [7, { "?": 1 }] }], j: [3, { BDNjn: [6, { C: 1 }], C: [6, { CDI: 1 }], I: [6, { CI: 1 }], M: [6, { "?CDI": 1 }] }], n: [6, { "$?CDINhs": 1, M: [7, { "?": 1 }], j: [7, { $CIV: 1 }], n: [7, { $CIVn: 1 }] }] }] }], D: [5, { "$?CIs": 1, jn: [6, { "$?CI": 1 }] }], I: [5, { "$?CDIs": 1, j: [6, { "$?CDI": 1, n: [7, { $I: 1 }], j: [7, { CI: 1 }] }], n: [6, { "$?CDINjn": 1 }] }], M: [5, { "$?CDIhs": 1, j: [6, { "$?CDIhs": 1, M: [1, { jn: [7, { "?": 1 }] }], j: [7, { $CI: 1 }], n: [7, { $CIn: 1 }] }], n: [6, { "$?CDINhjs": 1, M: [1, { jn: [7, { "?": 1 }] }], n: [7, { $CIVjn: 1 }] }], M: [1, { jn: [6, { C: [3, { "?": 1 }], "?": 1 }] }] }], N: [5, { "$?CDIs": 1, j: [6, { "$?CDI": 1, n: [7, { $C: 1 }], j: [7, { C: 1 }] }], n: [6, { "$?CDINj": 1, n: [7, { $C: 1 }] }] }], V: [5, { C: [3, { BCDn: 1, j: [1, { fhnsw: 1 }] }], j: [6, { "$?CDIh": 1, j: [7, { C: 1 }], n: [7, { $CIn: 1 }] }], n: [6, { "$?CDINhj": 1, n: [7, { $CIVjn: 1 }] }], "$?DIhs": 1 }], "^": [5, { "$?CDIs": 1, j: [6, { "$?CDIs": 1, M: [1, { jn: [3, { "?": 1 }] }], j: [7, { "$?CIj": 1 }], n: [7, { $CDIn: 1 }] }], n: [6, { "$?CDINs": 1, M: [1, { jn: [3, { "?": 1 }] }], j: [7, { "$?BCIVj": 1 }], n: [7, { $BCDIVjn: 1 }] }], B: [1, { jn: [3, { "?": 1 }] }], M: [1, { jn: [3, { "?": [7, { $C: 1 }], C: [7, { "?": 1 }], "^": [6, { "?": 1 }] }] }] }], h: [5, { Cs: 1, jn: [6, { C: 1 }] }], j: [5, { $CIs: 1, j: [6, { $CIjn: 1 }], n: [6, { $CINjn: 1 }] }], n: [5, { $CIs: 1, j: [6, { $CIn: 1 }], n: [6, { $CINn: 1 }] }], s: [5, { $CIs: 1, j: [6, { $CI: 1 }], n: [6, { $CIN: 1 }] }], w: 1 }], I: [5, { "$?DI": 1, Cs: [3, { "?BCDIMN^jnsw": 1, V: [1, { fhnsw: 1 }] }], j: [6, { $: [3, { "?BCDIMN^jns": 1 }], "?DINjn": 1, C: [3, { "?BCDIMN^jnsw": 1, V: [4, { C: [1, { j: 1 }], "M^": 1 }] }] }], n: [6, { $: [3, { "?BCDIMN^jns": 1 }], "?DINjn": 1, C: [3, { "?BCDIMN^jnsw": 1, V: [1, { fhnsw: 1, j: [7, { $: 1 }] }] }] }] }], V: [3, { "?M": 1, C: [1, { fhsw: [5, { n: [4, { "?BDINjn": 1, CM: [6, { CIj: 1 }], "^": [6, { Cn: 1 }] }], $s: 1 }], j: [4, { "?": [5, { j: 1 }], BNn: [5, { j: [7, { $: 1 }] }], C: [5, { j: [7, { $j: 1 }] }], I: [5, { j: [7, { $C: 1 }] }], M: [5, { j: [7, { $n: 1 }] }], "V^": [5, { j: [6, { n: 1 }] }] }], n: [5, { $: 1, n: [6, { $CDIj: 1, n: [7, { $CDIjn: 1 }] }], s: [4, { "?BCDIMN^jn": 1 }] }] }], D: [5, { jns: 1 }], I: [5, { n: [6, { CIn: 1 }], s: 1, j: [7, { C: [6, { Cn: 1 }], BI: 1 }] }], N: [1, { fhnsw: [5, { ns: 1 }], j: [4, { C: [5, { j: [6, { n: 1 }] }] }] }], j: [5, { j: [7, { $CIVjn: 1 }], ns: 1 }], n: [5, { j: [7, { $BCIn: 1 }], ns: 1 }], "^": [5, { Ins: 1, j: [7, { C: 1 }] }] }], h: [4, { "?CIM^": 1, V: [1, { fhsw: 1, j: [6, { $: 1 }], n: [6, { $M: 1 }] }] }], j: [5, { "$?DIfhsw": 1, C: [3, { "?BCDIMN^fhjns": 1, V: [6, { $BCDIfhs: 1, "?": [7, { $I: 1 }], N: [7, { $CVn: 1, M: [4, { M: 1 }] }], V: [7, { $jn: 1, C: [4, { M: 1 }] }], j: [7, { CIV: 1 }], n: [7, { $BCIn: 1 }], M: [4, { M: 1 }] }] }], jn: [6, { "$?CDIjns": 1, B: [3, { IM: 1 }], V: [3, { "IV^j": 1 }] }], B: [1, { j: [3, { C: [4, { "?": 1 }], n: [4, { M: 1 }] }], n: [3, { C: [4, { "?": 1 }] }] }], M: [1, { j: [3, { C: [4, { "?": [6, { I: 1 }], "CMV^": [6, { "?": 1 }] }], "B^": 1, Mn: [4, { N: 1 }] }], n: [3, { C: [4, { "?": [6, { I: 1 }], "CM^": [6, { "?": 1 }], V: [7, { "?": 1 }] }], "B^": 1, Mn: [4, { N: 1 }] }] }], V: [1, { j: [3, { DMn: 1 }], n: [3, { D: 1 }] }], N: [3, { IM: 1, N: [4, { N: 1 }] }] }], n: [5, { "$?CDINfhsw": 1, j: [6, { "$?CDIVjns": 1, B: [3, { CIM: 1 }] }], n: [6, { "$?CDIVjn": 1, B: [3, { CIM: 1 }] }], M: [1, { j: [3, { C: [4, { "?": [6, { I: 1 }], "CMV^": [6, { "?": 1 }] }] }], n: [3, { C: [4, { "?": [6, { I: 1 }], "CMV^": [6, { "?": 1 }] }], Mn: [4, { N: 1 }], "^": 1 }] }], V: [1, { fhw: [3, { Mn: 1 }], ns: [3, { "M^n": 1 }] }], B: [1, { fhnsw: [3, { n: [4, { M: 1 }] }] }] }], s: [5, { "$?CDINfhjsw": 1, B: [1, { fhnsw: 1, j: [4, { "?": 1, "^": [3, { "?": 1 }] }] }], V: [1, { fhnsw: 1 }], n: [6, { "$?BCDIVjns": 1, M: [1, { fhnsw: 1 }] }], M: [1, { fhsw: 1, j: [3, { C: [4, { "?": [6, { I: 1 }], "CMV^": [6, { "?": 1 }] }] }], n: [7, { "$?BCDIhjns": 1, N: [4, { "C^": 1 }], V: [3, { C: 1 }], M: [6, { M: 1 }] }] }] }], D: [5, { $CIs: 1, jn: [6, { $CIjns: 1, V: [1, { j: 1 }] }], V: [1, { jn: 1 }] }], M: [5, { "$?DIhs": 1, C: [3, { CDINVjn: 1, M: [1, { fhjsw: 1, n: [6, { $CN: 1 }] }], "^": [6, { $CV: 1 }] }], jn: [6, { "$?CDINVhjns": 1 }], B: [1, { jn: [4, { "?": 1 }] }] }], N: [5, { "$?DI": 1, C: [4, { "?BCDIMN^jn": 1, V: [1, { fhnsw: 1, j: [7, { C: 1 }] }] }], j: [6, { "$?DI": 1, C: [4, { "?BCDIMN^jn": 1, V: [7, { $BMNV: 1 }] }], j: [7, { $: 1 }], n: [7, { "$?Cn": 1 }], N: [3, { N: 1 }] }], n: [6, { "$?DIN": 1, C: [4, { "?BCDIMN^jn": 1, V: [1, { fhnsw: 1 }] }], M: [1, { n: [4, { j: 1 }] }], j: [7, { $V: 1 }], n: [7, { "$?CVn": 1, M: [1, { n: 1 }] }] }], s: [4, { "?BCDIMN^jns": 1, V: [1, { fhnsw: 1, j: [7, { $: 1 }] }] }], M: [1, { jn: [6, { "?": 1 }] }] }], fw: 1, "^": [6, { "$?BDfhsw": 1, C: [5, { "?CDIfhjns": 1, V: [1, { n: 1 }] }], I: [5, { "?CIjnsw": 1 }], V: [7, { $BIjn: 1, C: [5, { Ijns: 1 }] }], j: [7, { "$?BCDIVj": 1 }], n: [7, { "$?BCIVjn": 1 }], M: [5, { C: [7, { "?": 1 }], s: 1 }], N: [7, { BCV: 1 }] }] }], "0": [2, { "?": [3, { "?": [5, { "$?CIsw": 1, jn: [6, { "$?CIjnsw": 1 }] }], "BCIMNV^fjns": 1 }], B: [3, { "?NV^n": 1, C: [5, { $CIfjsw: 1, "?": [6, { "?C": 1 }], n: [6, { $BCIVfjnsw: 1, "?": [7, { "?C": 1 }], M: [1, { fhnsw: 1 }] }], M: [1, { fhnsw: 1 }] }], I: [1, { fhjsw: [5, { $Cjs: 1 }], n: [5, { n: 1 }] }], M: [1, { fhsw: [5, { $CIMjs: 1 }], j: [5, { $CIjs: 1 }], n: [5, { n: 1 }] }], B: [4, { C: 1, M: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }] }], j: [4, { Cn: 1 }] }], C: [5, { $CIfhsw: 1, "?": [6, { $: [3, { "?BCIMVs": 1 }], "?I": 1, C: [7, { M: [3, { "?": [4, { C: 1 }], "I^": 1 }], "$?": 1 }] }], j: [6, { $CIfhsw: 1, "?": [3, { "?": [4, { "?CI": 1, M: [7, { $: 1 }] }], BIs: 1, C: [4, { CMVj: 1 }], MV: [7, { "$?": 1 }], "^": [7, { "?C": 1 }] }], B: [1, { j: [3, { "?": 1 }] }], M: [1, { j: 1, n: [4, { "?": 1, "M^": [3, { "?": 1 }], h: [3, { M: 1 }] }] }], V: [1, { j: [3, { "?": 1, C: [4, { "?": 1 }] }] }], j: [7, { $CIn: 1, M: [1, { j: 1 }], j: [3, { BCIM: 1 }] }], n: [7, { "$?CI": 1, M: [1, { jn: 1 }], n: [3, { "BCIM^": 1 }], j: [3, { "I^": 1 }] }] }], n: [6, { $CINfhsw: 1, "?": [7, { "$?I": 1, C: [3, { "?IV^": 1, C: [4, { C: 1 }] }] }], B: [1, { j: [3, { "?": 1 }] }], M: [1, { j: [3, { "?BCIMN^fhjns": 1, V: [4, { C: 1 }] }], n: 1 }], V: [7, { C: [1, { j: [3, { "?": 1 }] }], "?": [1, { j: 1 }], N: 1 }], j: [7, { "$?BCIVn": 1, M: [1, { jn: 1 }], j: [3, { BCIM: 1 }] }], n: [7, { "$?BCIV": 1, M: [1, { jn: 1 }], n: [3, { "BCIM^": 1 }], j: [3, { "BI^": 1 }] }] }], B: [1, { j: [4, { "?BCIMV^js": 1, N: [3, { M: 1 }] }], n: 1 }], M: [1, { j: [3, { "?": [4, { "?": [7, { C: 1 }], "CM^": 1 }], C: [4, { "?": [7, { $: 1 }], "C^": [6, { "?": 1 }] }], "IV^": [6, { "?": 1 }], M: [7, { "?": 1 }], N: [7, { M: 1 }] }], n: [3, { "?": [7, { $: [6, { $B: 1 }], CMV: 1 }], C: [4, { "?": [7, { $: 1 }], "C^": [6, { "?": 1 }] }], IV: [6, { "?": 1 }], M: [7, { "?": 1 }] }] }], V: [1, { jn: [6, { "?": 1 }] }] }], I: [4, { "?N": [5, { $Cs: 1, jn: [6, { $C: 1 }] }], Bjn: 1, C: [3, { "?Nns": 1, B: [5, { $Cs: 1, jn: [6, { $C: 1 }] }], C: [5, { $CIs: 1, jn: [6, { $CI: 1 }] }], I: [7, { $BIVj: 1, C: [6, { B: [5, { Cs: 1 }], CIMV: 1 }], M: [5, { CIjns: 1 }] }], M: [5, { "$?CIfs": 1, j: [6, { "$?CIfn": 1, j: [7, { $C: 1 }], M: [1, { jn: 1 }] }], n: [6, { "$?CIfn": 1, j: [7, { $Cn: 1 }], M: [1, { jn: 1 }] }] }], V: [5, { $: 1, CIs: [1, { fhnsw: 1 }], j: [1, { j: [6, { C: 1 }] }], n: [7, { $I: 1, C: [6, { CI: 1 }] }] }], j: [7, { $MV: 1, C: [5, { Cs: 1, jn: [6, { C: 1 }] }] }] }], IMs: [5, { $CIs: 1, jn: [6, { $CI: 1 }] }], V: [5, { $CIs: 1, jn: [6, { $CINn: 1 }] }], "^": [5, { $CIhs: 1, j: [6, { "$?CIh": 1, M: [1, { j: 1 }], j: [7, { $CI: 1 }], n: [7, { $BCn: 1 }] }], n: [6, { "$?CIh": 1, j: [7, { $CI: 1 }], n: [7, { $BCn: 1 }], M: [1, { jn: 1 }] }], "?": [7, { "$?MV": 1 }], V: [1, { jn: 1 }] }] }], M: [5, { "?": [7, { $BMV: 1, "?": [4, { "?IM^": 1, C: [6, { "?": 1 }] }], C: [4, { "CMV^": 1 }] }], j: [6, { "?": [7, { "$?CI": 1 }], $CINVfhns: 1, j: [7, { "$?BCIjn": 1 }], M: [1, { j: 1, n: [3, { h: 1 }] }] }], n: [6, { "?": [7, { "$?CI": 1 }], $CINVfhns: 1, j: [7, { "$?BCIjn": 1 }], M: [1, { j: [3, { C: 1 }], n: 1 }] }], $Ifhs: 1, C: [6, { "$?BCIMNfhjns": 1, V: [4, { "?BCINV^hjns": 1, M: [1, { fhjns: 1 }] }] }], B: [1, { j: [3, { C: [4, { M: [6, { n: 1 }] }] }], n: [6, { n: 1 }] }] }], j: [5, { $Ifhsw: 1, "?": [3, { "?BINV^fjns": 1, C: [6, { $: [4, { "?BCIMVs": 1 }], C: [7, { "$?": 1, M: [4, { "I^": 1 }] }], "?I": 1 }], M: [6, { "$?CI": 1 }] }], C: [3, { "?BCIMN^fhjnsw": 1, V: [4, { B: [6, { C: 1 }], I: [7, { Mn: 1 }], MV: 1, N: [6, { $BCs: 1 }], j: [6, { $: 1 }] }] }], j: [6, { "$?CIn": 1, j: [7, { "$?CIjn": 1 }], M: [1, { j: 1, n: [3, { I: [7, { C: 1 }] }] }], B: [3, { Mn: 1 }], V: [3, { V: 1 }] }], n: [6, { "$?CI": 1, j: [7, { "$?BCIjn": 1, M: [1, { jn: 1 }] }], n: [4, { "?BI^jn": 1, C: [7, { $CIVn: 1, j: [3, { M: 1 }] }], M: [7, { $jn: 1 }], V: [7, { $C: 1 }] }], M: [1, { j: [3, { CIn: 1 }], n: 1 }], B: [3, { IMn: 1 }], V: [3, { Vn: 1 }] }], M: [1, { j: [3, { "BCIMN^hjn": 1 }], n: [3, { C: [4, { "?": [6, { C: 1 }], CIV: [6, { "?": 1 }], M: [7, { "?": 1 }] }], I: [4, { "^": [7, { C: 1 }] }], "B^hn": 1, M: [4, { h: 1 }], j: [4, { V: 1 }] }] }], B: [1, { j: [3, { C: [4, { "?": 1 }], "BV^": 1, n: [4, { C: 1 }] }], n: [3, { C: [4, { "?": 1 }] }] }], V: [1, { j: [3, { C: [4, { "?": 1 }], "BM^": 1 }], n: [4, { "?": 1 }] }], N: [3, { "IM^": 1 }] }], n: [5, { $CINfhsw: 1, "?": [3, { "?INV^fjns": 1, B: [6, { "?C": 1, $: [4, { M: 1 }] }], C: [7, { "$?BM": 1, C: [4, { IM: 1 }] }], M: [6, { "$?CI": 1 }] }], j: [6, { "$?CIV": 1, j: [7, { "$?BCIjn": 1, M: [1, { jn: 1 }] }], n: [7, { n: [4, { "?CIM^jn": 1 }], "$?CIV": 1, j: [4, { "BM^jn": 1, C: [3, { M: 1 }] }] }], M: [1, { jn: 1 }], B: [3, { CIMn: 1 }] }], n: [6, { "$?CIV": 1, n: [7, { "$?CIV": 1, j: [4, { "BM^j": 1, C: [3, { M: 1 }] }], n: [4, { "CIM^n": 1 }] }], j: [7, { "$?BCIjn": 1, M: [1, { jn: 1 }] }], M: [1, { j: [4, { BC: [3, { C: 1 }], "M^": 1 }], n: 1 }], B: [3, { CIM: 1 }] }], M: [1, { j: [4, { "?Nfjs": 1, Bhn: [3, { C: 1 }], C: [3, { CIMNjn: 1 }], I: [3, { Cj: 1 }], "M^": [3, { CI: 1 }], V: [6, { "?": 1 }] }], n: 1, fhsw: [3, { "B^h": 1, j: [4, { V: 1 }] }] }], B: [1, { fhsw: [3, { "B^": 1, n: [4, { C: 1 }] }], n: [3, { "BV^": 1, n: [4, { C: 1 }] }], j: [3, { V: 1 }] }], V: [6, { C: [1, { fhnsw: [3, { M: 1 }] }], N: 1 }] }], s: [1, { fnsw: 1, h: [4, { "?BCIMNV^fhnsw": 1, j: [6, { "$?BCIMNjn": 1 }] }], j: [5, { "$?CINfhjsw": 1, n: [6, { "$?BCIVjs": 1, n: [7, { $Cjn: 1 }] }], M: [3, { C: [4, { I: [6, { "?": 1 }] }] }] }] }], fw: 1, V: [3, { C: [1, { fhsw: [5, { "$?hs": 1, n: [6, { "$?CIh": 1, j: [7, { $CIj: 1 }], n: [7, { $CIjn: 1 }] }], M: [4, { V: 1 }] }], j: [4, { B: [5, { j: [7, { C: 1 }] }], CIV: [5, { j: [6, { jn: 1 }] }], "M^": [5, { j: [6, { Ij: 1 }] }] }], n: [5, { "$?BMhs": 1, n: [6, { "$?BCIMh": 1, j: [7, { $CIMj: 1 }], n: [7, { $CIjn: 1 }] }] }] }], B: [5, { ns: 1, j: [7, { C: 1 }] }], M: 1, N: [4, { C: [1, { fhnsw: [5, { ns: 1 }], j: [5, { j: [7, { $: 1 }] }] }], I: [5, { ns: 1 }], M: 1 }], V: [5, { Mns: 1, j: [6, { C: 1 }] }], j: [5, { j: [7, { $C: 1 }], ns: 1 }], n: [5, { ns: 1 }], I: [5, { ns: 1, j: [7, { CV: 1 }] }], "^": [5, { $ns: 1, j: [7, { $V: 1 }] }] }], N: [5, { $I: 1, C: [3, { "CM^": 1 }], j: [6, { "$?Ins": 1, C: [3, { "CM^": 1 }], M: [1, { j: 1 }], V: [3, { M: 1 }] }], n: [6, { "$?Ins": 1, C: [3, { "CM^": 1 }], M: [1, { jn: 1 }], V: [3, { M: 1, C: [7, { N: 1 }] }] }], s: [3, { "CIM^": 1, V: [4, { N: 1 }] }], B: [1, { jn: 1 }] }], h: [1, { fhnsw: 1, j: [5, { $Cjs: 1, n: [6, { $C: 1 }] }] }], "^": [1, { fhnsw: 1, j: [5, { "?CIfjs": 1, n: [6, { "?CIfjns": 1 }] }] }] }], "3": [6, { $: [5, { $s: [2, { "?CMNhjns": 1, B: [1, { fhjsw: 1 }], I: [3, { "?BCIM^jn": 1 }], V: [1, { fhnsw: 1 }] }], "?h": 1, C: [2, { "?CIMN^ns": 1, j: [3, { "?BCIMN^jn": 1, V: [4, { MN: 1 }] }], B: [1, { fhjsw: 1 }], V: [3, { M: 1 }] }], I: [2, { "?CIM^jns": 1, B: [1, { fhjsw: 1 }] }], j: [2, { "?CMNhjns": 1, B: [1, { fhjsw: 1 }], I: [3, { "?BCIM^jn": 1 }], V: [1, { j: 1 }] }], n: [2, { "?CIMNhjns": 1, B: [1, { n: 1 }], V: [1, { fhnsw: 1 }] }], M: [1, { j: [2, { C: [3, { "?": 1 }], jn: [3, { CI: 1 }] }], n: [2, { C: [3, { "?": 1 }], j: [3, { I: 1 }], ns: 1 }], fhsw: [2, { s: 1 }] }], B: [1, { j: [2, { C: 1, j: [3, { C: 1 }] }], fhnsw: [2, { s: 1 }] }], V: [1, { j: [2, { j: 1 }], n: [2, { j: [3, { C: 1 }], s: 1 }], fhsw: [2, { s: 1 }] }], N: [2, { ns: 1 }] }], "?": [5, { "?I": 1, j: [2, { "?CIM^jns": 1, B: [4, { "^": 1 }] }], ns: [2, { "?CIM^j": 1, B: [4, { "^": 1 }] }], M: [1, { j: [2, { jn: 1, s: [7, { $: 1 }], C: [4, { C: 1 }] }], n: [2, { jns: 1, C: [3, { C: 1 }] }], fhsw: [2, { s: 1 }] }], C: [2, { "?CIM^jns": 1 }] }], C: [5, { "?": [2, { "?CIM^jns": 1, B: [4, { "^": 1 }] }], C: [2, { "?CIMN^hns": 1, j: [3, { "?BCIMN^hjns": 1, V: [4, { M: 1 }] }], B: [1, { fhjsw: 1 }], V: [3, { M: 1 }] }], j: [2, { "?CMN^hjns": 1, I: [3, { "?BCIMN^jns": 1, V: [1, { jw: 1 }] }], V: [3, { C: [1, { j: [7, { "?": 1 }] }], IM: 1 }], B: [1, { fhjsw: 1 }] }], n: [2, { "?CMN^hjns": 1, I: [3, { "?BCIMN^jns": 1, V: [1, { fhnsw: 1 }] }], V: [1, { fhnsw: 1, j: [3, { M: 1 }] }], B: [1, { n: 1 }] }], s: [1, { fhsw: 1, j: [2, { "?BCMN^jns": 1, I: [3, { "?BCIM^jns": 1 }], V: [3, { M: 1 }] }], n: [2, { "?CIMNV^jns": 1 }] }], M: [1, { j: [2, { C: [3, { "?": 1 }], j: [3, { "CIMN^j": 1 }], n: [4, { "?BINjns": 1, C: [3, { CMNj: 1 }], M: [3, { C: 1 }], "^": [3, { CI: 1 }] }] }], n: [2, { C: [7, { C: [3, { "?": 1 }], "?": 1 }], j: [3, { C: [7, { "?": 1 }], "IV^": 1 }], "V^ns": 1 }], fhsw: [2, { "^s": 1, V: [4, { V: 1 }], n: [3, { "^": 1 }] }] }], I: [2, { "?CIMN^jns": 1, B: [1, { fhjsw: 1 }] }], B: [1, { j: [2, { C: 1, j: [3, { BC: 1 }] }], fhnsw: [2, { s: 1, n: [3, { B: 1 }] }] }], V: [1, { j: [2, { j: [3, { CM: 1 }] }], n: [2, { j: [4, { "?MNVj": 1, "I^": [3, { C: 1 }] }], s: 1, n: [3, { M: 1 }] }], fhsw: [2, { s: 1, n: [3, { M: 1 }] }] }], N: [2, { ns: 1, j: [3, { IM: 1 }] }], h: 1 }], I: [2, { "?I": 1, C: [5, { "?CIjns": 1, B: [1, { j: 1 }] }], j: [5, { "?Ijns": 1, C: [3, { "?BCIM^j": 1 }], B: [1, { j: [3, { C: 1 }] }], M: [1, { j: 1 }], V: [1, { jn: 1 }] }], n: [5, { "?CINjns": 1, M: [1, { j: [4, { "BCIM^j": 1 }], n: 1 }] }], s: [1, { fhnsw: 1, j: [5, { "?CIjns": 1 }] }], B: [3, { CM: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }], "^": 1 }], "M^": [5, { "?CIjns": 1 }], V: [1, { fhnsw: [5, { ns: 1 }], j: [5, { j: 1 }] }], N: [4, { I: 1 }] }], n: [3, { "?Bn": 1, C: [5, { C: [2, { CMjns: 1 }], j: [2, { CMn: 1, V: [1, { j: 1 }] }], ns: [1, { fhnsw: 1, j: [2, { CM: 1 }] }], M: [1, { j: [2, { j: 1, n: [4, { "C^": 1 }] }], n: [2, { ns: 1 }], fhsw: [2, { s: 1 }] }], V: [1, { j: [2, { j: 1 }], n: [2, { js: 1 }], fhsw: [2, { s: 1 }] }], B: [1, { jn: 1 }], I: 1 }], M: [5, { js: [1, { fhjsw: 1, n: [2, { Cn: 1 }] }], n: [2, { CIjns: 1 }], CI: 1 }], V: [5, { C: [2, { Cns: 1 }], jns: 1 }], "^": [5, { "?CIjns": 1 }], I: [5, { C: 1 }] }], B: [2, { "?": [5, { "?Cs": 1 }], C: [5, { CIs: 1, M: [1, { jn: [3, { "?": 1 }] }], jn: [1, { j: 1 }] }], j: [3, { "?B^ns": 1, C: [5, { CI: 1, M: [1, { j: 1, n: [4, { "?": 1 }] }], V: [1, { j: 1 }] }], IM: [5, { CI: 1 }], j: [5, { C: 1 }] }], n: [5, { "?CI": 1, M: [1, { j: [4, { "?BCIM^": 1 }], n: 1 }] }], s: [1, { fhnsw: 1, j: [5, { CI: 1, M: [4, { "?": 1 }] }] }], IM: [5, { CIs: 1 }], B: [1, { fhjsw: [5, { CIjs: 1 }], n: [5, { n: 1 }] }], V: [1, { fhsw: [5, { s: 1 }], j: [3, { C: [5, { jn: 1 }] }], n: [5, { n: [3, { C: 1 }], s: 1 }] }], "^": 1 }], M: [5, { C: [2, { "?CMN^hns": 1, j: [3, { "?BCIMN^hjns": 1, V: [4, { C: [7, { "?": 1 }], M: 1, N: [1, { jw: 1 }] }] }], B: [1, { fhjsw: 1 }], I: [3, { "BCIM^jns": 1, V: [7, { $: 1 }] }], V: [3, { M: 1 }] }], s: [2, { "?CIMN^j": 1, V: [1, { fhnsw: 1 }] }], j: [2, { "?In": [1, { jn: 1 }], C: [1, { j: 1, n: [4, { "?": 1 }] }], MNj: [1, { j: 1 }], "^s": 1 }], n: [1, { j: [2, { "?CI": 1, M: [4, { "C^": 1 }], j: [3, { C: 1 }], N: [4, { CM: 1 }] }], n: 1 }], "?": 1, M: [1, { j: [2, { j: [3, { C: 1 }], n: [4, { "C^": 1 }] }], n: [2, { ns: 1 }], fhsw: [2, { s: 1 }] }], V: [1, { j: [2, { j: 1 }], n: [2, { js: 1 }], fhsw: [2, { s: 1 }] }], N: [2, { ns: 1 }], I: [2, { "IM^jns": 1 }] }], j: [2, { "?I^": 1, j: [3, { "?BI^j": 1, C: [1, { j: 1, n: [5, { CV: 1 }], fhsw: [5, { C: 1 }] }], M: [5, { C: 1 }], V: [5, { jns: 1 }] }], n: [5, { CIjns: 1, M: [1, { j: [7, { $: 1 }], n: 1 }] }], s: [1, { fhnsw: 1, j: [5, { C: 1 }] }], V: [1, { fhsw: [5, { n: [7, { $C: 1 }], s: 1 }], j: [5, { j: 1 }], n: [5, { ns: 1 }] }], B: [1, { fhjsw: [5, { js: 1 }], n: [5, { n: 1 }] }], C: [5, { j: [7, { $C: 1, M: [1, { j: 1 }] }], n: [7, { $C: 1, M: [1, { jn: 1 }] }], Cs: 1, B: [1, { j: 1 }] }], M: [5, { Cjns: 1 }] }], V: [5, { C: [2, { "?CIMN^ns": 1, j: [3, { "?BCIMN^jns": 1, V: [4, { M: 1 }] }], B: [1, { fhjsw: 1 }], V: [3, { M: 1 }] }], Is: 1, j: [2, { C: [1, { j: 1 }], "M^": 1 }], n: [2, { C: [1, { j: [4, { "BCIMV^jns": 1 }] }], "M^": 1 }], M: [1, { j: [2, { j: 1, n: [4, { M: 1 }] }], n: [2, { ns: 1 }], fhsw: [2, { s: 1 }] }], N: [2, { ns: 1 }] }], N: [5, { C: [2, { "CIMN^ns": 1, j: [3, { "CIMN^": 1, V: [7, { C: 1 }] }] }], Ins: 1, j: [2, { IM: 1 }] }], s: [5, { jns: 1, C: [2, { j: [3, { CM: 1 }], CMns: 1 }] }], h: 1 }], "2": [2, { "?": [5, { $: [1, { fhjsw: 1, n: [3, { "?": 1 }] }], "?": [6, { $I: 1, "?": [4, { "?CM": 1, "^": [3, { "?^": 1 }] }], C: [3, { "?": 1 }] }], C: [1, { fhjsw: 1, n: [3, { M: [4, { "?^": 1 }], "^": 1 }] }], I: [1, { fhjsw: 1, n: [3, { M: [7, { $: 1 }] }] }], j: [6, { $: [1, { fhjsw: 1, n: [3, { "?": 1 }] }], "?": [7, { $I: 1, "?": [1, { fhjsw: 1, n: [4, { C: 1 }] }], C: [3, { "?": 1, C: [1, { fhjsw: 1 }] }] }], C: [1, { fhjsw: 1, n: [3, { M: [4, { "^": 1 }], "^": 1 }] }], I: [1, { fhjsw: 1 }], M: [1, { j: [7, { I: 1, C: [4, { C: 1 }] }], n: [7, { I: 1 }] }], V: 1 }], n: [6, { $: [3, { "?^": 1, C: [4, { B: 1 }] }], "?": [7, { $I: 1, "?": [4, { "?CM": 1, "^": [3, { "?^": 1 }] }], C: [3, { "?": 1, C: [1, { n: 1 }] }] }], C: [1, { fhjsw: [3, { M: [4, { "^": 1 }], "^": 1 }], n: 1 }], I: [1, { n: 1 }], M: [1, { j: [7, { I: 1 }], n: [7, { I: 1, C: [4, { C: 1 }] }] }], V: 1 }], s: [1, { fhjsw: 1, n: [3, { "?": [4, { "?": 1, "^": [6, { "?": 1 }] }], M: [6, { C: [4, { "^": 1 }], M: 1 }], I: [6, { M: 1 }], "^": 1 }] }], M: [1, { fhsw: [6, { BI: 1, C: [7, { CN: 1 }] }], jn: [6, { M: 1 }] }], V: 1 }], C: [5, { $CIfhs: 1, j: [6, { $CIfhs: 1, "?": [7, { "?": [4, { B: 1 }], M: [3, { C: [4, { C: 1 }], B: 1 }], B: 1 }], j: [7, { $CIj: 1 }], n: [7, { $CIn: 1 }] }], n: [6, { $CINfhs: 1, "?": [7, { "?": [4, { B: 1 }], M: [3, { C: [4, { C: 1 }], B: 1 }], $: [3, { B: 1 }], B: 1 }], j: [7, { $CIj: 1 }], n: [7, { $CIn: 1 }] }], M: [1, { jn: [3, { "?": [4, { "?": [6, { B: 1 }], C: [6, { I: 1 }], N: [7, { $: 1 }] }] }] }], "?": [6, { "?": [4, { B: 1 }], M: [7, { $I: 1 }], B: 1 }] }], I: [5, { $CIs: 1, jn: [6, { $CINns: 1, M: [1, { jn: [4, { "?": 1 }] }], "?": [7, { M: 1 }] }], "?": [6, { M: 1 }] }], M: [5, { $CIfs: 1, jn: [6, { $CINVfjns: 1, "?": [7, { BM: 1, I: [3, { M: 1 }], "?": [3, { "N^": 1 }], C: [3, { B: 1, M: [4, { N: 1 }] }], $: [4, { "^": 1 }] }], M: [1, { jn: [3, { "?": 1 }] }] }], "?": [6, { BM: 1, "?": [3, { C: [7, { "?": 1 }], "N^": 1 }], C: [3, { M: [4, { C: [7, { N: 1 }], N: 1 }], B: 1, "^": [7, { CMV: 1 }] }], I: [3, { M: 1 }], $: [4, { "^": 1 }] }], BM: [1, { jn: [3, { "?": 1 }] }] }], j: [5, { $Ifhs: 1, "?": [3, { "?": [4, { "?BCIM": 1, "^": [6, { "$?": 1 }] }], C: [6, { M: [7, { $I: 1 }], "?": [7, { "$?": 1 }], B: 1 }], M: [6, { C: [4, { B: 1, M: [7, { N: 1 }], "^": [7, { CMV: 1 }] }], "?": [4, { C: [7, { "?": 1 }], "N^": 1 }], BM: 1, I: [4, { M: 1 }] }], I: [6, { M: 1 }], "B^": 1 }], C: [3, { "?": [1, { fhjsw: 1, n: [4, { "?BCMNV^": 1, I: [6, { CIN: 1 }] }] }], "BCIMN^fhjns": 1, V: [6, { "$?BCIV": 1, N: [7, { $CV: 1, M: [4, { M: 1 }] }], M: [4, { M: 1 }] }] }], M: [3, { "?": [4, { "?V": 1, C: [7, { C: 1, M: [6, { C: 1 }] }], M: [1, { jn: [6, { C: 1 }] }] }], "B^h": 1, M: [1, { jn: [4, { "?": 1 }] }], N: [1, { jn: [7, { "?": 1 }] }] }], jn: [6, { $CIjn: 1 }], B: [3, { "B^": 1, "?": [4, { I: 1 }] }], N: [3, { "BIMN^": 1 }], V: [3, { "?BM^": 1 }] }], n: [5, { $CINfhs: 1, "?": [3, { "?": [4, { "?BCIM": 1, "^": [6, { "$?": 1 }] }], C: [6, { $: [4, { B: 1 }], M: [7, { $I: 1 }], "?": [7, { "$?": 1 }], B: 1 }], M: [6, { C: [4, { B: 1, M: [7, { N: 1 }], "^": [7, { CMV: 1 }] }], "?": [4, { C: [7, { "?": 1 }], "N^": 1 }], BM: 1, I: [4, { M: 1 }] }], I: [6, { M: 1 }], "B^": 1 }], M: [3, { "?": [4, { "?V": 1, C: [7, { C: 1, M: [6, { C: 1 }] }], M: [1, { jn: [6, { C: 1 }] }] }], "B^h": 1, M: [1, { jn: [4, { "?": 1 }] }], N: [1, { jn: [7, { "?": 1 }] }] }], j: [6, { $CIjn: 1 }], n: [6, { $CIn: 1 }], B: [3, { "B^": 1, "?": [4, { I: 1 }] }], V: [3, { "?BM^": 1 }] }], s: [3, { "?": [1, { fhjsw: 1, n: [4, { "?BCMNV^": 1, I: [6, { $CIN: 1 }] }] }], "BCIMNV^fhjns": 1 }], B: [1, { fhjsw: [5, { $CIjs: 1, n: [3, { M: [4, { "?": 1 }], "^": 1 }] }], n: [5, { n: 1, Cjs: [3, { M: [4, { "?": 1 }], "^": 1 }] }] }], N: [5, { $CIs: 1, jn: [6, { $CINjns: 1 }], M: [1, { jn: [7, { "?": 1 }] }] }], V: [5, { $: [4, { "?BCIMN^": 1 }], I: 1, j: [7, { $: [4, { "?BIMN^": 1, C: [6, { $CI: 1 }] }], C: [4, { "?BIMNjns": 1, C: [6, { CI: 1 }], "^": [6, { C: 1 }] }], V: [4, { "?BIM^": 1, C: [3, { MN: 1 }] }], I: [6, { CI: 1 }], "?": 1, B: [4, { BIMs: 1, "C^": [6, { C: 1 }] }], N: [4, { BCIMNn: 1 }], M: [3, { M: 1 }] }], n: [4, { "?BIMNjns": 1, "C^": [6, { $CI: 1 }], V: [7, { "?": 1 }] }], s: [4, { "?BCIMN^jns": 1, V: [1, { fhnsw: 1 }] }], C: [3, { M: 1 }] }], "^fh": 1 }], "7": [2, { "?fh": 1, C: [5, { "$?CIhs": 1, j: [6, { "$?CIhs": 1, BV: [1, { j: 1 }], M: [1, { j: [3, { "?NV^": 1, C: [4, { "?MV^hns": 1 }], I: [4, { IV: 1 }], j: [7, { BC: 1 }], n: [4, { "BCIM^j": 1 }], B: [7, { $j: 1 }], M: [4, { MN: 1 }], h: [4, { h: 1 }] }] }], j: [7, { "$?CIjn": 1, M: [1, { j: 1 }] }], n: [7, { "$?CIj": 1, n: [3, { BCMVn: 1 }], M: [1, { jn: 1 }] }] }], n: [6, { "$?CINhs": 1, BV: [1, { j: 1 }], M: [1, { jn: 1 }], j: [7, { "$?BCIVjn": 1, M: [1, { jn: 1 }] }], n: [7, { "$?CIVjn": 1, M: [1, { jn: 1 }] }] }], B: [1, { jn: [3, { "?BCIM^hjns": 1, V: [6, { n: 1 }] }] }], V: [1, { j: [3, { "?": [6, { C: 1 }], V: [6, { "?": 1 }] }], n: [3, { "?": [7, { M: 1 }] }] }], M: [1, { jn: [3, { V: [7, { "?": 1 }] }] }] }], I: [5, { "$?CIs": 1, jn: [6, { "$?CIjn": 1 }], B: [1, { jn: 1 }], V: [1, { j: 1, n: [7, { C: 1 }] }] }], j: [5, { "$?Ifhs": 1, C: [3, { "?BCIMN^fhjns": 1, V: [4, { "BIM^n": 1, N: [6, { $BCMN: 1, V: [7, { "$?n": 1 }] }], V: [6, { $CM: 1, V: [7, { $: 1 }] }], j: [6, { $BCM: 1, V: [7, { $n: 1 }] }] }] }], j: [6, { "$?CIjn": 1, M: [1, { j: 1 }], V: [3, { "^j": 1 }], B: [3, { I: 1 }] }], n: [6, { "$?CIhj": 1, n: [7, { "$?BCIVjn": 1 }], M: [1, { jn: 1 }], V: [3, { "V^jn": 1 }], B: [3, { Ij: 1 }] }], B: [3, { CV: [1, { jn: 1 }], j: [4, { I: 1 }], n: [4, { Ij: 1 }], "^h": 1 }], M: [3, { C: [1, { j: [4, { "?Vs": 1, B: [6, { Ihj: 1 }], C: [6, { "?BIVhj": 1 }], I: [7, { "?Cn": 1 }], M: [7, { "$?Bjn": 1 }], "^": [6, { "?I": 1 }], h: [6, { C: 1 }], j: [6, { CI: 1 }], n: [7, { CIn: 1 }] }], n: [4, { V: [7, { "?": 1 }] }] }], MNj: [1, { j: 1 }], Vn: [1, { jn: 1 }], "^": 1 }], V: [3, { C: [1, { j: 1 }], M: 1, n: [1, { fhjsw: 1, n: [7, { $C: 1 }] }], N: [4, { M: 1 }], j: [4, { "^": 1 }], "^": [1, { fhjsw: 1, n: [7, { $: 1 }] }] }], N: [3, { M: 1 }] }], n: [5, { "$?CINfhs": 1, j: [6, { "$?CIVhj": 1, n: [7, { "$?BCIVjn": 1 }], B: [3, { CIj: 1 }], M: [1, { jn: 1 }] }], n: [6, { "$?CIVhj": 1, n: [7, { "$?CIVjn": 1 }], M: [1, { jn: 1 }], B: [3, { Ij: 1 }] }], M: [1, { jn: 1, fhsw: [3, { "^": 1 }] }], V: [3, { M: 1, n: [7, { $BC: 1, M: [1, { n: 1 }] }], N: [4, { M: 1 }], j: [4, { "^": 1 }], "^": [7, { $C: 1 }] }], B: [3, { V: [1, { jn: 1 }], jn: [4, { Ij: 1 }], "^h": 1 }] }], s: [7, { "$?BCINVhjns": 1, M: [5, { "?BCIMNhjns": 1, V: [1, { fhjsw: 1 }] }] }], B: [4, { "?BIhns": 1, C: [3, { CINVj: 1, M: [7, { $: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }], "?": 1, C: [1, { fhjsw: [5, { Cs: 1 }] }], BIMVjn: [1, { fhjsw: [5, { C: 1 }] }] }] }], M: [3, { B: [1, { f: 1 }], CIh: 1 }], N: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }], V: [3, { C: [7, { $C: [1, { fhjsw: [5, { Cjs: 1 }], n: [5, { n: 1 }] }], "?": 1 }], Ijn: 1 }], "^": [3, { "C^": 1, I: [5, { $CIs: 1, jn: [6, { $CIjn: 1 }] }] }], j: [3, { CIn: 1 }] }], M: [5, { "$?CIhs": 1, j: [6, { "$?CINVhns": 1, j: [7, { "$?CIjn": 1 }], M: [1, { j: 1 }] }], n: [6, { "$?CINVhns": 1, j: [7, { "$?CIjn": 1 }], M: [1, { jn: 1 }] }], B: [1, { jn: [6, { C: [4, { "?": 1 }], n: 1 }] }], M: [1, { j: [4, { "CM^": 1 }] }] }], V: [3, { C: [5, { $: [1, { fhnsw: 1 }], I: [4, { "?": 1, V: [1, { fhnsw: 1 }] }], j: [1, { fhnsw: [4, { "?": [7, { $C: 1 }], I: [7, { "?": 1 }] }], j: [6, { "$?BIMs": 1, j: [7, { "$?CIjn": 1 }], n: [7, { "$?CIVjn": 1 }] }] }], n: [4, { "?": 1, B: [7, { $Ijn: [1, { fhnsw: 1 }], "?N": 1 }], C: [1, { fhnsw: [6, { CIs: 1 }] }], I: [6, { "?": 1, CIns: [1, { fhnsw: 1 }], j: [7, { "?": 1 }] }], M: [1, { fhsw: [6, { CIs: 1 }], n: [6, { CIMs: 1 }] }], Nhs: [1, { fhnsw: 1 }], V: [1, { fhsw: [6, { "?CIV": 1 }], n: [7, { $CIVjn: 1 }] }], "^": [7, { $: [1, { n: 1 }], "?": 1, j: [1, { fhnsw: 1 }] }], j: [6, { "?": 1, Cj: [1, { fhnsw: 1 }], n: [7, { "?": 1 }], B: [1, { n: 1 }] }], n: [1, { fhnsw: [6, { Cn: 1 }] }] }], s: [1, { fhnsw: 1, j: [4, { "?": 1, I: [7, { "?": 1 }] }] }], "?": [1, { fhnsw: 1, j: [4, { I: 1 }] }], M: [1, { n: 1 }], B: [1, { n: [4, { "M^j": 1 }] }], V: [1, { n: 1, j: [6, { I: 1 }], fhsw: [4, { V: 1 }] }], h: 1 }], BI: [5, { jns: 1 }], M: 1, N: [6, { $: [5, { "$?jns": 1 }], C: [5, { Ins: 1, j: [7, { $BCMN: 1 }], C: [4, { M: 1 }] }], "?I": 1, j: [7, { $I: 1 }], n: [7, { CIj: 1 }] }], V: [5, { $Ijns: 1 }], j: [6, { $: [5, { $Ijns: 1 }], C: [4, { C: [5, { I: 1, ns: [1, { fhnsw: 1 }] }], "^": [5, { n: 1 }], j: 1 }], Ij: 1, n: [7, { $CI: 1 }] }], n: [5, { ns: [1, { fhnsw: 1, j: [6, { C: 1 }] }], j: [4, { Vn: 1 }], $: 1 }], "^": [5, { $jns: 1 }] }], N: [5, { $Cs: 1, j: [6, { $C: 1, M: [1, { j: 1 }], V: [3, { M: 1 }] }], n: [6, { $C: 1, M: [1, { jn: 1 }], V: [3, { M: 1 }] }], V: [1, { j: [4, { C: [3, { C: 1 }], "IMV^": 1 }] }], B: [1, { jn: 1 }] }], "^": [5, { "?BCIMfhjns": 1, V: [1, { fhjsw: 1, n: [7, { $: 1 }] }] }] }], "8": [2, { "?": [3, { "?CIMV^": 1, D: [5, { jns: 1 }] }], j: [5, { "$?DIfhs": 1, C: [3, { "?BCDIM^fhjns": 1, V: [4, { C: [7, { $: [6, { Mn: 1 }], C: [6, { I: 1 }], n: [6, { M: 1 }], "?": 1, B: [1, { h: 1 }], M: [1, { j: 1 }], j: [6, { j: 1 }] }], DIMVjn: 1 }] }], M: [3, { C: [1, { j: 1, n: [7, { C: [6, { "?": 1 }], BD: [4, { n: 1 }], "?": 1 }] }], DM: [1, { j: 1 }], "^hs": 1, j: [1, { j: 1, n: [4, { Is: 1, j: [6, { C: 1 }] }], fhsw: [4, { s: 1 }] }], In: [1, { jn: 1 }] }], V: [3, { C: [1, { j: [6, { $BDIMVjns: 1, C: [7, { I: 1 }] }], n: [6, { $BDIVns: 1, j: [7, { $CDIj: 1 }] }] }], DMn: [1, { jn: 1 }], V: [1, { j: [6, { C: 1 }] }], "^s": 1, j: [4, { s: 1 }] }], j: [6, { $CDIn: 1, M: [3, { Cj: [1, { j: 1 }], "^s": 1 }], j: [7, { $CDIn: 1, j: [3, { j: [4, { BDIMVj: 1 }], BDIMV: 1, C: [1, { jn: 1 }] }], M: [1, { j: 1 }] }], V: [3, { s: 1 }], B: [3, { "M^": 1 }] }], n: [6, { $CDIs: 1, M: [1, { jn: 1, fhsw: [3, { "^s": 1 }] }], j: [7, { j: [3, { j: [4, { BDIMVj: 1 }], BDIMV: 1, C: [1, { jn: 1 }] }], $CDIn: 1, M: [1, { jn: 1 }] }], n: [7, { $CDIn: 1 }], V: [3, { s: 1 }], B: [3, { "M^": 1 }] }], B: [3, { CD: [1, { jn: 1 }], "^n": 1, j: [4, { "M^": 1 }] }] }], n: [5, { "$?CDIfhs": 1, M: [1, { jn: 1, fhsw: [3, { j: [4, { s: 1 }], "^": 1 }] }], j: [6, { $BCDIs: 1, M: [1, { jn: 1, fhsw: [3, { "^s": 1 }] }], j: [7, { j: [3, { j: [4, { BDIMVj: 1 }], BDIMV: 1, C: [1, { jn: 1 }] }], $CDIn: 1, M: [1, { jn: 1 }] }], n: [7, { $CDIn: 1 }], V: [1, { jn: 1 }] }], n: [6, { $BCDIjs: 1, n: [7, { $CDIn: 1 }], MV: [1, { jn: 1 }] }], V: [3, { Mn: [1, { jn: 1 }], V: [1, { n: [6, { C: 1 }] }], "^": 1, j: [4, { s: 1 }] }], B: [3, { "^n": 1, j: [4, { "M^": 1 }] }] }], "^fhs": 1, C: [5, { "$?CDIhs": 1, j: [6, { "$?CDIhs": 1, B: [1, { j: 1 }], M: [1, { j: 1, n: [3, { C: [4, { n: 1 }], D: [7, { n: 1 }] }] }], V: [1, { j: [7, { $BDIMVjns: 1, C: [3, { h: 1 }] }] }], j: [7, { $CDn: 1, M: [1, { j: 1 }], j: [1, { j: 1, n: [4, { Cj: 1 }] }] }], n: [7, { $CDIj: 1, n: [3, { "CV^": 1 }], M: [1, { jn: 1 }] }] }], n: [6, { "$?CDIhs": 1, BV: [1, { j: 1 }], M: [1, { jn: 1 }], n: [7, { MV: [1, { jn: 1 }], $BCDIjn: 1 }], j: [7, { $BCDn: 1, MVj: [1, { jn: 1 }] }] }], B: [1, { j: [3, { "BCDIM^jns": 1, V: [6, { jn: 1 }] }], n: [3, { "BCDIM^jns": 1, V: [6, { n: 1 }] }] }], M: [1, { j: [6, { B: [3, { s: [7, { s: 1 }] }], C: [3, { j: [7, { $: 1 }], V: [7, { C: 1 }], s: [4, { "^": 1 }] }], D: [3, { B: [4, { I: 1 }] }], I: [3, { B: 1, I: [4, { I: 1 }] }], n: [4, { B: 1, "^": [7, { $: 1 }] }], "?": 1, j: [3, { C: [7, { D: 1 }] }] }] }], V: [1, { j: [6, { $: [3, { BCDIMhjns: 1 }], n: [3, { "BCDIM^jns": 1, V: [4, { C: 1 }] }], I: [3, { CDIM: 1 }], Ds: 1 }], n: [6, { $: [3, { BCDIMhjns: 1 }], n: [3, { "BCDI^jns": 1, M: [7, { C: 1 }], V: [4, { C: 1 }] }], I: [3, { CDIM: 1 }], BDs: 1 }] }] }], M: [5, { "$?CDIhs": 1, j: [6, { "$?CDIhns": 1, j: [7, { $BCDIj: 1, M: [1, { j: 1 }] }], M: [1, { j: 1 }], V: [1, { jn: 1 }] }], n: [6, { "$?CDIhns": 1, j: [7, { $BCDIj: 1, M: [1, { jn: 1 }] }], MV: [1, { jn: 1 }] }], M: [1, { j: [6, { $C: 1 }] }], B: [1, { jn: [6, { n: 1 }] }] }], V: [3, { C: [6, { $: [1, { f: [5, { $DIns: 1 }], hsw: [5, { $Ins: 1 }], j: [5, { j: 1 }], n: [5, { $BDIns: 1 }] }], C: [1, { fs: [5, { j: [4, { "?": 1 }], Ins: 1, D: [7, { M: 1 }] }], hw: [5, { j: [4, { "?": 1 }], DIns: 1 }], j: [4, { "?": [7, { $CV: 1 }], V: [7, { h: 1 }] }], n: [5, { j: [4, { "?": 1 }], BIns: 1, D: [7, { MV: 1 }] }] }], D: [1, { fhnsw: [5, { Ins: 1 }], j: [5, { j: 1 }] }], j: [7, { $CDIj: [1, { fhnsw: [5, { ns: 1 }], j: [5, { j: 1 }] }], V: 1 }], n: [5, { j: [1, { j: 1 }], n: [1, { fhsw: [7, { $CDIjns: 1 }], n: 1 }], Ds: [1, { fhnsw: 1 }], I: 1 }], s: [1, { fhnsw: [5, { ns: 1 }], j: [5, { j: 1 }] }], I: [5, { ns: [1, { fhnsw: 1 }], j: [1, { j: 1 }], I: [1, { n: 1 }], "?": 1 }], B: [1, { fhnsw: [5, { Is: 1 }] }], V: [1, { fhsw: [5, { s: 1 }], n: [5, { n: [4, { M: 1 }], s: 1 }] }], M: [1, { fhsw: [5, { s: 1 }], j: [5, { j: 1 }], n: [5, { ns: 1 }] }], "?": 1 }], D: [5, { jns: 1 }], Ijn: [5, { $jns: 1 }], "M^": 1, V: [5, { $jns: 1, C: [7, { C: [1, { hn: 1 }], V: 1 }] }] }], B: [3, { C: [4, { "BCDIM^fhjns": 1, V: [6, { $: [1, { fhjs: 1 }], B: [7, { $: 1 }], C: [5, { C: 1, I: [7, { M: 1 }], j: [1, { fhjsw: 1 }], n: [1, { ns: 1 }], s: [7, { $BDMVj: 1 }] }], DIV: 1, M: [1, { fhjsw: 1 }], j: [5, { Cs: 1, j: [1, { fhjsw: 1 }], n: [1, { ns: 1 }] }], n: [1, { fjs: [5, { js: 1 }], hw: 1, n: [5, { n: 1 }] }], s: [1, { fhns: 1 }] }] }], "DIV^jn": 1, M: [1, { fhjsw: [5, { $CIs: 1, j: [6, { $Cjns: 1 }] }], n: [4, { C: [5, { n: [6, { Cjns: 1 }] }], "^": [5, { n: 1 }] }] }] }], D: [5, { "$?CDIhs": 1, j: [6, { "$?CDIhjns": 1, BMV: [1, { j: 1 }] }], n: [6, { "$?CDIhjns": 1, BV: [1, { j: 1 }], M: [1, { jn: 1 }] }], B: [1, { jn: 1 }], M: [1, { j: 1 }] }], I: [5, { "$?CDIhs": 1, j: [6, { "$?CDIhns": 1, j: [7, { $CDj: 1 }], M: [1, { jn: 1 }] }], n: [6, { "$?CDIhns": 1, j: [7, { $CDj: 1 }] }], BV: [1, { jn: 1 }] }] }], "9": [1, { fhsw: [5, { $CIs: 1, "?": [2, { "?": [4, { "?IMV^": 1, C: [6, { C: 1 }] }], C: [6, { "$?CIV": 1, M: [3, { CM: 1 }] }], "V^s": 1, jn: [6, { $: [4, { "?CIV^": 1 }], "?": [4, { "?IV^": 1, CM: [3, { C: 1 }] }], CV: 1, I: [7, { "$?M": 1 }], M: [7, { $C: 1 }] }], I: [3, { "CIM^": 1, "?": [7, { $C: 1 }] }], M: [6, { $CMV: 1, "?": [4, { "CIMV^": 1 }], I: [7, { "$?M": 1 }] }] }], j: [6, { $CIs: 1, "?": [4, { "?IMV": 1, C: [2, { "?": [3, { C: 1 }], CMV: 1, I: [3, { M: 1 }] }], "^": [7, { "$?CV": 1, I: [2, { C: 1 }] }] }], j: [7, { $CIj: 1 }], M: [2, { "^": 1 }] }], n: [2, { "^ns": 1, j: [3, { j: [4, { j: 1 }], "^": 1 }] }], M: [2, { "^s": 1, j: [3, { "^": 1 }] }], V: [2, { s: 1 }] }], j: [5, { "$?CIjs": 1, n: [6, { "$?CIjns": 1, M: [2, { I: [4, { "?": 1, C: [3, { "?": 1 }], "M^": [7, { "?": 1 }] }], "?": [3, { C: [7, { $: 1 }] }], "^": 1 }] }], M: [2, { I: [4, { "?": 1, C: [3, { "?": 1 }], M: [6, { "?": 1 }] }], "^js": 1, n: [3, { I: [4, { CI: [6, { "?": 1 }] }], "^": 1 }], "?": [3, { C: [6, { "$?": 1 }] }] }], V: [2, { js: 1 }] }], n: [2, { "?": [5, { "$?CIs": 1, j: [6, { "$?CIMVj": 1 }], M: [3, { C: [6, { "$?": 1 }] }] }], C: [5, { "$?CIs": 1, j: [6, { "$?CIMV": 1 }] }], I: [5, { M: [4, { "?": 1, C: [3, { "?": 1 }], M: [6, { "?": 1 }] }], "$?CIjs": 1 }], MV: [5, { "$?CIjs": 1 }], j: [3, { "?": [5, { "$?CIMVj": 1 }], C: [5, { "$?CIMV": 1 }], IMV: 1, "^": [5, { M: 1 }] }], s: [5, { MV: 1 }], "^": [5, { M: 1, j: [6, { M: 1 }] }] }] }], a: 1, "4": [2, { "?": [6, { "$?IMNVjn": 1, C: [5, { "?CIjns": 1 }], B: [5, { "?CIs": 1 }] }], B: [4, { "?Bjn": 1, C: [3, { CIVjn: 1, M: [1, { fhjsw: [5, { CIjs: 1 }], n: [5, { n: 1 }] }] }], I: [3, { BCIj: 1, M: [5, { $C: 1, j: [6, { $: 1 }], s: [6, { C: 1 }] }] }], M: [3, { C: 1, I: [5, { "$?CIjns": 1 }], M: [1, { fsw: 1 }], n: [1, { fj: 1 }] }], N: [5, { $: 1 }], V: [7, { $: [5, { $: 1, C: [1, { fhjsw: 1 }], jns: [6, { $: 1 }] }], BCMV: 1 }], "^": [5, { "$?CIjns": 1 }] }], C: [5, { $: [3, { "?BCIMN^jns": 1, V: [4, { "MNV^jn": 1 }] }], "?": [6, { "$?C": 1, I: [1, { fhnsw: 1 }] }], C: [3, { "?BCIMN^jns": 1, V: [1, { fhnsw: 1, j: [4, { IMNjn: 1 }] }] }], I: [3, { "?BCIM^jn": 1, V: [1, { fhnsw: 1 }] }], j: [6, { $: [3, { "?BCIMN^jns": 1, V: [4, { "MNV^jn": 1 }] }], "?": [3, { "?CIM^": 1, V: [7, { "$?C": 1 }] }], C: [3, { "?BCIMN^jns": 1, V: [4, { C: [1, { j: 1 }], IMNjn: 1 }] }], I: [3, { "?BCIM^jn": 1, V: [1, { j: 1 }] }], BV: [1, { j: [3, { "?": 1 }] }], n: [3, { "CIM^": [7, { $CIn: 1 }], N: 1, V: [4, { N: 1 }], n: [7, { $C: 1 }], B: [4, { M: 1 }] }], j: [3, { M: [7, { $Cjn: 1 }], C: [7, { $CI: 1 }], "?I": 1, "^": [7, { CI: 1 }] }], hs: 1 }], n: [6, { $: [3, { "?BCIMN^jns": 1, V: [4, { "MNV^jn": 1 }] }], "?": [3, { "?CIM^": 1, V: [1, { fhnsw: 1 }] }], C: [3, { "?BCIMN^jns": 1, V: [1, { fhnsw: 1, j: [4, { IMNjn: 1 }] }] }], I: [3, { "?BCIM^jn": 1, V: [1, { fhnsw: 1 }] }], BV: [1, { j: [3, { "?": 1 }] }], N: [3, { "?BCIMN^jn": 1, V: [1, { fhnsw: 1 }] }], n: [3, { CNn: 1, IM: [7, { $CIVn: 1 }], V: [1, { fhnsw: 1 }], B: [4, { M: 1 }], "^": [7, { $BCIVn: 1 }] }], j: [3, { "?CIM^": 1 }], hs: 1 }], s: [3, { "?BCIMN^hjns": 1, V: [1, { fhnsw: 1, j: [4, { C: [7, { "?": 1 }], IMNVjn: 1 }] }] }], B: [1, { jn: [3, { "?": 1 }] }], h: 1 }], I: [4, { "?": [5, { "$?CIs": 1, jn: [6, { "$?CI": 1 }] }], B: [5, { $CIs: 1, jn: [6, { $CI: 1 }] }], C: [3, { "?BINhjn": 1, C: [5, { $CIs: 1, jn: [6, { $CI: 1 }] }], M: [5, { "$?CIs": 1, jn: [6, { "$?CIjn": 1 }] }], V: [1, { fhnsw: [5, { CIs: 1, n: [6, { CI: 1 }] }], j: [5, { j: [6, { CI: 1 }] }] }] }], IV: [5, { $CIs: 1, jn: [6, { $CIn: 1 }] }], M: [5, { "$?CIs": 1, jn: [6, { "$?CIn": 1 }] }], N: [6, { $: [5, { $CIjns: 1 }], "?CINVn": 1, M: [5, { Cs: 1 }], B: [5, { s: 1 }] }], "^": [5, { "$?CIs": 1, jn: [6, { "$?CINjn": 1 }], V: [1, { jn: 1 }] }], jns: 1 }], j: [5, { "$?Ihs": 1, C: [3, { "?BCIMN^hjns": 1, V: [6, { $I: 1, "?": [7, { "$?I": 1 }], B: [7, { CI: 1 }], C: [4, { CIMjn: 1, N: [7, { $V: 1 }] }], M: [4, { C: [7, { "?": 1 }], M: 1 }], N: [7, { $CIVn: 1 }], V: [7, { $Bn: 1, C: [4, { M: 1 }] }], j: [7, { $CVjn: 1 }], n: [7, { BIVn: 1, C: [4, { C: 1 }] }] }] }], j: [6, { "$?CIjn": 1, B: [3, { I: 1 }] }], n: [6, { "$?CIjn": 1, B: [3, { IM: 1 }], V: [3, { Vn: 1 }] }], B: [3, { C: [1, { jn: [6, { "?": 1 }] }], "B^n": 1, j: [4, { I: 1 }] }], M: [3, { I: [1, { j: [4, { "^": 1 }], n: [6, { C: [7, { V: 1 }], I: 1 }] }], N: [1, { jn: [4, { M: 1 }] }], "^": 1 }], V: [3, { C: [1, { j: [4, { "?": 1 }] }], "M^n": 1, V: [4, { "V^": 1 }] }], N: [3, { "IMN^": 1 }] }], n: [5, { "$?CINhs": 1, jn: [6, { "$?BCIVjn": 1 }], M: [3, { I: [1, { j: [4, { M: [6, { C: 1 }] }], n: [6, { C: [4, { M: 1 }], I: 1 }] }], N: [1, { jn: [4, { M: 1 }] }], "^": 1 }], V: [3, { "M^n": 1, V: [4, { "MV^": 1 }] }], B: [3, { "B^n": 1, j: [4, { I: 1 }] }] }], "^hs": 1, M: [5, { "$?CIs": 1, jn: [6, { "$?CINVjns": 1 }], B: [1, { jn: [4, { "?": 1 }] }] }], N: [5, { $CIs: 1, jn: [6, { $CINn: 1 }] }], V: [3, { C: [6, { C: [5, { j: [7, { $: [4, { "?BCIMN^jn": 1 }], C: [4, { "?BCIMN^jns": 1 }], M: [4, { "?": 1 }], B: [4, { "BCIM^": 1 }], N: 1, V: [4, { BCINjn: 1 }], n: [4, { "BCIM^n": 1 }], "?": [4, { CIMn: 1 }], I: [4, { "CIMN^n": 1 }], j: [4, { "CM^": 1 }] }], n: [4, { "?BCIMN^jns": 1, V: [1, { n: 1 }] }], s: [4, { "?BCIMN^jns": 1, V: [1, { fhsw: 1 }] }], h: 1 }], $: [5, { $jns: [4, { "BCIMN^jn": 1 }], "?h": 1 }], j: [4, { BIjn: 1, CM: [5, { jns: 1 }], V: [1, { fhsw: [5, { s: 1 }], j: [5, { j: 1 }], n: [5, { n: 1 }] }] }], n: [4, { "BCIM^n": [5, { jns: 1 }], Nj: 1, V: [1, { fhnsw: [5, { ns: 1 }], j: [5, { j: 1 }] }] }], I: [7, { $: [1, { fhnsw: [5, { ns: 1 }], j: [5, { j: 1 }] }], C: [4, { "CIM^": [5, { jns: 1 }], n: 1 }], IV: [5, { jns: 1 }], M: 1 }], hs: 1, BV: [1, { fhnsw: [5, { s: 1 }] }], "?": [5, { "?jns": 1 }], M: [5, { s: 1 }] }], I: [5, { j: [7, { $C: 1 }], $ns: 1 }], M: 1, N: [6, { C: [7, { M: [5, { Ins: 1 }], $: [5, { jns: 1 }], CN: 1 }], Ij: 1, n: [7, { n: 1 }] }], V: [5, { IVns: 1, j: [6, { C: [7, { $: 1 }], IVn: 1 }] }], j: [5, { j: [7, { $C: 1 }], ns: 1 }], n: [5, { $ns: 1, j: [7, { $C: 1 }] }], "^": [5, { Vns: 1, j: [6, { C: [7, { $: 1 }], V: 1 }] }] }] }], "5": [5, { C: [2, { "?CIM^fhns": 1, V: [4, { "?": 1, C: [3, { C: [6, { "?": 1, M: [7, { "?": 1 }] }], M: 1 }], I: [6, { "?": 1 }], M: [7, { C: [6, { "?": 1 }], "?": 1 }], V: [7, { "?": 1 }], "^": [6, { "?": 1, M: [7, { "?": 1 }] }] }], j: [3, { "?CIM^fhjns": 1, V: [7, { "$?CIVhjns": 1, M: [6, { CMn: 1 }] }] }] }], j: [6, { "$?CIfhs": 1, M: [2, { C: [1, { j: [7, { "$?CIMhjns": 1 }], n: [4, { "?": 1, C: [7, { "?": 1 }], "^": [3, { "?": 1 }] }] }], M: [1, { j: [7, { C: 1 }] }], n: [1, { jn: 1 }], s: 1 }], n: [7, { $CIjn: 1, M: [1, { jn: 1 }] }], V: [2, { M: 1 }], j: [3, { "CM^n": 1 }] }], n: [6, { "$?CIfhs": 1, M: [2, { C: [1, { jn: [7, { "$?CIMhjns": 1 }] }], M: [1, { jn: [7, { C: 1 }] }], jn: [1, { jn: 1 }], s: [1, { fhnsw: 1 }], V: 1 }], n: [7, { $CIjn: 1, M: [1, { jn: 1 }] }], V: [2, { M: 1 }], j: [3, { "CM^n": 1 }] }], "$?Ifhs": 1, M: [2, { j: [1, { j: [6, { $: [3, { C: 1 }], "?CIfhjns": 1, M: [7, { C: 1 }] }], n: [3, { C: [4, { M: [6, { "?": 1 }] }], n: 1 }] }], n: [1, { j: [6, { $: [3, { C: 1 }], "?CIfhjns": 1, M: [7, { C: 1 }] }], n: [6, { "$?CIfhjns": 1, M: [7, { C: 1 }] }] }], s: [1, { fhnsw: 1, j: [7, { "?": 1 }] }], V: 1 }], V: [1, { fhnsw: [2, { s: 1, n: [3, { M: 1 }] }], j: [2, { j: [3, { M: 1 }] }] }] }], "6": [2, { "?fhw": 1, j: [5, { "$?Ifhsw": 1, C: [3, { "?BCIM^fjns": 1, V: [4, { "BMV^jn": 1, C: [7, { C: [6, { "?": 1 }], "?": 1 }] }] }], M: [1, { j: 1, n: [6, { C: [3, { C: [4, { "?": 1 }], "^": 1 }], M: [3, { M: 1 }], "?": 1, n: [4, { C: 1 }] }], fhsw: [3, { "^": 1 }] }], V: [1, { j: [3, { "CM^": 1 }], n: [6, { C: [3, { C: [7, { "?": 1 }], M: 1 }], n: [4, { BIn: 1, CM: [3, { C: 1 }] }], I: [4, { IM: 1 }], j: 1, s: [7, { $: 1 }] }], f: [3, { "^": 1 }] }], n: [6, { $CIjn: 1, M: [1, { jn: 1 }] }], B: [3, { CV: [1, { jn: 1 }], "B^": 1, n: [4, { C: 1 }] }], j: [4, { "BCMV^jn": 1 }] }], n: [5, { "$?CIfhsw": 1, M: [1, { jn: 1, fhsw: [3, { "^": 1 }] }], jn: [6, { $CIVjn: 1, M: [1, { jn: 1 }], B: [3, { C: 1 }] }], B: [3, { "B^": 1, V: [1, { jn: 1 }], n: [4, { C: 1 }] }], V: [1, { fs: [3, { "^": 1 }], jn: [3, { "M^": 1 }], w: [3, { M: 1 }] }] }], s: [5, { "$?BCIMfhjnsw": 1, V: [7, { "$?BCIhjn": 1, M: [1, { fhsw: 1 }], V: [4, { "BCIM^n": 1 }] }] }], C: [5, { "$?CIhs": 1, j: [6, { "$?CIhs": 1, BV: [1, { j: 1 }], M: [1, { j: 1, n: [7, { n: [3, { B: 1 }], "?": 1 }] }], n: [7, { $CIn: 1, M: [1, { jn: 1 }] }], j: [3, { Mn: 1 }] }], n: [6, { "$?CIhjs": 1, BV: [1, { j: 1 }], M: [1, { jn: 1 }], n: [7, { $BCIVn: 1, M: [1, { jn: 1 }] }] }], B: [1, { jn: 1 }], V: [1, { jn: [7, { "?": 1 }] }] }], M: [5, { "$?CIsw": 1, j: [6, { "$?CIVjnw": 1, M: [1, { j: 1, n: [3, { C: [4, { V: 1 }], M: 1 }] }] }], n: [6, { "$?CIVjnw": 1, M: [1, { jn: 1 }] }], B: [1, { jn: [4, { "BCIM^jn": 1 }] }], M: [1, { j: [7, { C: 1 }] }] }], V: [3, { C: [1, { fhsw: [5, { $Is: 1, j: [4, { "?": 1 }], n: [6, { $CIjs: 1, n: [7, { $CIjn: 1 }] }], V: [4, { V: 1 }] }], j: [4, { "?": [6, { $Cn: 1 }], B: [5, { j: [7, { C: 1 }] }], "C^": [7, { "?": 1 }], IM: [5, { j: [6, { Ijn: 1 }] }], V: [5, { j: 1 }], n: [5, { j: [6, { n: 1 }] }] }], n: [5, { $BIVs: 1, j: [4, { "?": 1 }], n: [7, { "$?CIMVj": 1, B: [6, { CI: 1 }], n: [6, { Cjn: 1 }] }] }] }], BIjn: [5, { jns: 1 }], M: 1, V: [6, { $Cn: 1 }], "^": [5, { $jns: 1 }] }], B: [4, { Bjs: 1, C: [3, { BCIVn: 1, M: [6, { $IMjn: 1, B: [1, { fhjsw: 1, n: [7, { C: 1 }] }], C: [5, { C: [7, { $BCIMn: 1 }], Ijns: 1 }], V: [7, { $Ijs: 1, C: [5, { C: 1 }] }] }] }], I: [5, { $Cjns: 1 }], M: [5, { $CIVjns: 1 }], V: [3, { C: [6, { $: [5, { Ij: 1 }], B: [1, { fjs: 1 }], C: [1, { f: [7, { $CMVs: 1 }], h: [7, { $BCMs: 1 }], j: [7, { BCMVs: 1 }], n: [7, { BCs: 1 }], sw: [5, { Cjs: 1 }] }], MV: [1, { fhjsw: 1 }], s: 1, I: [7, { $B: 1, C: [1, { hw: 1 }] }], n: [5, { j: 1, s: [7, { C: 1 }] }] }], In: 1 }], "^n": [5, { $CIjns: 1 }] }], I: [5, { "$?CIs": 1, jn: [6, { "$?CIjn": 1 }], BV: [1, { jn: 1 }] }], "^": [5, { "?BCIMfjns": 1, V: [1, { fhsw: 1 }] }] }] }],
  fold: [{ name: "anusvara", step: "anusvara", blocks: [2304, 2432, 2560, 2688, 2816, 3072, 3200, 3328], virama: 77, anusvara: 2, rows: [[25, 21, 24], [30, 26, 29], [35, 31, 34], [40, 36, 39], [46, 42, 45]] }, { name: "ar-letters", step: "map", map: { ي: "ی", ى: "ی", ك: "ک", ه: "ہ", ە: "ہ" } }, { name: "nukta", step: "map", map: { "़": "", "়": "", "਼": "", "઼": "", "଼": "", "஼": "", "఼": "", "಼": "", "഼": "" } }, { name: "chandrabindu", step: "map", map: { "ँ": "ं", "ঁ": "ং", "ਁ": "ਂ", "ઁ": "ં", "ଁ": "ଂ", "஁": "ஂ", "ఁ": "ం", "ಁ": "ಂ", "ഁ": "ം" } }, { name: "as-bn", step: "map", map: { ৰ: "র", ৱ: "ব" } }, { name: "joiners", step: "map", map: { "‌": "", "‍": "" }, after: [[2304, 3583], [1536, 1791], [7248, 7295], [43968, 44031]] }, { name: "or-wa", step: "map", map: { ଵ: "ୱ" } }, { name: "ar-harakat", step: "map", map: { "ً": "", "ٌ": "", "ٍ": "", "َ": "", "ُ": "", "ِ": "", "ّ": "", "ْ": "", "ٰ": "" }, langs: ["ur"] }, { name: "ml-chillu", step: "map", map: { ൺ: "ണ്", ൻ: "ന്", ർ: "ര്", ൽ: "ല്", ൾ: "ള്", ൿ: "ക്" }, before: [[3328, 3455]] }]
};

// js/normalize.ts
var DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
var cp = (s) => s.codePointAt(0);
function fromCodePoints(cps) {
  let s = "";
  for (let i = 0;i < cps.length; i += 8192)
    s += String.fromCodePoint(...cps.slice(i, i + 8192));
  return s;
}
function compile(r) {
  const invisible = new Map;
  for (const [c, sym2] of Object.entries(r.invisible))
    invisible.set(cp(c), sym2);
  const [LEFT, RIGHT] = r.width;
  const scripts = r.scripts.map(([, ranges], i) => [DIGITS[i], ranges]);
  const classes = new Map;
  for (const [lo, hi, k] of r.classes)
    for (let o = lo;o <= hi; o++)
      classes.set(o, k);
  function scriptOf(c) {
    for (const [d, ranges] of scripts)
      for (const [lo, hi] of ranges)
        if (c >= lo && c <= hi)
          return d;
    return;
  }
  function sym(c) {
    return invisible.get(c) ?? classes.get(c) ?? (scriptOf(c) !== undefined ? "?" : undefined);
  }
  function node(t) {
    if (typeof t === "number")
      return t;
    const kids = new Map;
    for (const [values, child] of Object.entries(t[1])) {
      const n = node(child);
      for (const v of values)
        kids.set(v, n);
    }
    return { f: t[0], kids };
  }
  const tree = node(r.tree);
  function deletes(before, c, after) {
    const nearLeft = [...before].reverse().find((x2) => !invisible.has(x2));
    const nearRight = after.find((x2) => !invisible.has(x2));
    let script;
    for (const x2 of [nearLeft, nearRight])
      if (x2 !== undefined && (script = scriptOf(x2)) !== undefined)
        break;
    if (script === undefined)
      return false;
    const x = [script, invisible.get(c)];
    const left = [];
    for (let i = before.length - 1;i >= 0; i--) {
      const s = sym(before[i]);
      if (s === undefined)
        break;
      left.push(s);
    }
    const right = [];
    for (const a of after) {
      const s = sym(a);
      if (s === undefined)
        break;
      right.push(s);
    }
    for (let i = 0;i < LEFT; i++)
      x.push(left[i] ?? "^");
    for (let i = 0;i < RIGHT; i++)
      x.push(right[i] ?? "$");
    let n = tree;
    while (typeof n !== "number")
      n = n.kids.get(x[n.f]) ?? 0;
    return n === 1;
  }
  const chillu = new Map;
  for (const [from, to] of Object.entries(r.chillu.map))
    chillu.set(cp(from), cp(to));
  const ch = { virama: cp(r.chillu.virama), joiner: cp(r.chillu.joiner), notBefore: cp(r.chillu.not_before) };
  const ra = { virama: cp(r.ra.virama), assamese: cp(r.ra.assamese), bengali: cp(r.ra.bengali) };
  const khanda = { from: Array.from(r.khanda_ta.from, cp), to: cp(r.khanda_ta.to), notBefore: r.khanda_ta.not_before };
  function onePass(text, lang) {
    let s = Array.from(text.normalize("NFC"), cp);
    let out = [];
    for (let i = 0;i < s.length; i++) {
      const to = chillu.get(s[i]);
      if (to !== undefined && (i === 0 || s[i - 1] !== ch.virama) && s[i + 1] === ch.virama && s[i + 2] === ch.joiner && s[i + 3] !== ch.notBefore) {
        out.push(to);
        i += 2;
      } else
        out.push(s[i]);
    }
    const [own, other] = r.ra.assamese_langs.includes(lang ?? "") ? [ra.assamese, ra.bengali] : [ra.bengali, ra.assamese];
    s = out;
    out = [];
    for (let i = 0;i < s.length; i++) {
      if (s[i] === ra.virama && s[i + 1] === other) {
        out.push(ra.virama, own);
        i++;
      } else
        out.push(s[i]);
    }
    s = out;
    out = [];
    const k = khanda.from.length;
    for (let i = 0;i < s.length; i++) {
      const next = s[i + k];
      if (khanda.from.every((c, j) => s[i + j] === c) && !(next !== undefined && khanda.notBefore.some(([lo, hi]) => next >= lo && next <= hi))) {
        out.push(khanda.to);
        i += k - 1;
      } else
        out.push(s[i]);
    }
    s = out;
    out = [];
    for (let i = 0;i < s.length; i++) {
      if (invisible.has(s[i]) && deletes(out.slice(-LEFT), s[i], s.slice(i + 1, i + 1 + RIGHT)))
        continue;
      out.push(s[i]);
    }
    return fromCodePoints(out).normalize("NFC");
  }
  function fixed(pass, text, lang) {
    let s = text;
    for (let i = 0;i < r.max_passes; i++) {
      const t = pass(s, lang);
      if (t === s)
        break;
      s = t;
    }
    return s;
  }
  const inRanges = (c, rs) => c !== undefined && rs.some(([lo, hi]) => c >= lo && c <= hi);
  const steps = r.fold.map((st) => {
    const run = (step) => (s, lang) => st.langs && !st.langs.includes(lang ?? "") ? s : step(s);
    if (st.step === "map") {
      const m = new Map;
      for (const [from, to] of Object.entries(st.map))
        m.set(cp(from), to);
      const { before, after } = st;
      const ok = (s, i) => (!before || inRanges(s[i + 1], before)) && (!after || inRanges(i > 0 ? s[i - 1] : undefined, after));
      return run((s) => Array.from(s.map((c, i) => {
        const to = m.get(c);
        return to !== undefined && ok(s, i) ? to : String.fromCodePoint(c);
      }).join(""), cp));
    }
    return run((s) => {
      const out = [];
      for (let i = 0;i < s.length; i++) {
        const b = st.blocks.find((b2) => s[i] >= b2 && s[i] < b2 + 128);
        if (b !== undefined && i + 2 < s.length && s[i + 1] === b + st.virama && st.rows.some(([n, lo, hi]) => s[i] === b + n && s[i + 2] >= b + lo && s[i + 2] <= b + hi)) {
          out.push(b + st.anusvara);
          i++;
        } else
          out.push(s[i]);
      }
      return out;
    });
  });
  const normalize = (text, lang) => fixed(onePass, text, lang);
  const foldPass = (text, lang) => {
    let s = Array.from(normalize(text, lang), cp);
    for (const step of steps)
      s = step(s, lang);
    return fromCodePoints(s);
  };
  return { normalize, fold: (text, lang) => fixed(foldPass, text, lang) };
}
var engine = compile(rules_default2);
var RULES_VERSION = rules_default2.version;
function normalize(text, lang) {
  return engine.normalize(text, langCode(lang));
}
function fold(text, lang) {
  return engine.fold(text, langCode(lang));
}

// js/deromanize.ts
var RULES = rules_default;
var RULES_VERSION2 = RULES.rules_version;
var familiesOf = (mode) => mode === "names" ? ["names", "words"] : ["words"];
function languages(mode = "words") {
  const out = new Set;
  for (const f of familiesOf(mode))
    for (const l of Object.keys(RULES.families[f]))
      out.add(l);
  return [...out].sort();
}
var CDN = `https://cdn.jsdelivr.net/gh/micahchoo/indickit@v${version}/deromanize/lang/`;
async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`deromanize: ${url}: ${res.status}`);
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
function clean(s) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z]/g, "");
}
var isLatin = (ch) => {
  const cp2 = ch.codePointAt(0);
  return clean(ch) !== "" || cp2 >= 768 && cp2 <= 879;
};
var fileCache = new Map;
var pooledCache = new Map;
async function load(lang, mode = "words", opts = {}) {
  const c = code(lang);
  const fams = familiesOf(mode).filter((f) => RULES.families[f][c]);
  if (fams.length === 0)
    throw new Error(`deromanize: no ${mode} tables for "${lang}"`);
  const base = new URL(opts.base ?? "../deromanize/lang/", import.meta.url);
  const get = opts.fetch ?? (opts.base ? fetchBytes : defaultFetcher(base));
  const once = (path) => {
    const k = `${base}${path}`;
    if (!fileCache.has(k))
      fileCache.set(k, get(new URL(path, base)));
    return fileCache.get(k);
  };
  const files = {};
  const want = [];
  for (const f of fams) {
    const l = RULES.families[f][c];
    want.push(`${l.group}/${l.pooled}`, `${c}/${l.file}`);
  }
  const lists = RULES.lists[c] ?? {};
  for (const k of mode === "names" ? ["words", "names"] : ["words"]) {
    if (lists[k])
      want.push(`${c}/${lists[k]}`);
  }
  const got = await Promise.all(want.map(once));
  want.forEach((p, i) => files[p.slice(p.indexOf("/") + 1)] = new Uint8Array(got[i]));
  return fromBytes(c, mode, files);
}
function fromBytes(lang, mode, files) {
  const mixes = [];
  for (const f of familiesOf(mode)) {
    const l = RULES.families[f][lang];
    if (!l)
      continue;
    let pool = pooledCache.get(l.pooled);
    if (!pool) {
      const r = new Reader(files[l.pooled], "IKD1");
      pool = new Model(r, readStrings(r), new Interner);
      pooledCache.set(l.pooled, pool);
    }
    mixes.push(new Mix(files[l.file], pool, l.tag, l.group));
  }
  if (mixes.length === 0)
    throw new Error(`deromanize: no ${mode} tables for "${lang}"`);
  const counts = new Map;
  const lists = RULES.lists[lang] ?? {};
  for (const k of mode === "names" ? ["words", "names"] : ["words"]) {
    const name = lists[k];
    if (name && files[name])
      readList(files[name], counts);
  }
  const alpha = RULES.alpha[mode];
  const word = (latin, n = 4) => {
    const w = clean(latin);
    if (w === "")
      return [];
    const merged = new Map;
    for (const x of mixes) {
      for (const [o, s] of x.decode(w)) {
        const d = deunify(o, lang);
        const v = merged.get(d);
        if (v === undefined || s > v)
          merged.set(d, s);
      }
    }
    const best = [...merged].sort(byScore);
    const known = [];
    const rest = [];
    for (const [o, s] of best) {
      const c = counts.get(fold(normalize(o, lang), lang));
      if (c === undefined)
        rest.push(o);
      else
        known.push([o, s + alpha * Math.log(c)]);
    }
    return [...known.sort(byScore).map((e) => e[0]), ...rest].slice(0, n);
  };
  return {
    lang,
    mode,
    word,
    text(t) {
      const cs = [...t];
      let out = "";
      for (let i = 0;i < cs.length; ) {
        if (!isLatin(cs[i])) {
          out += cs[i++];
          continue;
        }
        let j = i;
        while (j < cs.length && isLatin(cs[j]))
          j++;
        const run = cs.slice(i, j).join("");
        out += word(run, 1)[0] ?? run;
        i = j;
      }
      return out;
    }
  };
}
var byScore = (p, q) => p[1] !== q[1] ? q[1] - p[1] : p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0;
function deunify(w, lang) {
  const base = RULES.blocks[lang];
  if (base === undefined)
    return w;
  let out = "";
  for (const ch of w) {
    const cp2 = ch.codePointAt(0);
    out += cp2 >= 2304 && cp2 <= 2431 ? String.fromCodePoint(base + (cp2 & 127)) : ch;
  }
  return out;
}
function groupOf(cp2) {
  for (const [g, ranges] of Object.entries(RULES.groups)) {
    for (const [lo, hi] of ranges)
      if (cp2 >= lo && cp2 <= hi)
        return g;
  }
  return "";
}

class Reader {
  b;
  pos = 4;
  constructor(b, magic) {
    this.b = b;
    for (let i = 0;i < 4; i++)
      if (b[i] !== magic.charCodeAt(i))
        throw new Error(`deromanize: not an ${magic} file`);
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
function readStrings(r) {
  const strs = [];
  for (let i = r.varint();i > 0; i--)
    strs.push(r.str());
  return strs;
}
function readList(b, counts) {
  const r = new Reader(b, "IKL2");
  let prev = new Uint8Array(0);
  for (let n = r.varint();n > 0; n--) {
    const shared = r.varint();
    const len = r.varint();
    const key = new Uint8Array(shared + len);
    key.set(prev.subarray(0, shared));
    key.set(b.subarray(r.pos, r.pos + len), shared);
    r.pos += len;
    prev = key;
    const k = DECODER.decode(key);
    counts.set(k, (counts.get(k) ?? 0) + r.varint());
  }
}
var ID = 2 ** 21;
function ctxKey(ctx, from) {
  let k = 0;
  for (let i = from;i < ctx.length; i++)
    k = k * ID + (ctx[i] + 1);
  return k;
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

class Model {
  ids;
  vocab;
  levels = [];
  toks = [];
  constructor(r, strs, ids) {
    this.ids = ids;
    this.vocab = r.varint();
    for (let l = r.varint();l > 0; l--) {
      const lv = { stats: new Map, counts: new Map };
      for (let c = r.varint();c > 0; c--) {
        const ctx = [];
        for (let i = r.varint();i > 0; i--)
          ctx.push(ids.id(strs[r.varint()]));
        const key = ctxKey(ctx, 0);
        const total = r.varint();
        const types = r.varint();
        const counts = new Map;
        let prev = 0;
        for (let t = r.varint();t > 0; t--) {
          prev += r.varint();
          const tok = ids.id(strs[prev]);
          counts.set(tok, r.varint());
          if (this.levels.length === 0)
            this.toks.push(tok);
        }
        lv.stats.set(key, [total, types]);
        lv.counts.set(key, counts);
      }
      this.levels.push(lv);
    }
    if (ids.strs.length >= ID)
      throw new Error("deromanize: beyond the engine's limits");
  }
  stats(ctx) {
    const s = { has: [], counts: [], total: [], wb: [] };
    for (let n = 0;n < this.levels.length; n++) {
      const key = ctxKey(ctx, ctx.length - n);
      const st = this.levels[n].stats.get(key);
      if (st) {
        s.has[n] = true;
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
      if (!s.has[n])
        continue;
      const lam = s.wb[n];
      p = lam * (s.counts[n]?.get(tok) ?? 0) / s.total[n] + (1 - lam) * p;
    }
    return p;
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
  b;
  a;
  lam;
  start = [];
  eos;
  options = new Map;
  constructor(own, b, tag, group) {
    this.b = b;
    const ids = b.ids;
    const r = new Reader(own, "IKD1");
    const strs = readStrings(r);
    this.lam = r.float64();
    this.a = new Model(r, strs, ids);
    for (let i = 0;i < RULES.order - 2; i++)
      this.start.push(ids.id(RULES.bos));
    this.start.push(ids.id(`<s:${tag}>`));
    this.eos = ids.id(RULES.eos);
    for (const t of b.toks) {
      const s = ids.strs[t];
      const i = s.indexOf("|");
      if (i < 0)
        continue;
      const native = s.slice(i + 1);
      let ok = true;
      for (const ch of native) {
        const g = groupOf(ch.codePointAt(0));
        if (g !== "" && g !== group) {
          ok = false;
          break;
        }
      }
      if (!ok)
        continue;
      const chunk = s.slice(0, i);
      const list = this.options.get(chunk) ?? [];
      list.push({ tok: t, native });
      this.options.set(chunk, list);
    }
    for (const list of this.options.values())
      list.sort((p, q) => p.native < q.native ? -1 : p.native > q.native ? 1 : 0);
  }
  logp(sa, sb, tok) {
    return Math.log(this.lam * this.a.prob(sa, tok) + (1 - this.lam) * this.b.prob(sb, tok));
  }
  decode(word) {
    const w = [...word];
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
      for (const c of top(beams[i], RULES.beam)) {
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
            next.push({ score: hy.score + this.logp(sa, sb, o.tok), out: hy.out + o.native, parent: hy, tok: o.tok, idx: next.length });
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
    return [...final].sort(byScore).slice(0, RULES.nbest);
  }
}
export {
  load,
  languages,
  fromBytes,
  clean,
  RULES_VERSION2 as RULES_VERSION,
  CDN
};
