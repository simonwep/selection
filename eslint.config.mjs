import js from '@eslint/js';
import ts from 'typescript-eslint';
import react from 'eslint-plugin-react';
import vue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  react.configs.flat.recommended,
  {
    files: ['**/*.{js,mjs}'],
    rules: {
      semi: ['error', 'always'],
      'no-console': 'error'
    }
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'error'
    }
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-console': 'error'
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: tsParser
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'error'
    }
  }
];
