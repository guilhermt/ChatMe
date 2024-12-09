module.exports = {
  extends: ['mantine'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/extensions': 'off',
    'linebreak-style': 'off',
    'no-console': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'indent': ['error', 2],
  },
};
