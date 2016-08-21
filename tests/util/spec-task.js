import test from 'tape'
import Task from 'data.task'
import curry from 'lodash/fp/curry'
import toArray from 'lodash/fp/toArray'
import id from 'lodash/fp/identity'
import fs from 'fs'

import task from '../../src/util/task'
import random from '../harness/random'
import trace from '../../src/util/trace'

const {
  reject: rejectTask,
  resolve: resolveTask,
  fromCB,
  fromPromise,
  writeFile,
  writeData,
  sequence
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
  t.equal(typeof rejectTask, `function`, `Task.reject should be a function.`)
  const word = random.word(6)
  const rejecter = () => new TypeError(word)
  const output = rejectTask(rejecter())
  output.fork((x) => {
    t.equal(x.message, word, `Task should return the correct error`)
    t.end()
  })
})

test(`Task.resolve should always pass synchronous input task`, (t) => {
  t.plan(2)
  t.equal(typeof resolveTask, `function`, `Task.resolve should be a function.`)
  const word = random.word(6)
  const output = resolveTask(word)
  output.fork((e) => {
    throw e
  }, (x) => {
    t.equal(x, word, `Task.resolve should return the correct value`)
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

const crapout = curry((t, e) => {
  t.fail(`This method should be able to write a local file. ${e.toString()}`)
})

test(`Task.writeFile should provide a task-interface for file writing`, (t) => {
  t.plan(5)
  t.equal(typeof writeFile, `function`, `Task.writeFile should be a function.`)
  const inputData = random.word(10)
  const filename = `./fixture.txt`
  const fileWritten = writeFile(filename, inputData)
  t.ok(fileWritten, `Task.writeFile should return a Task`)
  t.ok(fileWritten.fork, `Task.writeFile should return a Task with a fork method`)
  const success = (o) => {
    t.ok(o)
    const value = fs.readFileSync(filename, `utf8`)
    t.equal(value, inputData)
  }
  fileWritten.fork(crapout(t), success)
})

test(`Task.writeFile should know how to fold in existing Task values`, (t) => {
  t.plan(2)
  const forkData = `butts`
  const filename = `./fixture.txt`
  // const priorValue = fs.readFileSync(filename, `utf8`)
  writeFile(filename, new Task((_, res) => {
    res(forkData)
  })).fork(crapout(t), (o) => {
    t.ok(o)
    const value = fs.readFileSync(filename, `utf8`)
    t.equal(value, forkData)
    t.end()
  })
})

test(`Task.writeData should be a curried wrapper for rejection`, (t) => {
  t.plan(2)
  t.equal(typeof writeData, `function`, `Task.writeData should be a function.`)
  writeData((e) => {
    t.ok(e)
    t.end()
  }, () => {
    t.fail(`This write should fail.`)
  }, ``, `barfsauce`)
})

const delayedTask = (input) => new Task((_, resolve) => {
  setTimeout(() => {
    resolve(input)
  }, 1e2)
})

test(`Task.sequence should provide a sequential interface for consuming a list of tasks`, (t) => {
  t.plan(6)
  t.equal(typeof sequence, `function`, `Task.sequence should be a function.`)
  const errorToThrow = `Expected to be given a list of tasks with fork methods.`
  t.throws(() => sequence([]).fork((e) => { throw e }), errorToThrow, `Should throw given [].`)
  const words = {
    one: random.word(10),
    two: random.word(10),
    three: random.word(10)
  }
  const input = [
    delayedTask(words.one),
    delayedTask(words.two),
    delayedTask(words.three)
  ]
  const sequenceTask = sequence(input)
  t.ok(sequenceTask, `Task.sequence should return a Task`)
  t.ok(sequenceTask.fork, `Task.sequence should return a Task with a fork method`)
  const fail = (e) => {
    t.fail(`This case should not occur: ${e}`)
  }
  const succeed = (output) => {
    t.ok(output)
    t.same(output, toArray(words))
    t.end()
  }
  sequenceTask.fork(fail, succeed)
})
