# taskr-rollup

> [Rollup][] plugin for [Taskr][]

[![NPM][npm-shield]][npm]
[![License][license-shield]][license]
[![Build Status][build-status-shield]][build-status]
[![Coverage Status][codecov-shield]][codecov]
[![Dependency Status][david-dm-shield]][david-dm]

## Install

This plugin requires [Taskr][] and [Rollup][].

```bash
$ yarn add -D taskr rollup taskr-rollup
```

_or_

```bash
$ npm install taskr rollup taskr-rollup
```

## Usage

```js
exports.bundle = function*(task) {
  yield task
    // bundle entry file
    .source("src/entry.js")
    .rollup({
      // configuration options, https://rollupjs.org/#configuration-files
      plugins: [require("rollup-plugin-babel")()],
      output: {
        file: "bundle.js",
        format: "es"
      }
    })
    .target("dist");
};
```

## Configuration

All [Rollup options][rollup-options] are supported, with the exception of `input`.

[taskr]: https://github.com/lukeed/taskr
[rollup]: https://github.com/rollup/rollup
[rollup-options]: https://rollupjs.org/#configuration-files
[npm]: https://npmjs.com/package/taskr-rollup
[npm-shield]: https://img.shields.io/npm/v/taskr-rollup.svg
[license]: ./LICENSE
[license-shield]: https://img.shields.io/npm/l/taskr-rollup.svg
[build-status]: https://github.com/caseyWebb/taskr-rollup/actions/workflows/nodejs.yml
[build-status-shield]: https://img.shields.io/github/workflow/status/caseyWebb/taskr-rollup/Node%20CI/master
[codecov]: https://codecov.io/gh/caseyWebb/taskr-rollup
[codecov-shield]: https://img.shields.io/codecov/c/github/caseyWebb/taskr-rollup.svg
