const fetch = require('./fetch')
const nodeFetch = require('node-fetch')

// ;(async () => {
//   const res = await fetch('https://httpbin.org/get')
//   // const text = await res.text()
//   // console.log(text)

//   const json = await res.json()
//   console.log(json)

//   const nodeRes = await nodeFetch('https://httpbin.org/get')

//   // const nodeText = await nodeRes.text()
//   // console.log(nodeText)

//   const nodeJSON = await nodeRes.json()
//   console.log(nodeJSON)
// })()

;(async () => {
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    body: JSON.stringify({
      foo: 'bar'
    })
  })
  const text = await res.text()
  console.log(text)

  // const json = await res.json()
  // console.log(json)

  const nodeRes = await nodeFetch('https://httpbin.org/post', {
    method: 'POST',
    body: JSON.stringify({
      foo: 'bar'
    })
  })

  const nodeText = await nodeRes.text()
  console.log(nodeText)

  // const nodeJSON = await nodeRes.json()
  // console.log(nodeJSON)
})()
