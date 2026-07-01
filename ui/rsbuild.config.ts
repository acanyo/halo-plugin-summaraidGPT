import { rsbuildConfig } from '@halo-dev/ui-plugin-bundler-kit'
import Icons from 'unplugin-icons/rspack'
import { pluginSass } from '@rsbuild/plugin-sass'
import type { RsbuildConfig } from '@rsbuild/core'
import { UnoCSSRspackPlugin } from '@unocss/webpack/rspack'

export default rsbuildConfig({
  rsbuild: {
    resolve: {
      alias: {
        '@': './src',
      },
    },
    plugins: [pluginSass()],
    tools: {
      rspack: {
        plugins: [Icons({ compiler: 'vue3' }), UnoCSSRspackPlugin()],
      },
    },
  },
}) as RsbuildConfig
