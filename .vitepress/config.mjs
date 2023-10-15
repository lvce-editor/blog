import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Lvce Editor',
  description: 'Lvce Editor',
  base: '/blog',
  themeConfig: {
    nav: [{ text: 'Home', link: '/' }],
    sidebar: [],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lvce-editor/blog' },
    ],
  },
})
