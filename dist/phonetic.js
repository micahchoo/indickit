// phonetic/rules.json
var rules_default = {
  version: "2026-10-07",
  folds: [
    "bn-case",
    "brahmic-av-u",
    "drop-vowels",
    "drop-y",
    "flap-r",
    "gu-case",
    "latin-ngh",
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
    candrabindu_class: "ṁ",
    nukta_offset: 60,
    flap_offsets: [
      33,
      34
    ],
    flap_class: "ṛ"
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
    ൖ: "l",
    ड़: "ṛ",
    ढ़: "ṛ",
    ড়: "ṛ",
    ঢ়: "ṛ",
    ଡ଼: "ṛ",
    ଢ଼: "ṛ",
    ੜ: "ṛ"
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
      ڑ: "ṛ",
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
      ڙ: "ṛ",
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
      ᱲ: "ṛ",
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
        "ngh",
        "nĝ"
      ],
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
    ĝ: "k",
    ṁ: "n",
    ṅ: "n",
    ṇ: "n",
    ṛ: "t",
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
      from: 2304,
      to: 3455,
      class: "v",
      also: "u",
      after: "aṁ",
      not_before: "aieo"
    },
    {
      from: 1536,
      to: 7295,
      class: "ṛ",
      also: "r"
    },
    {
      from: 0,
      to: 127,
      class: "ĝ",
      also: "h"
    },
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
  joined: {
    min_classes: 8,
    when: "the strict keys find nobody"
  },
  digit_zeros: [
    48,
    1632,
    1776,
    2406,
    2534,
    2662,
    2790,
    2918,
    3046,
    3174,
    3302,
    3430,
    7248,
    44016
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
function isMn(cp) {
  const p = prop.get(cp);
  return p === undefined ? /\p{Mn}/u.test(ch(cp)) : (p & MN) !== 0;
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

// js/phonetic.ts
var DELETED = "\x00";
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
    let last = -1;
    for (let i = 0;i < word.length; i++) {
      const ch2 = word[i];
      const x = extra.get(ch2);
      if (x !== undefined) {
        out += x;
        last = -1;
        continue;
      }
      const o = word.charCodeAt(i);
      if (o < b.from || o > b.to)
        continue;
      const off = o & 127;
      const c = byOffset[off];
      if (off === b.nukta_offset && b.flap_offsets.includes(last) && out) {
        out = out.slice(0, -1) + b.flap_class;
      } else if (off === b.virama_offset) {} else if (off === b.candrabindu_offset) {
        out += b.candrabindu_class;
      } else if (c !== undefined) {
        out += c;
      }
      if (c !== undefined)
        last = off;
      else if (off !== b.nukta_offset && off !== b.virama_offset)
        last = -1;
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
        const ch2 = word.charCodeAt(i);
        if (ch2 === 99) {
          const next = word[i + 1];
          out += next === "e" || next === "i" || next === "y" ? "s" : "k";
        } else if (ch2 === 119 && i > 0 && !wUnlessNext.includes(word[i + 1] ?? " ")) {
          out += "w";
        } else {
          out += latin[ch2] ?? "";
        }
        i++;
      }
    return out;
  }
  function readUrdu(word) {
    let out = word[0] === u.ain ? "a" : "";
    for (let i = 0;i < word.length; i++) {
      const ch2 = word[i];
      if (ch2 === u.waw && i > 0 && !(i + 1 < word.length && u.waw_v_before.includes(word[i + 1])))
        out += "w";
      else
        out += urdu.get(ch2) ?? "";
    }
    const n = word.length;
    if (n > 1 && u.final_he.includes(word[n - 1]) && !u.final_he_h_after.includes(word[n - 2])) {
      out = out.slice(0, -1) + "a";
    }
    return out;
  }
  function readOlChiki(word) {
    let out = "";
    for (const ch2 of word) {
      if (ch2 === rules.ol_chiki.aspiration && out && !vowels.has(out[out.length - 1]))
        continue;
      out += olChiki.get(ch2) ?? "";
    }
    return out;
  }
  function readMeetei(word) {
    let out = "";
    for (const ch2 of word)
      out += meetei.get(ch2) ?? "";
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
  function fits(classes, i, br) {
    const prev = i > 0 ? classes[i - 1] : "^";
    const next = i + 1 < classes.length ? classes[i + 1] : "$";
    return (br.after === undefined || br.after.includes(prev)) && (br.before === undefined || br.before.includes(next)) && !(br.not_before ?? "").includes(next);
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
        if (classes[i] === br.class && vs.length * 2 <= rules.max_keys && fits(classes, i, br)) {
          const also = br.also || DELETED;
          vs = vs.concat(vs.map((v) => v.slice(0, i) + also + v.slice(i + 1)));
        }
      }
    }
    return vs.map((v) => v.replaceAll(DELETED, ""));
  }
  function number(word) {
    let out = "";
    for (let i = 0;i < word.length; i++) {
      const o = word.charCodeAt(i);
      const z = rules.digit_zeros.find((z2) => o >= z2 && o <= z2 + 9);
      if (z === undefined)
        return;
      out += String.fromCharCode(48 + o - z);
    }
    return out || undefined;
  }
  return function keys(word) {
    const n = number(word);
    if (n !== undefined)
      return [n];
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
    out.delete("");
    return [...out].sort();
  };
}
var engine = compile(rules_default);
var _internal = { compile: (r) => compile(r), normalize: (w) => normalize(w), engine };
var RULES_VERSION = rules_default.version;
var MAX_NAME_KEYS = 256;
function normalize(word) {
  let plain = "";
  for (const c of word) {
    for (const cp of nfd(c.codePointAt(0))) {
      if (isMn(cp))
        continue;
      if (cp >= 128)
        return nfc(word);
      plain += String.fromCodePoint(cp);
    }
  }
  return plain.toLowerCase();
}
function keys(word) {
  const w = normalize(word);
  return w ? engine(w) : [];
}
function words(name) {
  return name.replace(/\([^)]*\)/g, " ").split(/[^\S\ufeff]|[\x1c-\x1f\x85.\-,'’]/u).filter(Boolean);
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
var JOINED_MIN_CLASSES = rules_default.joined.min_classes;
function joinedKeys(name) {
  const joined = words(name).map(normalize).join("");
  if (!joined)
    return [];
  return engine(joined).filter((k) => [...k].length >= JOINED_MIN_CLASSES);
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
  joinedKeys,
  _internal,
  RULES_VERSION,
  MAX_NAME_KEYS,
  JOINED_MIN_CLASSES
};
