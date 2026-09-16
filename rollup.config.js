import fs from 'fs';
import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const entries = [
  'storelocator',
  'about',
  'filters',
  'search',
  'products',
  'finance',
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
        nodeResolve(),
        postcss({
          extract: `${name}.css`,
          use: ['sass'],
        }),
      ],
    });
  }
}

export default configs;