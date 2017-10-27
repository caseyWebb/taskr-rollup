# taskr-rollup
> [Rollup][] plugin for [Taskr][]

[![NPM][npm-shield]][npm]
[![License][license-shield]][license]
[![Build Status][travis-ci-shield]][travis-ci]
[![Coverage Status][codecov-shield]][codecov]
[![Dependency Status][david-dm-shield]][david-dm]
[![Greenkeeper][greenkeeper-shield]][greenkeeper]


## Install

This plugin requires [Taskr][] and [Rollup][].

```bash
$ yarn add -D taskr rollup taskr-rollup
```
*or*
```bash
$ npm install taskr rollup taskr-rollup
```

## Usage

```js
exports.bundle = function * (task) {
  yield task
    // bundle entry file
    .source('src/entry.js')
    .rollup({
      // configuration options, https://rollupjs.org/#configuration-files
      plugins: [
        require('rollup-plugin-babel')()
      ],
      output: {
        file: 'bundle.js',
        format: 'es'
      }
    })
    .target('dist')
}
```

## Configuration

All [Rollup options][Rollup-options] are supported, with the exception of `input`.

[Taskr]: https://github.com/lukeed/taskr

[Rollup]: https://github.com/rollup/rollup
[Rollup-options]: https://rollupjs.org/#configuration-files

[npm]: https://npmjs.com/package/taskr-rollup
[npm-shield]: https://img.shields.io/npm/v/taskr-rollup.svg

[license]: ./LICENSE
[license-shield]: https://img.shields.io/npm/l/taskr-rollup.svg

[travis-ci]: https://travis-ci.org/caseyWebb/taskr-rollup/
[travis-ci-shield]: https://img.shields.io/travis/caseyWebb/taskr-rollup/master.svg

[codecov]: https://codecov.io/gh/caseyWebb/taskr-rollup
[codecov-shield]: https://img.shields.io/codecov/c/github/caseyWebb/taskr-rollup.svg

[david-dm]: https://david-dm.org/caseyWebb/taskr-rollup#type=peer
[david-dm-shield]: https://img.shields.io/david/peer/caseyWebb/taskr-rollup.svg

[greenkeeper]: https://greenkeeper.io/
[greenkeeper-shield]: https://badges.greenkeeper.io/caseyWebb/taskr-filter.svg
