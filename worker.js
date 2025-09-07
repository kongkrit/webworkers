// worker.js
importScripts('libs1.js');
importScripts('libs2.js');

// Whitelist of functions this worker is allowed to run.
// Add more functions here as needed.
const allowed = {
  myAddPlus: self.libs1.myAddPlus,
  myFormula: self.libs1.myFormula,
  myFF     : self.libs2.myFF,
  myTT     : self.libs2.myTT,
  myTF     : self.libs2.myTF,
  myFT     : self.libs2.myFT,
};

const controllers = {};
const activeJobs = {};

self.onmessage = async (e) => {
  const { id, fn, args = [] } = e.data || {};
  if (typeof fn !== "string" || !(fn in allowed)) {
    self.postMessage({ id, ok:false, error:`Unknown or disallowed function: ${fn}` });
    return;
  }

  try {
    const target = allowed[fn];
    const isAsync = target.constructor.name === "AsyncFunction";

    // For sync functions: just run; flags are irrelevant.
    if (!isAsync) {
      const result = target(...args);
      self.postMessage({ id, ok:true, result });
      return;
    }

    // For async functions: both flags must exist and be boolean.
    if (typeof target.supportsProgress !== "boolean" || typeof target.exclusive !== "boolean") {
      self.postMessage({id, ok:false,
        error: `Async function "${fn}" must define boolean supportsProgress and exclusive.`,
      });
      return;
    }

    const { supportsProgress, exclusive } = target;

    // Cancellation & token (soft-cancel) setup
    let controller = new AbortController();
    let signal = controller.signal;

    if (exclusive) {
      if (controllers[fn]) controllers[fn].abort();
      controllers[fn] = controller;
    }

    // Only create/record a token when exclusive
    let token;
    if (exclusive) {
      token = Symbol(fn);
      activeJobs[fn] = token;
    }

    // Progress callback: guard only when exclusive
    const onProgress = (progress) => {
      if (exclusive && activeJobs[fn] !== token) return; // soft-cancel guard only for exclusive
      self.postMessage({ id, ok: true, progress, partial: true });
    };

    // Standardized arg order: (...args, signal, onProgress?)
    const callArgs = supportsProgress ? [...args, signal, onProgress] : [...args, signal];
    const result = await target(...callArgs);

    // Final send: guard only when exclusive
    if (exclusive) {
      if (activeJobs[fn] !== token) return;   // soft-cancel guard only for exclusive
      if (signal.aborted) return;             // hard-cancel guard only matters for exclusive
    }
	
	self.postMessage({ id, ok: true, result });
	if (exclusive && activeJobs[fn] === token) delete activeJobs[fn];
	
  } catch (err) {
    self.postMessage({ id, ok:false, error:String(err) });
  }
};