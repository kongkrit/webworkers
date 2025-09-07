# webworkers
Learning about using the same IIFE in both embedded JS and as workers.

`libs1.js` and `libs2.js` can be used either in web page or in workers.
`worker.js` connects to exposed workers in `libs1.js` and `libs2.js`
`index.js` uses `worker.js` to do the work.

`libs1.js` are sychronous `function`s are `async function`s.
`worker.js` can handle both synchronous and async `function`s.
when defining `async function`, this worker enforces that you must declare `supportsProgress` and `exlusive` flags
- `supportsProgress` tells whether the `async function` can emit how far processing has been completed.
- `exclusive` tells whether worker should cancel other pending jobs from the same function call or not.
