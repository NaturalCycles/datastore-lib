## [3.2.3](https://github.com/NaturalCycles/datastore-lib/compare/v3.2.2...v3.2.3) (2019-11-09)


### Bug Fixes

* createTable ([c509e75](https://github.com/NaturalCycles/datastore-lib/commit/c509e758de4acac3e2416857f166107a434505b6))

## [3.2.2](https://github.com/NaturalCycles/datastore-lib/compare/v3.2.1...v3.2.2) (2019-11-08)


### Bug Fixes

* getTableSchema was missing `id` ([e080b28](https://github.com/NaturalCycles/datastore-lib/commit/e080b281635f182290312219fc7655288e05a682))

## [3.2.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.2.0...v3.2.1) (2019-11-08)


### Bug Fixes

* getTableSchema type merging ([3c41101](https://github.com/NaturalCycles/datastore-lib/commit/3c41101bece3f65499c19a4b8e9884dab6f5ec1e))

# [3.2.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.1.0...v3.2.0) (2019-11-07)


### Features

* implement getTables(), getTableSchema() ([1e5aa6b](https://github.com/NaturalCycles/datastore-lib/commit/1e5aa6b435217075c503aab243c140bef4af4feb))

# [3.1.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.0.1...v3.1.0) (2019-11-04)


### Features

* allow passing custom grpc object to constructor ([a9e08e3](https://github.com/NaturalCycles/datastore-lib/commit/a9e08e3f382bd0ce15ae11a6d1878072bf497acf)), closes [/github.com/googleapis/nodejs-pubsub/issues/770#issuecomment-541226361](https://github.com//github.com/googleapis/nodejs-pubsub/issues/770/issues/issuecomment-541226361)

## [3.0.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.0.0...v3.0.1) (2019-11-04)


### Bug Fixes

* provide empty getTable() implementation ([1b3658b](https://github.com/NaturalCycles/datastore-lib/commit/1b3658bcf45f8cf10e07b274dab7023cf499d579))

# [3.0.0](https://github.com/NaturalCycles/datastore-lib/compare/v2.0.2...v3.0.0) (2019-11-02)


### Features

* adapt to db-lib@3 ([aa78fd1](https://github.com/NaturalCycles/datastore-lib/commit/aa78fd1240e9de1fef8ce52e4ec0c7f16ecfc114))


### BREAKING CHANGES

* ^^^

## [2.0.2](https://github.com/NaturalCycles/datastore-lib/compare/v2.0.1...v2.0.2) (2019-10-20)


### Bug Fixes

* adapt to db-lib ([22949ca](https://github.com/NaturalCycles/datastore-lib/commit/22949ca))

## [2.0.1](https://github.com/NaturalCycles/datastore-lib/compare/v2.0.0...v2.0.1) (2019-10-19)


### Bug Fixes

* use Readable ([0935cb0](https://github.com/NaturalCycles/datastore-lib/commit/0935cb0))

# [2.0.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.12.2...v2.0.0) (2019-10-19)


### Features

* implement CommonDB 2.0 ([dfe0992](https://github.com/NaturalCycles/datastore-lib/commit/dfe0992))


### BREAKING CHANGES

* ^^^

## [1.12.2](https://github.com/NaturalCycles/datastore-lib/compare/v1.12.1...v1.12.2) (2019-09-21)


### Bug Fixes

* adapt db-lib ([c12a6df](https://github.com/NaturalCycles/datastore-lib/commit/c12a6df))

## [1.12.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.12.0...v1.12.1) (2019-09-21)


### Bug Fixes

* adapt db-lib ([7b316e1](https://github.com/NaturalCycles/datastore-lib/commit/7b316e1))

# [1.12.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.11.1...v1.12.0) (2019-09-19)


### Features

* adapt to db-lib ([2b38927](https://github.com/NaturalCycles/datastore-lib/commit/2b38927))

## [1.11.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.11.0...v1.11.1) (2019-09-19)


### Bug Fixes

* make runQueryStream public ([f8f18ed](https://github.com/NaturalCycles/datastore-lib/commit/f8f18ed))

# [1.11.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.10.1...v1.11.0) (2019-09-19)


### Bug Fixes

* return await ([ce1b4d4](https://github.com/NaturalCycles/datastore-lib/commit/ce1b4d4))


### Features

* adopt to CommonDB RunQueryResult ([188c935](https://github.com/NaturalCycles/datastore-lib/commit/188c935))
* move getStats to Dao ([2851c4f](https://github.com/NaturalCycles/datastore-lib/commit/2851c4f))
* use db-lib ([f6826cd](https://github.com/NaturalCycles/datastore-lib/commit/f6826cd))

## [1.10.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.10.0...v1.10.1) (2019-07-29)


### Bug Fixes

* allow empty datastoreOptions (for GAE env) ([2ca8464](https://github.com/NaturalCycles/datastore-lib/commit/2ca8464))

# [1.10.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.9.2...v1.10.0) (2019-07-16)


### Features

* deps ([fb42b87](https://github.com/NaturalCycles/datastore-lib/commit/fb42b87))

## [1.9.2](https://github.com/NaturalCycles/datastore-lib/compare/v1.9.1...v1.9.2) (2019-07-04)


### Bug Fixes

* anonymize only DBM ([9897ea6](https://github.com/NaturalCycles/datastore-lib/commit/9897ea6))

## [1.9.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.9.0...v1.9.1) (2019-07-03)


### Bug Fixes

* anonymize signature ([4ed12bd](https://github.com/NaturalCycles/datastore-lib/commit/4ed12bd))

# [1.9.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.8.0...v1.9.0) (2019-07-03)


### Features

* allow to anonymize all ModelTypes ([a87480e](https://github.com/NaturalCycles/datastore-lib/commit/a87480e))

# [1.8.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.7.0...v1.8.0) (2019-07-03)


### Features

* dao anonymization hook ([3160ca0](https://github.com/NaturalCycles/datastore-lib/commit/3160ca0))

# [1.7.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.6.1...v1.7.0) (2019-06-25)


### Features

* implements runQueryStream in MemoryService ([0ececa4](https://github.com/NaturalCycles/datastore-lib/commit/0ececa4))

## [1.6.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.6.0...v1.6.1) (2019-06-20)


### Bug Fixes

* allow null to be used in filters as negation ([93b971b](https://github.com/NaturalCycles/datastore-lib/commit/93b971b))

# [1.6.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.5.1...v1.6.0) (2019-06-17)


### Features

* adds support for multiple filters ([dbfaa83](https://github.com/NaturalCycles/datastore-lib/commit/dbfaa83))

## [1.5.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.5.0...v1.5.1) (2019-05-27)


### Bug Fixes

* console.log ([4a29620](https://github.com/NaturalCycles/datastore-lib/commit/4a29620))

# [1.5.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.4.0...v1.5.0) (2019-05-27)


### Features

* MemoryService to support streamQuery, select, limit ([9ac0610](https://github.com/NaturalCycles/datastore-lib/commit/9ac0610))

# [1.4.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.3.0...v1.4.0) (2019-05-19)


### Features

* bump deps, adopt ([68ab3fd](https://github.com/NaturalCycles/datastore-lib/commit/68ab3fd))

# [1.3.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.2.1...v1.3.0) (2019-05-02)


### Features

* update deps ([8ec7a82](https://github.com/NaturalCycles/datastore-lib/commit/8ec7a82))

## [1.2.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.2.0...v1.2.1) (2019-04-25)


### Bug Fixes

* remove redundant try/catch that had a bug with window.name ([1e3cf48](https://github.com/NaturalCycles/datastore-lib/commit/1e3cf48))

# [1.2.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.1.1...v1.2.0) (2019-04-22)


### Features

* upgrade ([7e6ea9f](https://github.com/NaturalCycles/datastore-lib/commit/7e6ea9f))

## [1.1.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.1.0...v1.1.1) (2019-03-23)


### Bug Fixes

* export DBRelation ([bde321b](https://github.com/NaturalCycles/datastore-lib/commit/bde321b))

# [1.1.0](https://github.com/NaturalCycles/datastore-lib/compare/v1.0.3...v1.1.0) (2019-03-23)


### Features

* DBRelation ([23bd5ce](https://github.com/NaturalCycles/datastore-lib/commit/23bd5ce))

## [1.0.3](https://github.com/NaturalCycles/datastore-lib/compare/v1.0.2...v1.0.3) (2019-03-09)


### Bug Fixes

* upgrade js-lib, nodejs-lib ([cc92227](https://github.com/NaturalCycles/datastore-lib/commit/cc92227))

## [1.0.2](https://github.com/NaturalCycles/datastore-lib/compare/v1.0.1...v1.0.2) (2019-03-08)


### Bug Fixes

* types ([b0afeaa](https://github.com/NaturalCycles/datastore-lib/commit/b0afeaa))

## [1.0.1](https://github.com/NaturalCycles/datastore-lib/compare/v1.0.0...v1.0.1) (2019-03-08)


### Bug Fixes

* export types and src ([d64878c](https://github.com/NaturalCycles/datastore-lib/commit/d64878c))

# 1.0.0 (2019-03-08)


### Features

* initial version ([0b61708](https://github.com/NaturalCycles/datastore-lib/commit/0b61708))
