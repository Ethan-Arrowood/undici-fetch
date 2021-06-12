'use strict'

const tap = require('tap')
const { binarySearch } = require('../../src/utils')

tap.test('binary search', t => {
  //           0   1   2   3   4   5   6   7
  const l1 = ['b', 1, 'c', 2, 'd', 3, 'f', 4]
  //           0   1   2   3   4   5   6   7   8   9
  const l2 = ['b', 1, 'c', 2, 'd', 3, 'e', 4, 'g', 5]
  //           0   1   2   3    4    5   6   7
  const l3 = ['a', 1, 'b', 2, 'bcd', 3, 'c', 4]
  //           0   1   2   3   4   5    6    7   8   9
  const l4 = ['a', 1, 'b', 2, 'c', 3, 'cde', 4, 'f', 5]

  const tests = [
    { input: [l1, 'c'], expected: 2, message: 'find item in n=even array' },
    { input: [l1, 'f'], expected: 6, message: 'find item at end of n=even array' },
    { input: [l1, 'b'], expected: 0, message: 'find item at beg of n=even array' },
    { input: [l1, 'e'], expected: 6, message: 'find new item position in n=even array' },
    { input: [l1, 'g'], expected: 8, message: 'find new item position at end of n=even array' },
    { input: [l1, 'a'], expected: 0, message: 'find new item position at beg of n=even array' },
    { input: [l2, 'c'], expected: 2, message: 'find item in n=odd array' },
    { input: [l2, 'g'], expected: 8, message: 'find item at end of n=odd array' },
    { input: [l2, 'b'], expected: 0, message: 'find item at beg of n=odd array' },
    { input: [l2, 'f'], expected: 8, message: 'find new item position in n=odd array' },
    { input: [l2, 'h'], expected: 10, message: 'find new item position at end of n=odd array' },
    { input: [l2, 'a'], expected: 0, message: 'find new item position at beg of n=odd array' },
    { input: [l3, 'b'], expected: 2, message: 'find item with similarity in n=odd array' },
    { input: [l3, 'bcd'], expected: 4, message: 'find item with similarity in n=odd array' },
    { input: [l4, 'c'], expected: 4, message: 'find item with similarity in n=odd array' },
    { input: [l4, 'cde'], expected: 6, message: 'find item with similarity in n=odd array' }
  ]

  t.plan(tests.length)

  tests.forEach(({ input: [list, target], expected, message }) => {
    t.equal(expected, binarySearch(list, target), message)
  })
})

// Use this for a nice console output when debugging
// const results = tests.map(({ input: [list, target], expected, message }) => {
//   const found = binarySearch(list, target)
//   return {
//     testCase: message,
//     expected: expected,
//     found: found,
//     pass: expected === found
//   }
// })

// console.table(results)
