module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    extends: [
        'plugin:prettier/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
        },
        project: true,
        tsconfigRootDir: __dirname,
    },
    plugins: ['prettier', '@typescript-eslint'],
    rules: {
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/class-literal-property-style': 'off',
        '@typescript-eslint/no-misused-promises': [
            'error',
            {
                checksVoidReturn: false,
            },
        ],
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
        // Deactivated because it also disables the use of readonly T[] over ReadonlyArray<T>
        // and readonly T[] can be confusing (is T or the array readonly)
        '@typescript-eslint/array-type': 'off',

        // Disabled because this defeats one the purposes of template expressions, to make it easy to
        // log values which may be incorrect or mistyped
        '@typescript-eslint/restrict-template-expressions': 'off',

        // Disabled because this prevents passing around unbound functions in all cases, even when they
        // don't reference this in the implementation at all and the workaround of specifying this: void
        // as the first argument is very awkward
        '@typescript-eslint/unbound-method': 'off',
    },
    overrides: [
        {
            // enable the rule specifically for TypeScript files
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': [
                    'warn',
                    { allowExpressions: true },
                ],
                '@typescript-eslint/no-var-requires': ['error'],
            },
        },
    ],
    settings: {
        react: {
            version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
        },
    },
    ignorePatterns: '.eslintrc.cjs',
};
