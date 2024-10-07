# Implementación del Objeto `Promise` de JavaScript &#x1F680;

## Introducción

En este pequeño tutorial, se simula el comportamiento del objeto `Promise` nativo de JavaScript. La promesa que implementamos maneja tres posibles estados: `pending`, `fulfilled`, y `rejected`. A través de este ejemplo, comprenderás cómo funciona internamente una promesa en JavaScript y cómo se gestionan los cambios de estado y la ejecución de los callbacks de forma manual.

## Definición de Estados

El objeto `STATE` se utiliza para representar los tres estados de una promesa:

```js
const STATE = {
    PENDING: 'pending',    // Cuando la promesa aún no ha sido cumplida ni rechazada.
    FULFILLED: 'fulfilled', // Cuando la promesa ha sido resuelta con éxito.
    REJECTED: 'rejected'    // Cuando la promesa ha sido rechazada debido a un error o razón.
}
```

## Función Constructora `Promesa`

La función constructora `Promesa` encapsula el manejo de una operación asíncrona. Define cómo una promesa pasa de un estado `pending` a `fulfilled` o `rejected` y cómo se ejecutan los callbacks asociados a estos cambios.

### Constructor

La función constructora `Promesa` recibe un `executor`, que es la función asíncrona que contiene la lógica para resolver o rechazar la promesa. El `executor` recibe como parámetros las funciones `resolve` y `reject`, que permiten cambiar el estado de la promesa.

#### Argumentos:   
- **executor**: Función que se ejecuta cuando se instancia la promesa. Recibe dos argumentos: `resolve` y `reject`.

```js
function Promesa(executor) {
    this.state = STATE.PENDING  // Estado inicial.
    this.value = undefined      // Valor que se resolverá o rechazará.

    // Callbacks que se ejecutarán cuando la promesa se cumpla o se rechace.
    this.fulfilledCallbacks = []
    this.rejectedCallbacks = []

    try {
        executor(resolve.bind(this), reject.bind(this))  // Vinculamos `resolve` y `reject` al contexto actual.
    } catch (error) {
        reject.call(this, error)  // Si hay un error, rechazamos la promesa.
    }
}
```
## Método `resolve`
Este método se utiliza para cambiar el estado de la promesa a `fulfilled` y ejecutar los callbacks asociados cuando la promesa se cumple.

### Argumentos:   
- **value**: El valor con el cual se resuelve la promesa. Este valor se pasará a los callbacks definidos por `then`.
### Cambio de contexto:   
En este caso, el contexto de `this` se cambia utilizando `bind` en el constructor cuando se pasa `resolve` al `executor`. El `bind` asegura que el contexto de `resolve` siempre esté ligado a la instancia actual de la promesa.

```js
function resolve(value) {
    if (this.state !== STATE.PENDING) return  // Si ya no está en estado `pending`, no hacemos nada.

    this.state = STATE.FULFILLED  // Cambiamos el estado a `fulfilled`.
    this.value = value            // Almacenamos el valor resuelto.

    // Ejecutamos todos los callbacks almacenados en `fulfilledCallbacks`.
    this.fulfilledCallbacks.forEach(callback => callback(this))
}
```

## Método `reject`
Este método se utiliza para cambiar el estado de la promesa a `rejected` cuando ocurre un error y ejecutar los callbacks asociados al rechazo.

### Argumentos:   
- **reason**: La razón por la cual la promesa es rechazada. Este valor se pasará a los callbacks definidos por `catch` o el segundo argumento de `then`.
### Cambio de contexto:
Similar al método resolve, el contexto de `this` también se cambia usando `bind` en el constructor cuando se pasa reject al executor.

```js
function reject(reason) {
    if (this.state !== STATE.PENDING) return  // Si ya no está en estado `pending`, no hacemos nada.

    this.state = STATE.REJECTED  // Cambiamos el estado a `rejected`.
    this.value = reason          // Almacenamos la razón del rechazo.

    // Ejecutamos todos los callbacks almacenados en `rejectedCallbacks`.
    this.rejectedCallbacks.forEach(callback => callback(this))
}
```
## Método `then`
El método then recibe dos funciones: `onFulfilled` (cuando la promesa se resuelve exitosamente) y `onRejected` (cuando la promesa es rechazada).

