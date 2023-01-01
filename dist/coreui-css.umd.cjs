(function(factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function() {
  "use strict";
  const coreui = "";
  document.querySelector("#app").innerHTML = `
  <div class="app">
	<header class="app__header"></header>
	<main class="app__main">
		<div class="kitchensink">asdasd</div>
	</main>
	<footer class="app__footer"></footer>
  </div>
`;
});
