# JavaScript regression tests

This isolated fixture uses Node.js 16 or newer, React and react-test-renderer
16.14.0, prop-types 15.8.1, and Babel standalone 7.29.9. It avoids installing or
executing the legacy root development tools or wildcard React Native peer.

From the repository root:

```sh
npm ci --prefix test --ignore-scripts --no-audit --no-fund
npm run test:regression
```

The runner starts separate development and production processes. It transpiles
the actual JSX source, uses the real React renderer and prop-types package, and
supplies in-memory React Native host doubles. Coverage includes defaults, every
primitive validator, both container branches, visibility transitions, style
composition, Modal rest props, and callback identity/invocation.

These tests do not establish native Android/iOS rendering, event timing, or
compatibility with all versions admitted by the existing wildcard peers.

To check a packed package installed in a separate consumer with the same fixture
and that consumer's resolved prop-types:

```sh
SPINNER_TEST_SOURCE=/absolute/path/to/consumer/node_modules/nanokit-spinner-overlay/index.js \
SPINNER_TEST_RUNTIME=/absolute/path/to/consumer npm run test:regression
```

The package's published entry remains untranspiled JSX/ES modules. Consumers
still need a compatible React Native bundler. The root `npm test` command is a
legacy placeholder whose `pretest` runs a mutating formatter; it is separate
from this behavioral suite. The `test` directory is not in the published files
whitelist, and this fixture does not change runtime dependencies or peers.
