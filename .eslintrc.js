module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'overrides': [
    {
      'files': ['*.ts', '*.tsx'],
      'plugins': ['@typescript-eslint'],
      'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      'rules': {
        '@typescript-eslint/triple-slash-reference': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/semi': ['error', 'never']
      }
    },
    {
      'files': [
        '.eslintrc.js',
        './scripts/**/*.js',
      ],
      'env': {
        'node': true,
      },
    },
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module'
  },
  'rules': {
    'semi': 'off',
    'quotes': ['error', 'single', { 'avoidEscape': true }],
  }
}
