import * as path from 'path'

// @ts-ignore
import Taskr from 'taskr'

const dir = path.join(__dirname, 'fixtures')
const tmp = path.join(__dirname, 'tmp')

const expected = `var module = (function () {
  'use strict';

  function a () {
    return 'a';
  }

  function b () {
    return 'b';
  }

  function entry () {
    a();
    b();
  }

  return entry;

}());
`

const opts = {
  plugins: [require('rollup-plugin-babel')()],
  treeshake: false,
  output: {
    file: 'bundle.js',
    name: 'module',
    sourcemap: false as boolean | string,
    format: 'iife'
  }
}

test('taskr-rollup', async () => {
  expect.assertions(9)

  const taskr = new Taskr({
    plugins: [require('../'), require('@taskr/clear')],
    tasks: {
      *basic(f) {
        yield f
          .source(`${dir}/entry.js`)
          .rollup(opts)
          .target(tmp)

        const actual = yield f.$.read(`${tmp}/bundle.js`, 'utf8')

        expect(actual).toBe(expected)

        yield f.clear(tmp)
      },
      *inline(f) {
        opts.output.sourcemap = 'inline'
        yield f
          .source(`${dir}/entry.js`)
          .rollup(opts)
          .target(tmp)

        const actual = yield f.$.read(`${tmp}/bundle.js`, 'utf8')

        expect(actual).toContain(expected)
        expect(actual).toContain(
          '# sourceMappingURL=data:application/json;base64'
        )

        const base64Map = actual.split('base64')[1]
        const utf8Map = Buffer.from(base64Map, 'base64').toString()

        expect(() => JSON.parse(utf8Map)).not.toThrow()

        expect(JSON.parse(utf8Map).version).toBe(3)

        yield f.clear(tmp)
      },
      *external(f) {
        opts.output.sourcemap = true
        yield f
          .source(`${dir}/entry.js`)
          .rollup(opts)
          .target(tmp)

        const actual = yield f.$.read(`${tmp}/bundle.js`, 'utf8')
        const map = yield f.$.read(`${tmp}/bundle.js.map`, 'utf8')

        expect(actual).toContain(expected)
        expect(actual).toContain('# sourceMappingURL=bundle.js.map')
        expect(map).toContain('{"version":3')

        yield f.clear(tmp)
      }
    }
  })

  expect(taskr.plugins).toHaveProperty('rollup')

  await taskr.serial(['basic', 'inline', 'external'])
})
