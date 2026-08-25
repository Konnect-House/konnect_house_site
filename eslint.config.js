import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // `motion` is excluded because ESLint 9 does not detect
      // <motion.div> (JSXMemberExpression) as a usage — known false positive
      // with framer-motion. See https://github.com/eslint/eslint/issues
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]|^motion$' },
      ],
    },
  },
])
