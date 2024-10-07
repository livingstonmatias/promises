const STATE = {
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected'
}

function resolve(value) {
    if (this.state !== STATE.PENDING) return
    this.state = STATE.FULFILLED
    this.value = value
    this.fulfilledCallbacks.forEach(callback => callback(this))
}

function reject(reason) {
    if (this.state !== STATE.PENDING) return
    this.value = reason
    this.state = STATE.REJECTED
    this.rejectedCallbacks.forEach(callback => callback(this))
}

function Promesa(executor) {
    this.state = STATE.PENDING
    this.value = undefined

    this.fulfilledCallbacks = []
    this.rejectedCallbacks = []

    try {
        executor(resolve.bind(this), reject.bind(this))
    } catch (error) {
        reject.call(this, error)
    }

    this.then = (onFulfilled, onRejected) => {
        return new Promesa((resolve, reject) => {
            const handleCallback = (promesa) => {
                try {
                    if (promesa.state === STATE.REJECTED) throw promesa

                    if (typeof onFulfilled !== 'function') {
                        return resolve(promesa.value)
                    }

                    const result = onFulfilled(promesa.value)

                    if (result instanceof Promesa) {
                        return result.then(resolve, reject)
                    }

                    return resolve(result)
                } catch (promesa) {
                    if (typeof onRejected !== 'function') {
                        return reject(promesa.value)
                    }

                    const result = onRejected(promesa.value)

                    if (result instanceof Promesa) {
                        return result.catch(reject)
                    }

                    return reject(result)
                }
            }

            if (this.state === STATE.PENDING) {
                this.fulfilledCallbacks.push(handleCallback)
                this.rejectedCallbacks.push(handleCallback)
                
            } else {
                handleCallback(this)
            }
        })
    }

    this.catch = (onRejected) => {
        return this.then(undefined, onRejected)
    }
}
export {
    Promesa
}