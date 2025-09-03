# .

This template should help get you started developing with Vue 3 in Vite.

## Changelog

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
