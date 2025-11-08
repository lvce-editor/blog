import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Lvce Editor Blog',
  description: 'Lvce Editor Blog',
  base: '/blog/',
  themeConfig: {
    nav: [{ text: 'Home', link: '/' }],
    sidebar: [],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lvce-editor/blog' },
    ],
  },
  sitemap: {
    hostname: 'https://lvce-editor.github.io/blog/',
  },
})
