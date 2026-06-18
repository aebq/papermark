// Generic stub for unpublished EE modules in OSS/self-host builds.
// The Proxy target must be a *regular* (constructable) function: React's
// server renderer may treat a stub as a class component and call `new c()`,
// which throws "is not a constructor" if the target is an arrow function.
function noop() {
  return null;
}
const stub = new Proxy(noop, {
  get: () => stub,
  apply: () => null,
  construct: () => stub,
});
module.exports = stub;
