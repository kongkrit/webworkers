(function (root) {

  function myAdd(a, b) {
	return a+b;
  }
  
  function myAddPlus(a, b) {
	return a+b+1;
  }
  
  function myFormula(a, b, c) {
	return (a+1)*(b+1)*(c+1);
  }
  
  root.libs1 = root.libs1 || {};
  root.libs1.myAdd = myAdd;
  root.libs1.myAddPlus = myAddPlus;
  root.libs1.myFormula = myFormula;
})(globalThis);