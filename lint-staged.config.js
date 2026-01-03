module.exports = {
  '*': ['secretlint', 'eslint --fix --no-warn-ignored'],
  '**/*.ts?(x)': () => 'npm run check-types',
};
