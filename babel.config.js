// 项目发布阶段用到的babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  'plugins': [
    // 'transform-remove-console'
    //发布阶段用到的插件
    ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import'

  ],


}
