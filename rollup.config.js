import fs from 'fs';
import postcss from 'rollup-plugin-postcss';

const entries = [
  'storelocator',
  'about',
  'filters',
  'search',
  'products',
  'finance',
  'compare',
];

// Drops the empty JS chunk Rollup emits for a CSS-only entry, leaving just the extracted CSS
const cssOnly = () => ({
  name: 'css-only',
  generateBundle(_, bundle) {
    for (const [fileName, file] of Object.entries(bundle)) {
      if (file.type === 'chunk') delete bundle[fileName];
    }
  },
});

// CSS-only entries: src/styles/<name>/_index.scss -> assets/<name>.css
// (for sections that have no JS of their own)
const styleEntries = [
  'store-banner',
  'store-gallery',
  'store-map',
  'store-google-reviews',
];

const configs = [];

for (const name of entries) {
  const jsFile = `src/${name}.js`;
  const scssFile = `src/${name}.scss`;

  const hasJs = fs.existsSync(jsFile);
  const hasScss = fs.existsSync(scssFile);

  if (hasJs) {
    configs.push({
      input: jsFile,
      output: {
        file: `assets/${name}.js`,
        format: 'es',
      },
      plugins: [
        postcss({
          extract: `${name}.css`,
          use: ['sass'],
        }),
      ],
    });
  }
}

for (const name of styleEntries) {
  configs.push({
    input: `src/styles/${name}/_index.scss`,
    output: {
      dir: 'assets',
      format: 'es',
    },
    plugins: [
      postcss({
        extract: `${name}.css`,
        use: ['sass'],
      }),
      cssOnly(),
    ],
  });
}

export default configs;