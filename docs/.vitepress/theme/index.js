import DefaultTheme from 'vitepress/theme'
import VueCountdown from '../../../src/index'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(VueCountdown)
    // app.config.compilerOptions.isCustomElement = tag => tag.includes('-')
  }
}