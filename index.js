import { Promesa } from './promesa.js'

window.fetch =  function (url) {
    return new Promesa((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText))
            } else {
                reject(new Error(`Error: ${xhr.status}`))
            }
        };
        xhr.onerror = () => {
            reject(new Error('Network Error'))
        }
        xhr.send()
    })
}