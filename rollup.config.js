import fs from 'fs';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

// `npm run build` minifies. `npm run watch` keeps the output readable, with inline source maps
// so no .map files end up in assets/ to be uploaded to Shopify
const production = !process.env.ROLLUP_WATCH;

const entries = [
  'storelocator',
  'about',
  'filters',
  'search',
  'products',
  'finance',
  'compare',
  'storepage',
];

export default entries
  .filter(name => fs.existsSync(`src/${name}.js`))
  .map(name => ({
    input: `src/${name}.js`,
    output: {
      file: `assets/${name}.js`,
      // Loaded with plain <script> tags, so keep each bundle's top-level names in its own scope
      format: 'iife',
      // They've always run as classic scripts without strict mode, so don't add "use strict"
      strict: false,
      sourcemap: production ? false : 'inline',
    },
    plugins: [
      postcss({
        extract: `${name}.css`,
        minimize: production,
        sourceMap: production ? false : 'inline',
        // rollup-plugin-postcss still uses Sass's legacy API
        use: [['sass', { silenceDeprecations: ['legacy-js-api'] }]],
      }),
      production && terser(),
    ],
  }));
