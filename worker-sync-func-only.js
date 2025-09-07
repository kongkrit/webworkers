// worker.js
// Load the same libs.js inside the worker (classic worker)
importScripts('libs1.js'); // exposes libs on globalThis
importScripts('libs2.js');

// Whitelist of functions this worker is allowed to run.
// Add more functions here as needed.
const allowed = {
  myAddPlus: self.libs1.myAddPlus,
  myFormula: self.libs1.myFormula,
  myCat    : self.libs2.myCat,
};

// Message format expected from main thread:
// { id: "unique-id", fn: "myAddPlus", args: [a, b] }
self.onmessage = (e) => {
  const msg = e.data || {};
  const { id, fn, args = [] } = msg;

  if (typeof fn !== 'string' || !(fn in allowed)) {
    self.postMessage({
      id,
      ok: false,
      error: `Unknown or disallowed function: ${fn}`,
    });
    return;
  }

  try {
    // Call the whitelisted function with positional args
    const result = allowed[fn](...args);
    self.postMessage({
      id,
      ok: true,
      result,
    });
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      error: String(err),
    });
  }
};
