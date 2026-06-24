import { defineConfig } from 'vitepress'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, parse, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = join(rootDir, 'posts')

const toPosixPath = (path) => {
  return path.split(sep).join('/')
}

const titleFromSlug = (slug) => {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

const getTitle = (content, fallback) => {
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1].trim() || fallback
}

const cleanExcerpt = (line) => {
  return line
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const truncate = (text) => {
  if (text.length <= 160) {
    return text
  }
  return `${text.slice(0, 157).trimEnd()}...`
}

const getDetails = (content, year) => {
  const lines = content.split(/\r?\n/)
  let inFence = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inFence = !inFence
      continue
    }

    if (
      inFence ||
      !trimmed ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('- ') ||
      trimmed === 'Tasks:'
    ) {
      continue
    }

    const excerpt = cleanExcerpt(trimmed)
    if (excerpt) {
      return truncate(excerpt)
    }
  }

  return `Published in ${year}`
}

const getMarkdownFiles = (dir) => {
  if (!existsSync(dir)) {
    return []
  }

  const files = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...getMarkdownFiles(path))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path)
    }
  }

  return files
}

const getBlogPostFeatures = () => {
  return getMarkdownFiles(postsDir)
    .map((path) => {
      const relativePath = toPosixPath(relative(rootDir, path))
      const slug = parse(path).name
      const year = Number(relativePath.split('/')[1]) || 0
      const content = readFileSync(path, 'utf8')

      return {
        title: getTitle(content, titleFromSlug(slug)),
        details: getDetails(content, year),
        link: `/${relativePath.replace(/\.md$/, '')}`,
        year,
        path: relativePath,
      }
    })
    .sort((a, b) => {
      return b.year - a.year || b.path.localeCompare(a.path)
    })
    .map(({ title, details, link }) => {
      return { title, details, link }
    })
}

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
  transformPageData(pageData) {
    if (pageData.relativePath !== 'index.md') {
      return
    }

    return {
      frontmatter: {
        ...pageData.frontmatter,
        features: getBlogPostFeatures(),
      },
    }
  },
  vite: {
    plugins: [,],
  },
})
