// Stub no-op pour les modules ee/ non publiés (self-host OSS).
// CommonJS volontaire : satisfait default + n'importe quel import nommé.
const noop = () => null;

const stub = new Proxy(noop, {
  get: () => stub,
  apply: () => null,
});

module.exports = stub;
