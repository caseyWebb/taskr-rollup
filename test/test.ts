import * as path from 'path'

import { RollupOptions } from 'rollup'

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Taskr from 'taskr'

import plugin from '../src'

const dir = path.join(__dirname, 'fixtures')
const tmp = path.join(__dirname, 'tmp')

const expected = `var module = (function () {
  'use strict';

  function a () {
    return 'a'
  }

  function b () {
    return 'b'
  }

  function entry () {
    a();
    b();
  }

  return entry;

}());
`

const opts: RollupOptions = {
  treeshake: false,
  output: {
    file: 'bundle.js',
    name: 'module',
    sourcemap: false as boolean | 'inline',
    format: 'iife'
  }
}

test('basic', async () => {
  expect.assertions(2)

  const taskr = new Taskr({
    plugins: [plugin, require('@taskr/clear')],
    tasks: {
      *default(f: any): IterableIterator<Promise<unknown>> { // eslint-disable-line @typescript-eslint/no-explicit-any
        yield f
          .source(`${dir}/entry.js`)
          .rollup(opts)
          .target(tmp)

        const actual = yield f.$.read(`${tmp}/bundle.js`, 'utf8')

        expect(actual).toBe(expected)

        yield f.clear(tmp)
      }
    }
  })

  expect(taskr.plugins).toHaveProperty('rollup')

  await taskr.start()
})

test('inline sourcemaps', async () => {
  expect.assertions(4)

  const taskr = new Taskr({
    plugins: [plugin, require('@taskr/clear')],
    tasks: {
      *default(f: any): IterableIterator<Promise<unknown>> { // eslint-disable-line @typescript-eslint/no-explicit-any
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
      }
    }
  })

  await taskr.start()
})

test('external sourcemaps', async () => {
  expect.assertions(3)

  const taskr = new Taskr({
    plugins: [plugin, require('@taskr/clear')],
    tasks: {
      *default(f: any): IterableIterator<Promise<unknown>> { // eslint-disable-line @typescript-eslint/no-explicit-any
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

  await taskr.start()
})
