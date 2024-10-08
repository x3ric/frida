# @frida/terser

Frida-optimized fork of https://github.com/terser/terser.

The main differences are:

- Synchronous API, allowing warm-up when creating a V8 snapshot.
- No DOM functionality, for a smaller footprint.
