module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true
  },
  extends: [
    'eslint:recommended',
    'standard'
  ],
  plugins: [],
  rules: {
  },
  // 當訪問未定義的變量時，no-undef 規則將發出警告
  // 因此需定義腳本在執行期間訪問的額外的全局變量
  globals: {
    $: true
  }
}
