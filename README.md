# Crypta

> (n.) an underground vault or chamber, especially one beneath a church that is used as a burial place.

Or a personal vault for code snippets (or text) storing, with encryption to
handle sensitive data. Latest development version at:
https://thanhnguyen2187.github.io/crypta/.

## Features

- Optimized for fast copying and pasting
- In-memory encryption/decryption
- Fully local-first/offline-first (powered by OPFS; one BIG WARNING: OPFS gets
wiped out on Lighthouse benchmarking, so don't store anything sensitive here yet)
- Tagging and searching
- Self-hosted backend server (WIP)
- PWA (WIP)

## Why?

- Notion would be a good all-purpose note-taking tool, but it is not that
optimized for my workflow: quickly copying and pasting code snippets for later
reusing. There is no self-hosting backend either.
- Evernote does have text encryption/decryption, but it does not look that good.
Plus, the data is synchronized to their server, similar to Notion.
- massCode is quite good, but being an Electron application and using a single
JSON file as database means I cannot access it from the mobile, which is quite
crucial since I also want to take note from my phone sometimes. There is no tool
for encryption/decryption either.

Or NIH syndrome kicked in and I want to use that chance to polish my own skills
a bit.

## Development

- Make sure that you have `node` and `yarn` ready:

```shell
node --version
# v18.16.1
yarn --version
# 1.22.19
```

- Install dependencies:

```shell
yarn install
```

- Start the development server:

```shell
yarn dev
```

## Deployment

- Build static files:

```shell
yarn build
```

The built files should be available in a folder named `build/`. You are free to
copy this somewhere else and serve it as a static website using a web server
like Nginx or Caddy.

BEWARE: the data is stored within the browser, so make sure to back up regularly
before synchronization is implemented.

- Preview (see how the built files work):

```shell
yarn preview
```

Or you can move to the folder and try serving it yourself:

```shell
python -m http.server
```
