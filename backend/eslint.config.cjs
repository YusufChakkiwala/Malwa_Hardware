module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'uploads/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs'
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
      'no-console': 'off'
    }
  }
];
