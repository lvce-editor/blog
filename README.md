# Blog

A technical blog for Lvce Editor covering development insights and implementation details.

## Contributing

```sh
git clone git@github.com:lvce-editor/blog.git &&
cd blog &&
npm ci &&
npm run dev
```

### Devcontainer

Open the repository in an editor that supports devcontainers and reopen it in the
container. Setup installs Node.js 24, the npm dependencies, and Chromium with its
system dependencies for the Playwright tests.

Start the development server in the container:

```sh
npm run dev -- --host 0.0.0.0
```

Open <http://localhost:3000/blog/> using the forwarded port. Run `npm run test:e2e`
in the container to build the blog and run the browser tests.
