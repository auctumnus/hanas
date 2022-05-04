# API Helper

This is a wrapper library for using the Hanas API. It provides Typescript
definitions for endpoints and simplifies accessing information from the API
as a whole.

It isn't required to access the API, but helps anyone in a JS environment!

## Installing

```sh
npm install @hanas-app/api-helper
```

The API helper also requires [fetch][fetch] to be available globally. If you're
targetting modern browsers (approximately browserslist defaults), this shouldn't
be an issue, but older browsers and Node may have issues. If you're in those
environments, before importing the helper, use something like
[cross-fetch][cross-fetch].

## Usage

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch
[cross-fetch]: https://github.com/lquixada/cross-fetch#usage
