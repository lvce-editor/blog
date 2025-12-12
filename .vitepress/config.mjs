import { defineConfig } from 'vitepress'
import { copyFileSync } from 'node:fs'
import { join } from 'node:path'

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
  srcExclude: ['README.md'],
  vite: {
    plugins: [
      {
        name: 'copy-google-verification',
        closeBundle() {
          const src = join(process.cwd(), 'google57d4e51aaf0cda26.html')
          const dest = join(
            process.cwd(),
            '.vitepress/dist/google57d4e51aaf0cda26.html',
          )
          try {
            copyFileSync(src, dest)
          } catch (error) {
            console.error('Failed to copy Google verification file:', error)
          }
        },
      },
    ],
  },
})
