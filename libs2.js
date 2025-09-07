(function (root) {

  // helper: async sleep
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function myFF(a, b, signal) {
	await sleep(2000);
	if (signal?.aborted) return;
	return `${a}+${b}`;
  }
  myFF.supportsProgress = false;
  myFF.exclusive = false;
  
  async function myTT(a, b, signal, onProgress) {
    const total = 4000;
    const step = 500;

    if (typeof onProgress === "function") onProgress(0);
    for (let elapsed = 0; elapsed < total; elapsed += step) {
	  // Check if aborted before each step
      if (signal?.aborted) return;
	  
      await sleep(step);
      if (typeof onProgress === "function") {
        onProgress(Math.round(((elapsed + step) / total) * 100));
      }
    }
	
	if (signal?.aborted) return; // Final check before resolve
    return `${a}-${b}`;
  }
  myTT.supportsProgress = true;
  myTT.exclusive = true;
  
  // --- myTF (always allowed multiple concurrent runs) ---
  async function myTF(a, b, signal, onProgress) {
    const total = 4000;
    const step = 500;
    if (typeof onProgress === "function") onProgress(0);
    for (let elapsed = 0; elapsed < total; elapsed += step) {
      if (signal?.aborted) return;

      await sleep(step);

      if (typeof onProgress === "function") {
        onProgress(Math.round(((elapsed + step) / total) * 100));
      }
    }

    if (signal?.aborted) return;
    return `${a}+${b}`;
  }
  myTF.supportsProgress = true;
  myTF.exclusive = false;
  
  async function myFT(a, b, signal) {
	await sleep(2000);
	if (signal?.aborted) return;
	return `${a}-${b}`;
  }
  myFT.supportsProgress = false;
  myFT.exclusive = true;

  root.libs2 = root.libs2 || {};
  root.libs2.myFF = myFF;
  root.libs2.myTT = myTT;
  root.libs2.myTF = myTF;
  root.libs2.myFT = myFT;
})(globalThis);