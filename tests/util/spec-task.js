import test from 'tape'
import curry from 'lodash/fp/curry'
import id from 'lodash/fp/identity'

import task from '../../src/util/task'
import random from '../harness/random'
import trace from '../../src/util/trace'

const {
  reject: rejectTask,
  resolve: resolveTask,
  fromCB,
  fromPromise,
  writeFile,
  writeData
} = task

const randomPromise = (bool, eventualValue) => () => {
  return new Promise((resolve, reject) => {
    if (bool) {
      resolve(eventualValue)
      return
    }
    reject(new Error(eventualValue))
  })
}

test(`Task.reject should always fail synchronous input task`, (t) => {
  t.plan(2)
  t.equal(typeof rejectTask, `function`)
  const word = random.word(6)
  const rejecter = () => new TypeError(word)
  const output = rejectTask(rejecter())
  output.fork((x) => {
    t.equal(x.message, word)
    t.end()
  })
})

test(`Task.resolve should always pass synchronous input task`, (t) => {
  t.plan(2)
  t.equal(typeof resolveTask, `function`)
  const word = random.word(6)
  const output = resolveTask(word)
  output.fork((e) => {
    throw e
  }, (x) => {
    t.equal(x, word)
    t.end()
  })
})

const nodeStyleCBFunction = curry((errorWord, val, fn) => {
  if (val) {
    fn(new Error(errorWord))
    return
  }
  fn(null, errorWord)
})

test(`Task.fromCB should convert a node-style callback function to a Task`, (t) => {
  t.plan(3)
  t.equal(typeof fromCB, `function`)
  const errorWord = random.word(10)
  const hook = nodeStyleCBFunction(errorWord)
  const assert = {
    aboutFailure: (e) => {
      t.equal(e.message, errorWord)
    },
    aboutSuccess: (o) => {
      t.equal(o, errorWord)
      t.end()
    }
  }
  const failer = hook(true)
  const taskStyleFailer = fromCB(failer)
  taskStyleFailer.fork(assert.aboutFailure, trace(`invalid success`))
  const succeeder = hook(false)
  const taskStyleSucceeder = fromCB(succeeder)
  taskStyleSucceeder.fork(trace(`invalid failure`), assert.aboutSuccess)
})

test(`Task.promise should provide a task-interface given a promise`, (t) => {
  t.plan(4)
  t.equal(typeof fromPromise, `function`, `Task.fromPromise should be a function`)
  const word = random.word(10)
  const alwaysPass = randomPromise(true, word)
  const alwaysFail = randomPromise(false, word)
  t.throws(
    () => fromPromise(false).fork((e) => { throw e }, id),
    `Expected to be given a promise.`,
    `Task.fromPromise should throw when it receives not-a-promise.`
  )
  const alwaysPassTask = fromPromise(alwaysPass())
  const alwaysFailTask = fromPromise(alwaysFail())
  alwaysPassTask.fork(id, (x) => {
    t.equal(x, word)
  })
  alwaysFailTask.fork((e) => {
    t.equal(e.message, word)
    t.end()
  }, id)
})
