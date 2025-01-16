import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname, 
});

export default [
    ...compat.extends('airbnb'), 
    ...compat.extends('plugin:prettier/recommended'), 
    {
        plugins: ['prettier'], 
        rules: {
            'prettier/prettier': ['error'], 
            'no-console': 'off', 
            'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }], 
            'import/prefer-default-export': 'off',
        },
        ignores: [
            'node_modules/',
            'package.json',
            'package-lock.json',
            'yarn-error.log',
            'yarn.lock',
            '*.md',
            '*.log',
            '*.test.js', 
        ],
    },
];
