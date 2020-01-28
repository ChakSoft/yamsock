module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['airbnb'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'never'],
    'key-spacing': [
      'error',
      {
        beforeColon: true,
        afterColon: true,
      },
    ],
    'space-before-function-paren': ['error', 'always'],
    'arrow-parens': ['error', 'always'],
    'eol-last': ['error', 'always'],
    'object-property-newline': [
      'error',
      {
        allowAllPropertiesOnSameLine: false,
      },
    ],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true, minProperties: 2 },
        ObjectPattern: { multiline: true, minProperties: 2 },
        ImportDeclaration: { multiline: true, minProperties: 2 },
        ExportDeclaration: 'always',
      },
    ],
    'max-len': ['error', 160],
    'no-underscore-dangle': ['error', {
      allow : ['_id'],
    }],
    'no-restricted-syntax': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
