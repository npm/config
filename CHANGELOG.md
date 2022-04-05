# Changelog

### [4.0.2](https://github.com/npm/config/compare/v4.0.1...v4.0.2) (2022-04-05)


### Bug Fixes

* replace deprecated String.prototype.substr() ([#59](https://github.com/npm/config/issues/59)) ([43893b6](https://github.com/npm/config/commit/43893b638f82ade945cba27fe9e483b32eea99ae))


### Dependencies

* bump ini from 2.0.0 to 3.0.0 ([#60](https://github.com/npm/config/issues/60)) ([965e2a4](https://github.com/npm/config/commit/965e2a40c7649ffd6e84fb83823a2b751bcda294))
* update @npmcli/map-workspaces requirement from ^2.0.1 to ^2.0.2 ([#49](https://github.com/npm/config/issues/49)) ([9a0f182](https://github.com/npm/config/commit/9a0f182c4fa46dadccc631a244678a3c469ad63a))

### [4.0.1](https://www.github.com/npm/config/compare/v4.0.0...v4.0.1) (2022-03-02)


### Bug Fixes

* skip workspace detection when in global mode ([#47](https://www.github.com/npm/config/issues/47)) ([bedff61](https://www.github.com/npm/config/commit/bedff61c6f074f21c1586afe391dc2cb6e821619))


### Dependencies

* update @npmcli/map-workspaces requirement from ^2.0.0 to ^2.0.1 ([#43](https://www.github.com/npm/config/issues/43)) ([c397ab8](https://www.github.com/npm/config/commit/c397ab88c459fc477ae9094ec0ee0b571e6bb8ed))

## [4.0.0](https://www.github.com/npm/config/compare/v3.0.1...v4.0.0) (2022-02-14)


### ⚠ BREAKING CHANGES

* drop support for the `log` option

### Features

* remove `log` option ([#40](https://www.github.com/npm/config/issues/40)) ([bbf5128](https://www.github.com/npm/config/commit/bbf512818f30d0764e3951449c8f07856d70991e))


### Bug Fixes

* correct a polynomial regex ([#39](https://www.github.com/npm/config/issues/39)) ([9af098f](https://www.github.com/npm/config/commit/9af098fb874c1a8122ab7a5e009235a1f7df72f5))

### [3.0.1](https://www.github.com/npm/config/compare/v3.0.0...v3.0.1) (2022-02-10)


### Dependencies

* update semver requirement from ^7.3.4 to ^7.3.5 ([2cb225a](https://www.github.com/npm/config/commit/2cb225a907180a3b569c8c9baf23da1a989a2f1f))
* use proc-log instead of process.emit ([fd4cd42](https://www.github.com/npm/config/commit/fd4cd429ef875ce68aa0be9bba329cae4e7adfe3))

## [3.0.0](https://www.github.com/npm/config/compare/v2.4.0...v3.0.0) (2022-02-01)


### ⚠ BREAKING CHANGES

* this drops support for node10 and non-LTS versions of node12 and node14

### Features

* automatically detect workspace roots ([#28](https://www.github.com/npm/config/issues/28)) ([a3dc623](https://www.github.com/npm/config/commit/a3dc6234d57c7c80c66a8c33e17cf1d97f86f8d9))


### Bug Fixes

* template-oss ([#29](https://www.github.com/npm/config/issues/29)) ([6440fba](https://www.github.com/npm/config/commit/6440fba6e04b1f87e57b4c2ccc5ea84d8a69b823))
