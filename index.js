// index.js
// Assumes the script runs after the DOM is parsed (e.g., at end of <body> or with `defer`).

// 1) Cache DOM references
const aEl = document.getElementById('a');
const bEl = document.getElementById('b');
const cEl = document.getElementById('c');
const resultEl1 = document.getElementById('result1');
const resultEl2 = document.getElementById('result2');
const resultEl3 = document.getElementById('result3');
const resultEl4 = document.getElementById('result4');
const resultEl5 = document.getElementById('result5');
const resultEl6 = document.getElementById('result6');
const resultEl7 = document.getElementById('result7');

// 2) Start worker (classic worker that imports libs.js)
const myWorker = new Worker('worker.js');

// 3) Generic RPC response handler from worker
myWorker.onmessage = (e) => {
  const { id, ok, result, error, progress, partial } = e.data || {};
  if (!ok) { console.error('Worker error for', id, error); return; }

  if      (id === 'sumPlus') resultEl2.textContent = result;
  else if (id === 'formula') resultEl3.textContent = result;
  else if (id === 'FF')      resultEl4.textContent = result;
  else if (id === 'FT')      resultEl5.textContent = result;
  else if (id === 'TF')      resultEl6.textContent = partial ? `Processing... ${progress}%` : result;
  else if (id === 'TT')      resultEl7.textContent = partial ? `Processing... ${progress}%` : result;
};

// Helper: coerce to number (default 0 for empty/NaN)
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// 4) Single source of truth: one function does everything
function computeAndRender() {
  const a = num(aEl.value);
  const b = num(bEl.value);
  const c = num(cEl.value);

  // Main-thread calc (fast, DOM-safe)
  const sum1 = libs1.myAdd(a, b);
  resultEl1.textContent = sum1;

  // Offload heavier/parallelizable work to worker (non-blocking)
  myWorker.postMessage({ id: 'sumPlus', fn: 'myAddPlus', args: [a, b] });
  myWorker.postMessage({ id: 'formula', fn: 'myFormula', args: [a, b, c] });
  myWorker.postMessage({ id: 'FF',      fn: 'myFF',      args: [a, b] });
  myWorker.postMessage({ id: 'FT',      fn: 'myFT',      args: [a, b] });
  myWorker.postMessage({ id: 'TF',      fn: 'myTF',      args: [a, b] });
  myWorker.postMessage({ id: 'TT',      fn: 'myTT',      args: [a, b] });
}

// 5) Wire UI -> logic (no duplication)
aEl.addEventListener('input', computeAndRender);
bEl.addEventListener('input', computeAndRender);
cEl.addEventListener('input', computeAndRender);

// 6) Run once on load to reflect defaults from the DOM
computeAndRender();
