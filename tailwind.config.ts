// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      /**
       * Project tokens (Figma-aligned)
       * max-w-360 => 1440px container
       * px-30     => 120px horizontal padding
       * max-w-50  => 200px (dipakai di Footer)
       */
      maxWidth: {
        360: '90rem', // 1440px
        50: '12.5rem', // 200px
      },
      spacing: {
        30: '7.5rem', // 120px
      },
    },
  },
  plugins: [],
} satisfies Config;
