import Task from 'data.task'
import reduce from 'lodash/fp/reduce'
import curry from 'lodash/fp/curry'
import fs from 'fs'
import _debug from 'debug'
const debug = _debug(`glass:util:task`)

export const sequence = (list) => {
  const [initial, ...remaining] = list
  return reduce((lastTask, newTask) => {
    return lastTask.chain((a) => {
      return newTask.map((b) => {
        if (!Array.isArray(a)) {
          a = [a]
        }
        return a.concat(b)
      })
    }, newTask)
  }, initial, remaining)
}

export const promiseToTask = (promise) => {
  return new Task((reject, resolve) => {
    if (!promise || !promise.then) {
      return reject(new TypeError(`Expected to be given a promise.`))
    }
    promise.then(resolve)
           .catch(reject)
  })
}

export const cbToTaskResolver = (fn) => new Task((reject, resolve) => {
  fn((e, x) => {
    if (e) {
      return reject(e)
    }
    resolve(x)
  })
})

export const cbToTask = (fn) => {
  return new Task((reject, resolve) => {
    fn((e, value) => {
      if (e) {
        reject(e)
        return
      }
      resolve(value)
    })
  })
}

export const resolveTask = (x) => {
  return new Task((_, resolve) => {
    resolve(x)
  })
}

export const rejectTask = (x) => {
  return new Task((reject) => {
    reject(x)
  })
}

export const writeData = curry((reject, resolve, filename, raw) => {
  debug(`attempting to write to ${filename}: ${raw}`)
  fs.writeFile(filename, raw, `utf8`, (err) => {
    debug(err || `outcome: success`)
    if (err) {
      return reject(err)
    }
    resolve(true)
  })
})

export const writeFile = curry(function _writeFile(filename, data) {
  return new Task(function _writeFileTaskRR(reject, resolve) {
    if (data && data.fork) {
      data.fork(reject, writeData(reject, resolve, filename))
      return
    }
    writeData(reject, resolve, filename, data)
  })
})

export default {
  reject: rejectTask,
  resolve: resolveTask,
  fromCB: cbToTask,
  fromPromise: promiseToTask,
  writeFile,
  writeData,
  sequence
}