### Argumentos:   
- **onFulfilled**: Función que se ejecuta cuando la promesa se cumple. Recibe el valor resuelto de la promesa.
- **onRejected**: Función que se ejecuta cuando la promesa es rechazada. Recibe la razón del rechazo.

```js
// Método `then`, que recibe dos funciones: `onFulfilled` (para éxito) y `onRejected` (para error).
this.then = (onFulfilled, onRejected) => {
    // Retornamos una nueva instancia de `Promesa`, lo que permite el encadenamiento.
    return new Promesa((resolve, reject) => {
        // Función interna para manejar los callbacks cuando la promesa cambia de estado.
        const handleCallback = (promesa) => {
            try {
                // Si el estado es `REJECTED`, lanzamos la promesa para capturarla en `catch`.
                if (promesa.state === STATE.REJECTED) throw promesa
                // Si no hay función `onFulfilled`, simplemente resolvemos con el valor actual.
                if (typeof onFulfilled !== 'function') {
                    return resolve(promesa.value)
                }
                // Ejecutamos `onFulfilled` con el valor de la promesa si es una función.
                const result = onFulfilled(promesa.value)
                // Si el resultado es otra promesa, encadenamos sus `then` y `catch` para manejarla.
                if (result instanceof Promesa) {
                    return result.then(resolve, reject)
                }
                // Si no es una promesa, simplemente resolvemos con el resultado.
                return resolve(result)
            } catch (promesa) {
                // Si el estado es `REJECTED` o si hay algún error, capturamos y ejecutamos `onRejected`.
                if (typeof onRejected !== 'function') {
                    return reject(promesa.value)
                }
                // Ejecutamos `onRejected` con el valor de la promesa si es una función.
                const result = onRejected(promesa.value)
                // Si el resultado es otra promesa, encadenamos `catch` para manejarla.
                if (result instanceof Promesa) {
                    return result.catch(reject)
                }
                // Si no es una promesa, rechazamos con el resultado.
                return reject(result)
            }
        }
        // Si el estado de la promesa es `PENDING`, almacenamos los callbacks para ejecutarlos más tarde.
        if (this.state === STATE.PENDING) {
            this.fulfilledCallbacks.push(handleCallback) // Almacena el callback para cuando la promesa se cumpla.
            this.rejectedCallbacks.push(handleCallback)  // Almacena el callback para cuando la promesa sea rechazada.
        } else {
            // Si la promesa ya ha sido resuelta o rechazada, ejecutamos el callback de inmediato.
            handleCallback(this)
        }
    })
}
```
### Explicación:   
- Si la promesa está en estado `PENDING`, los callbacks se almacenan en arrays (`fulfilledCallbacks` o `rejectedCallbacks`).
- Si la promesa ya está resuelta o rechazada, los callbacks se ejecutan de inmediato.
- El método `then` retorna una nueva promesa, lo que permite encadenar operaciones asíncronas.
- Si el valor devuelto por el callback `onFulfilled` o `onRejected` es otra promesa, el encadenamiento continua usando la promesa devuelta.

## Método `catch`
El método catch es simplemente una conveniencia para manejar errores. Se comporta de manera similar a `then`, pero solo recibe la función `onRejected`.

### Argumentos:   
- **onRejected**: Función que se ejecuta cuando la promesa es rechazada. Recibe la razón del rechazo.

```js
// Método `catch`, que es una forma de manejar los errores de la promesa.
this.catch = (onRejected) => {
    // Simplemente llamamos a `then` con `undefined` para `onFulfilled` y pasamos `onRejected`.
    return this.then(undefined, onRejected)
}
```
### Explicación:   
El método catch es equivalente a llamar a `then` con `undefined` como primer argumento, de forma que solo se maneja el caso en que la promesa sea rechazada.

## Conclusión
La implementación manual del objeto Promise en JavaScript ofrece una visión clara de cómo funcionan las promesas y su gestión de estados. Al entender esta estructura, puedes desarrollar una mejor comprensión de cómo manejar la programación asíncrona en JavaScript, lo cual es fundamental en el desarrollo moderno de aplicaciones.

### Probar en Local
Para probar esta implementación en tu entorno local, simplemente abre una terminal en la raiz del proyecto. Luego, ejecuta el siguiente comando para iniciar un servidor local:

```bash
npx http-server .
```