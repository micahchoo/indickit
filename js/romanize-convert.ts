/**
 * Script converters for romanize's script route (rules 2026-10-13.2; rules.json "converters"): Sindhi in
 * Devanagari to Perso-Arabic ("abjad"), Bengali-script Manipuri to Meetei Mayek ("bengali_meetei"). Every
 * letter and switch is data; these are only the loops of the reference (linguistic-utilities
 * jobs/romanize/converters.py) and of Go's romanize/convert.go.
 *
 * @module
 */

/** One converter's data, as rules.json holds it. */
export type Converter = {
  kind: "abjad" | "bengali_meetei";
  halant: string;
  skip?: string;
  consonants: Record<string, string>;
  signs: Record<string, string>;
  signs_after_vowel?: Record<string, string>;
  vowels_initial?: Record<string, string>;
  vowels_medial?: Record<string, string>;
  vowels?: Record<string, string>;
  nasals: Record<string, string>;
  prothetic: { letters: string; out: string };
  lonsum?: Record<string, string>;
  other?: Record<string, string>;
  aa?: string; nung?: string; lonsum_ng?: string; nga?: string; khanda?: string; ya?: string; ya_i?: string;
  w_letter?: string; w_after?: string; w_out?: string; conjunct_next?: string; apun?: string; joiners?: string;
  ou?: string; ou_not_before?: string[]; ou_out?: string;
};

type Unit = { kind: "C" | "V" | "N" | "S" | "O"; c: string; sign: string; hal: boolean };

function units(cv: Converter, w: string): Unit[] {
  const rs = [...w];
  const vowels = cv.vowels ?? cv.vowels_initial ?? {};
  const out: Unit[] = [];
  for (let i = 0; i < rs.length; ) {
    let c = rs[i];
    if (i + 1 < rs.length && (rs[i] + rs[i + 1]) in cv.consonants) c = rs[i] + rs[i + 1];
    if (c in cv.consonants) {
      const j = i + [...c].length;
      const u: Unit = { kind: "C", c, sign: "", hal: false };
      if (j < rs.length) {
        if (rs[j] in cv.signs) u.sign = rs[j];
        u.hal = rs[j] === cv.halant;
      }
      out.push(u);
      i = j + (u.sign || u.hal ? 1 : 0);
      if (i < rs.length && cv.skip && cv.skip.includes(rs[i])) i++;
      continue;
    }
    const kind = c in vowels ? "V" : c in cv.nasals ? "N" : c in cv.signs && cv.kind === "abjad" ? "S" : "O";
    out.push({ kind, c, sign: "", hal: false });
    i++;
  }
  return out;
}

function abjad(cv: Converter, w: string): string {
  const us = units(cv, w);
  const after = cv.signs_after_vowel ?? {};
  let s = "";
  if (us.length > 1 && us[0].kind === "C" && cv.prothetic.letters.includes(us[0].c) && us[0].hal) s += cv.prothetic.out;
  us.forEach((u, k) => {
    if (u.kind === "V") s += k === 0 ? cv.vowels_initial![u.c] : cv.vowels_medial![u.c];
    else if (u.kind === "N") s += cv.nasals[u.c];
    else if (u.kind === "S") s += after[u.c] ?? cv.signs[u.c];
    else if (u.kind === "C") {
      s += cv.consonants[u.c];
      if (u.sign) s += u.sign in after && k > 0 && (us[k - 1].kind === "V" || us[k - 1].kind === "S") ? after[u.sign] : cv.signs[u.sign];
    }
  });
  return s;
}

function bengaliMeetei(cv: Converter, w: string): string {
  const us = units(cv, w);
  const lon = cv.lonsum!;
  const closing = (m: string) => lon[m] ?? m;
  const syllables = us.filter((u) => (u.kind === "C" || u.kind === "V") && !u.hal).length;
  let s = "";
  for (let k = 0; k < us.length; k++) {
    const u = us[k], prv = k > 0 ? us[k - 1] : undefined, nxt = k + 1 < us.length ? us[k + 1] : undefined;
    const last = nxt === undefined;
    if (u.kind === "V") {
      if (cv.ou!.includes(u.c) && prv && (prv.sign || prv.kind === "V") && !(nxt && cv.ou_not_before!.includes(nxt.c))) { s += cv.ou_out; continue; }
      s += cv.vowels![u.c];
    } else if (u.kind === "N") {
      s += prv && prv.kind === "C" && !prv.sign ? cv.nung : cv.lonsum_ng;
    } else if (u.kind === "O") {
      s += cv.other![u.c] ?? "";
    } else if (u.kind === "C") {
      let m = cv.consonants[u.c];
      if (u.c === cv.w_letter && prv && prv.kind === "C" && prv.hal && cv.w_after!.includes(prv.c)) m = cv.w_out!;
      if (u.c === cv.ya && !u.sign && prv && (prv.sign || prv.kind === "V") && (last || nxt!.kind === "C")) { s += cv.ya_i; continue; }
      if (u.hal) {
        if (k === 0 && cv.prothetic.letters.includes(u.c)) s += cv.prothetic.out;
        else if (nxt && nxt.kind === "C" && (nxt.c === cv.conjunct_next || (nxt.c === cv.w_letter && cv.w_after!.includes(u.c)))) s += m + cv.apun;
        else if (nxt && nxt.kind === "C" && cv.joiners!.includes(cv.consonants[nxt.c]) && !(m in lon)) s += m + cv.apun;
        else s += closing(m);
        continue;
      }
      if (u.sign) { s += u.sign === cv.aa && last && syllables > 1 ? m : m + cv.signs[u.sign]; continue; }
      if (last) s += closing(m);
      else if (u.c === cv.nga && prv && nxt!.kind === "C") s += prv.kind === "C" && !prv.sign && !prv.hal ? cv.nung : cv.lonsum_ng;
      else if (nxt!.kind === "C" && prv && prv.sign) s += closing(m);
      else if (nxt!.kind === "C" && k >= 2 && us.slice(k - 2, k).every((v) => v.kind === "C" && !v.sign && !v.hal && v.c !== cv.khanda)) s += closing(m);
      else s += m;
    }
  }
  return s;
}

/** The converter's output for one word (NFC, joiners deleted, as romanize reads it). */
export function convert(cv: Converter, w: string): string {
  return cv.kind === "abjad" ? abjad(cv, w) : bengaliMeetei(cv, w);
}
