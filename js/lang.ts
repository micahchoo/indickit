// A language tag, read the same way in every indickit utility, in Go
// (internal/lang) and in the Python reference (linguistic-utilities lu/lang.py):
// lower case, the first subtag only (hi-IN, hi_IN → hi), and an ISO 639-2 code
// of a language with a two-letter code as that code (hin → hi).

// The ISO 639-2 codes of the 22 languages of the Eighth Schedule that have an
// ISO 639-1 code. The other six (brx doi gom kok mai mni sat) have only a
// three-letter code, which BCP 47 uses as it is.
// Seven characters an entry: "hin hi ".
const ISO_639_2 = "asm as ben bn guj gu hin hi kan kn kas ks mal ml mar mr nep ne ori or pan pa san sa snd sd tam ta tel te urd ur ";

export function langCode(tag: string | undefined): string {
  const t = (tag ?? "").toLowerCase().split(/[-_]/)[0];
  const i = t.length === 3 ? ISO_639_2.indexOf(t + " ") : -1;
  return i >= 0 && i % 7 === 0 ? ISO_639_2.slice(i + 4, i + 6) : t;
}
