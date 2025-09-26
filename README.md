# VocEdit

## Changelog

### 0.3.0

- Add create resource functionality
- Add virtualised sidebar list for concepts to improve performance
- Add SHACL validation report view
- Add provisional SKOS Collection SHACL UI shapes

### 0.2.0

- Add delete resource functionality
- Fix some styling issues

### 0.1.0

- Initial release
  - Embeddable component
  - Can open and save vocab files
  - Browse Concept Schemes, Collections and Concepts
  - Use SHACL UI form for editing resources

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

### Testing with local project

**1. Linking the library to the local project**

Link the local shacl-ui package.

```sh
pnpm link ~/projects/kurrawong/shacl-ui/shacl-ui
```

Unlink all linked packages.

```sh
pnpm unlink
```

**2. Installing the library in a local project**

Build the library.

```sh
pnpm build:lib
pnpm pack
```

Install the library in the local project. Use an absolute path to the tgz file.

```sh
pnpm add ~/kurrawong/vocedit/kurrawongai-vocedit-0.1.0.tgz
```

### Publish

```sh
pnpm publish --access public --no-git-checks
```
