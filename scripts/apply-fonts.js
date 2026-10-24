/**
 * Skrypt (wersja 2): w całym folderze `src` zamienia Text i TextInput z 'react-native'
 * na wersje z '@/components/AppText' (czcionki szeryfowe wszędzie) i drukuje raport.
 * Uruchomienie z głównego folderu projektu:  node scripts/apply-fonts.js
 * Można go odpalić wielokrotnie – nie zrobi szkody.
 * Cofnięcie (jeśli wcześniej zrobiłeś commit):  git restore .
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const NAMES = ['Text', 'TextInput'];
const RN_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]react-native['"];?[ \t]*(\r?\n)/g;
const APP_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]@\/components\/AppText['"]/g;

const specs = (inner) => inner.split(',').map((x) => x.trim()).filter(Boolean);
const baseName = (s) => s.split(/\s+as\s+/)[0].trim();
const localName = (s) => s.split(/\s+as\s+/).pop().trim();
const isTarget = (s) => NAMES.includes(baseName(s)); // "type Text" nie pasuje, bo baseName = "type Text"

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : walk(p);
    return /\.(tsx|jsx)$/.test(e.name) ? [p] : [];
  });
}

function convert(code) {
  const moved = [];
  for (const m of code.matchAll(RN_IMPORT)) specs(m[1]).filter(isTarget).forEach((s) => moved.push(s));
  if (!moved.length) return null;
  const have = new Set();
  for (const m of code.matchAll(APP_IMPORT)) specs(m[1]).forEach((s) => have.add(localName(s)));
  const toAdd = [...new Set(moved)].filter((s) => !have.has(localName(s)));
  let first = true;
  return code.replace(RN_IMPORT, (full, inner, eol) => {
    const rest = specs(inner).filter((s) => !isTarget(s));
    let out = rest.length ? `import { ${rest.join(', ')} } from 'react-native';${eol}` : '';
    if (first) {
      first = false;
      if (toAdd.length) out += `import { ${toAdd.join(', ')} } from '@/components/AppText';${eol}`;
    }
    return out;
  });
}

const rel = (f) => path.relative(ROOT, f);
const files = walk(SRC).filter((f) => !f.endsWith('AppText.tsx'));
let changed = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = convert(before);
  if (after && after !== before) {
    fs.writeFileSync(f, after, 'utf8');
    changed++;
    console.log('zmieniono:', rel(f));
  }
}

// Raport: co jeszcze może mieć czcionkę systemową?
const manual = [];
let done = 0;
for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  const usesText = /<(Text|TextInput|RN\.Text|RNText)\b/.test(code);
  if (!usesText) continue;
  const fromAppText = /from\s*['"]@\/components\/AppText['"]/.test(code);
  const rnStar = /import\s*\*\s*as\s+\w+\s+from\s*['"]react-native['"]|<\w+\.Text\b|Animated\.Text/.test(code);
  const otherLib = /import\s*\{[^}]*\bText\b[^}]*\}\s*from\s*['"](?!react-native['"]|@\/components\/AppText['"])[^'"]+['"]/.test(code);
  if (fromAppText && !rnStar) done++;
  else manual.push({ f, why: rnStar ? 'Text przez "RN.Text"/Animated.Text' : otherLib ? 'Text z innej biblioteki/komponentu' : 'nie rozpoznano źródła Text' });
}

console.log(`\nGotowe. Zmienione teraz: ${changed}. Pliki z tekstem już na szeryfach: ${done}.`);
if (manual.length) {
  console.log('\nDO SPRAWDZENIA RĘCZNIE (tu czcionka może zostać systemowa):');
  manual.forEach((m) => console.log(' -', rel(m.f), '→', m.why));
} else {
  console.log('Brak plików wymagających ręcznej poprawki.');
}
