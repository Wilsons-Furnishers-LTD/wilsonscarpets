// import scss from 'rollup-plugin-scss'
// import postcss from 'rollup-plugin-postcss'
// import terser from '@rollup/plugin-terser'

// export default {
//   input: 'src/storelocator.js',
//   output: {
//     format: 'esm',
//     file: 'assets/storelocator.js'
//   },
//   plugins: [
//     terser(),
//     scss({
//       fileName: 'storelocator.css'
//     })
//   ]
// }

import postcss from 'rollup-plugin-postcss';

export default [
  {
    input: 'src/storelocator.js',
    output: {
      file: 'assets/storelocator.js',
      format: 'es',
    },
    plugins: [
      postcss({
        extract: 'storelocator.css',
        use: ['sass'],
      }),
    ],
  },
  {
    input: 'src/about.js',
    output: {
      file: 'assets/about.js',
      format: 'es',
    },
    plugins: [
      postcss({
        extract: 'about.css',
        use: ['sass'],
      }),
    ],
  },
{
    input: 'src/filters.js',
    output: {
      file: 'assets/filters.js',
      format: 'es',
    },
    plugins: [
      postcss({
        extract: 'filters.css',
        use: ['sass'],
      }),
    ],
  },
];