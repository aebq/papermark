const noop = () => null;
const stub = new Proxy(noop, {
  get: () => stub,
  apply: () => null,
  construct: () => stub,
});
module.exports = stub;
