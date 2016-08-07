import Task from 'data.task'
// import curry from 'lodash/fp/curry'

export const promiseToTask = (promise) => {
  return new Task((reject, resolve) => {
    if (!promise || !promise.then) {
      return reject(new TypeError(`Expected to be given a promise.`))
    }
    promise.then(resolve)
           .catch(reject)
  })
}

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

export default {
  reject: rejectTask,
  resolve: resolveTask,
  fromCB: cbToTask,
  fromPromise: promiseToTask
}
