import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  {
    ignores: [
      'apps/web-sveltekit/.svelte-kit/**',
      'apps/web-sveltekit/.vercel/**',
      'apps/web-sveltekit/build/**',
    ],
  },
  ...nextVitals,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
