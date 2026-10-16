// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // `.expo` to katalog generowany (typy tras, cache), `dist` to wynik eksportu —
    // nie lintujemy artefaktów.
    ignores: ['dist/**', '.expo/**'],
  },
]);
