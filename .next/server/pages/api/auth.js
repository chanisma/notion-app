"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/auth";
exports.ids = ["pages/api/auth"];
exports.modules = {

/***/ "(api)/./pages/api/auth.js":
/*!***************************!*\
  !*** ./pages/api/auth.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\nfunction handler(req, res) {\n    const client_id = process.env.NOTION_CLIENT_ID;\n    const redirect_uri = process.env.NOTION_REDIRECT_URI;\n    if (!client_id || !redirect_uri) {\n        return res.status(500).send(\"❌ 환경변수 누락: NOTION_CLIENT_ID 또는 REDIRECT_URI가 없음\");\n    }\n    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${client_id}&response_type=code&owner=user&redirect_uri=${redirect_uri}`;\n    res.redirect(notionAuthUrl);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvYXV0aC5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQWUsU0FBU0EsUUFBUUMsR0FBRyxFQUFFQyxHQUFHO0lBQ3RDLE1BQU1DLFlBQVlDLFFBQVFDLEdBQUcsQ0FBQ0MsZ0JBQWdCO0lBQzlDLE1BQU1DLGVBQWVILFFBQVFDLEdBQUcsQ0FBQ0csbUJBQW1CO0lBRXBELElBQUksQ0FBQ0wsYUFBYSxDQUFDSSxjQUFjO1FBQy9CLE9BQU9MLElBQUlPLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7SUFDOUI7SUFFQSxNQUFNQyxnQkFBZ0IsQ0FBQyxvREFBb0QsRUFBRVIsVUFBVSw0Q0FBNEMsRUFBRUksYUFBYSxDQUFDO0lBQ25KTCxJQUFJVSxRQUFRLENBQUNEO0FBQ2YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ub3Rpb24tYXBwLy4vcGFnZXMvYXBpL2F1dGguanM/NWFkYyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XHJcbiAgY29uc3QgY2xpZW50X2lkID0gcHJvY2Vzcy5lbnYuTk9USU9OX0NMSUVOVF9JRDtcclxuICBjb25zdCByZWRpcmVjdF91cmkgPSBwcm9jZXNzLmVudi5OT1RJT05fUkVESVJFQ1RfVVJJO1xyXG5cclxuICBpZiAoIWNsaWVudF9pZCB8fCAhcmVkaXJlY3RfdXJpKSB7XHJcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCLinYwg7ZmY6rK967OA7IiYIOuIhOudvTogTk9USU9OX0NMSUVOVF9JRCDrmJDripQgUkVESVJFQ1RfVVJJ6rCAIOyXhuydjFwiKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IG5vdGlvbkF1dGhVcmwgPSBgaHR0cHM6Ly9hcGkubm90aW9uLmNvbS92MS9vYXV0aC9hdXRob3JpemU/Y2xpZW50X2lkPSR7Y2xpZW50X2lkfSZyZXNwb25zZV90eXBlPWNvZGUmb3duZXI9dXNlciZyZWRpcmVjdF91cmk9JHtyZWRpcmVjdF91cml9YDtcclxuICByZXMucmVkaXJlY3Qobm90aW9uQXV0aFVybCk7XHJcbn1cclxuIl0sIm5hbWVzIjpbImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJjbGllbnRfaWQiLCJwcm9jZXNzIiwiZW52IiwiTk9USU9OX0NMSUVOVF9JRCIsInJlZGlyZWN0X3VyaSIsIk5PVElPTl9SRURJUkVDVF9VUkkiLCJzdGF0dXMiLCJzZW5kIiwibm90aW9uQXV0aFVybCIsInJlZGlyZWN0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./pages/api/auth.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/auth.js"));
module.exports = __webpack_exports__;

})();