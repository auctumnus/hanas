# PWA client

A PWA client for Hanas built with [Vue 3][vue3], on top of the [Vitesse] starter.

The style is vaguely according to [Material Design 3][md3], but doesn't strictly
adhere to the design guidelines. (That is, some parts are pixel-perfect compliant
and other parts entirely ignore it.)

## Build

```sh
$ pnpm build    # build the web client
$ pnpm dev      # run in dev mode
```

## Configure

Vite does not support a `.env.defaults` file, which means I can't supply defaults
in config. Sorry! The `.env` file should contain:

```
HANAS_URL=http://localhost:1337
KRATOS_URL=https://localhost:4433
```

[vue3]: https://vuejs.org
[vitesse]: https://github.com/antfu/vitesse/
[md3]: https://m3.material.io
