'use strict'

const path = require('path')
const test = require('tape')
const Taskr = require('taskr')

const dir = path.join(__dirname, 'fixtures')
const tmp = path.join(__dirname, 'tmp')

const expected =
`var module = (function () {
'use strict';

var a = function () {
  return 'a';
};

var b = function () {
  return 'b';
};

var entry = function () {
  a();
  b();
};

return entry;

}());
`

const opts = {
  plugins: [
    require('rollup-plugin-babel')()
  ],
  treeshake: false,
  output: {
    file: 'bundle.js',
    name: 'module',
    sourcemap: false,
    format: 'iife'
  }
}

test('taskr-rollup', t => {
  t.plan(12)

  const taskr = new Taskr({
    plugins: [
      require('../'),
      require('@taskr/clear')
    ],
    tasks: {
      * basic(f) {
        yield f.source(`${dir}/entry.js`).rollup(opts).target(tmp)

        const actual = yield f.$.read(`${tmp}/bundle.js`, 'utf8')
        t.ok(actual, 'writes output file')
        t.equal(actual, expected, 'produces correct content')

        yield f.clear(tmp)
      },
      * inline(f) {
        opts.output.sourcemap = 'inline'
        yield f.source(`${dir}/entry.js`).rollup(opts).target(tmp)

        const actual = yield f.$.read(`${tmp}/bundle.js`, 'utf8')
        t.ok(actual, 'writes output file')
        t.true(actual.indexOf(expected) > -1, 'produces correct content')
        t.true(actual.indexOf('# sourceMappingURL=data:application/json;base64') > -1, 'appends `sourceMappingURL` content')

        const base64Map = actual.split('base64')[1]
        const utf8Map = Buffer.from(base64Map, 'base64')
        t.doesNotThrow(JSON.parse.bind(JSON, utf8Map), 'base64 encodes inline sourcemap')
        t.equals(3, JSON.parse(utf8Map).version, 'sourcemap has correct content')

        yield f.clear(tmp)
      },
      * external(f) {
        opts.output.sourcemap = true
        yield f.source(`${dir}/entry.js`).rollup(opts).target(tmp)

        const actual = yield f.$.read(`${tmp}/bundle.js`, 'utf8')
        const map = yield f.$.read(`${tmp}/bundle.js.map`, 'utf8')
        t.ok(actual, 'writes output file')
        t.true(actual.indexOf(expected) > -1, 'produces correct content')
        t.true(actual.indexOf('# sourceMappingURL=bundle.js.map') > -1, 'appends `sourceMappingURL`')
        t.true(map.indexOf('{"version":3') === 0, 'writes external sourcemap')

        yield f.clear(tmp)
      }
    }
  })

  t.true('rollup' in taskr.plugins, 'attach `rollup()` plugin to taskr')

  taskr.serial(['basic', 'inline', 'external'])
})
