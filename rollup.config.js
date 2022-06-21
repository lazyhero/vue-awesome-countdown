import babel from '@rollup/plugin-babel';
import vue from '@vitejs/plugin-vue'

export default {
  input: './src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es',
    globals: {
      vue: 'Vue'
    }
  },
  external: ['vue'],
  plugins: [vue(), babel({ babelHelpers: 'bundled', extensions: ['.ts', '.js', '.tsx'] })]
};