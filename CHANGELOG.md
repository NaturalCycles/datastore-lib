# [3.15.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.14.1...v3.15.0) (2021-10-07)


### Features

* experimentalCursorStream mode to fix backpressure ([419f8e1](https://github.com/NaturalCycles/datastore-lib/commit/419f8e16ccb9722771a01b90001ae19f2a7a8595))

## [3.14.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.14.0...v3.14.1) (2021-10-04)


### Bug Fixes

* adapt to db-lib ([78f7a81](https://github.com/NaturalCycles/datastore-lib/commit/78f7a81b3fc2bf263e9164a6478fb2d0c0ea9869))

# [3.14.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.13.0...v3.14.0) (2021-10-04)


### Features

* support $id=`${table}.schema.json` ([afe235d](https://github.com/NaturalCycles/datastore-lib/commit/afe235d2c1e556a34391f241517f87f6c52f57de))

# [3.13.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.12.2...v3.13.0) (2021-10-01)


### Features

* adapt to db-lib (return jsonSchema instead of CommonSchema) ([8065764](https://github.com/NaturalCycles/datastore-lib/commit/8065764e2f93ee981c1bbb5b98b50a2a965fb0c7))

## [3.12.2](https://github.com/NaturalCycles/datastore-lib/compare/v3.12.1...v3.12.2) (2021-08-24)


### Bug Fixes

* deps, adapt KeyValueDB implementation ([6ef0538](https://github.com/NaturalCycles/datastore-lib/commit/6ef0538873f9e02b1b7fc5e380b6be10ea38e436))

## [3.12.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.12.0...v3.12.1) (2021-08-05)


### Bug Fixes

* throw explicit error on missing `id` when doing saveBatch ([1a2f29e](https://github.com/NaturalCycles/datastore-lib/commit/1a2f29e57f20d95004d2cd6a79f9f9eafe26cf56))

# [3.12.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.11.1...v3.12.0) (2021-07-04)


### Features

* DatastoreKeyValueDB ([d03ac8c](https://github.com/NaturalCycles/datastore-lib/commit/d03ac8c6a8febba6b5b43fe373433f15ac2659d6))

## [3.11.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.11.0...v3.11.1) (2021-05-22)


### Bug Fixes

* adopt eslint ([123f16c](https://github.com/NaturalCycles/datastore-lib/commit/123f16cb913e0df0f45c5c3266af01463c467217))

# [3.11.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.10.0...v3.11.0) (2021-03-18)


### Features

* also retry on UNKNOWN errors ([a916386](https://github.com/NaturalCycles/datastore-lib/commit/a9163866e3d87963c0c2b389079e05af4c6d56a6))

# [3.10.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.9.2...v3.10.0) (2021-03-01)


### Features

* also retry on UNAVAILABLE ([fb4bfdc](https://github.com/NaturalCycles/datastore-lib/commit/fb4bfdc57224f9753ef40e1db682615f172c19d7))

## [3.9.2](https://github.com/NaturalCycles/datastore-lib/compare/v3.9.1...v3.9.2) (2021-02-23)


### Bug Fixes

* tune pRetry options for .saveBatch, GOAWAY test passes now! ([cac1ece](https://github.com/NaturalCycles/datastore-lib/commit/cac1ecec29afaf3bb38e382d481b09a2977c1eea))

## [3.9.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.9.0...v3.9.1) (2021-02-23)


### Bug Fixes

* unnecessary await in .saveBatch ([12b1b75](https://github.com/NaturalCycles/datastore-lib/commit/12b1b7528383fbf9406d91515008c51d4a08a807))

# [3.9.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.8.6...v3.9.0) (2021-02-23)


### Bug Fixes

* modernize ([2a4eac5](https://github.com/NaturalCycles/datastore-lib/commit/2a4eac5e521a6dc7da073e0f0d8df17df776a03d))


### Features

* retry on GOAWAY in .saveBatch (experimental) ([e381ed5](https://github.com/NaturalCycles/datastore-lib/commit/e381ed58d2999b86f2035479bfbc9b759a07aa05))

## [3.8.6](https://github.com/NaturalCycles/datastore-lib/compare/v3.8.5...v3.8.6) (2020-11-10)


### Bug Fixes

* use Key type from Datastore that is properly exported now ([931e978](https://github.com/NaturalCycles/datastore-lib/commit/931e97861f5075971fc3d1a5fa971f64197fefcc))

## [3.8.5](https://github.com/NaturalCycles/datastore-lib/compare/v3.8.4...v3.8.5) (2020-11-05)


### Bug Fixes

* adapt to db-lib ([f0e6da9](https://github.com/NaturalCycles/datastore-lib/commit/f0e6da9b93111caec0a0178c936a16dbeacf04e2))

## [3.8.4](https://github.com/NaturalCycles/datastore-lib/compare/v3.8.3...v3.8.4) (2020-10-25)


### Bug Fixes

* adapt to recent db-lib (map '==' operator to '=') ([8e36412](https://github.com/NaturalCycles/datastore-lib/commit/8e36412abbc15ed6ec0132124fa811b8393de06f))

## [3.8.3](https://github.com/NaturalCycles/datastore-lib/compare/v3.8.2...v3.8.3) (2020-10-12)


### Bug Fixes

* support db-lib@8 ([f46a5bd](https://github.com/NaturalCycles/datastore-lib/commit/f46a5bdc14dbff7c062292a45f93829b1d4c4cb9))

## [3.8.2](https://github.com/NaturalCycles/datastore-lib/compare/v3.8.1...v3.8.2) (2020-09-21)


### Bug Fixes

* deps ([a751b4c](https://github.com/NaturalCycles/datastore-lib/commit/a751b4c74472c2159c584de04eaf086d22a0d558))

## [3.8.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.8.0...v3.8.1) (2020-08-17)


### Bug Fixes

* deps ([7200862](https://github.com/NaturalCycles/datastore-lib/commit/7200862a52e07dd86d01bbea351db36b2d5fce92))

# [3.8.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.7.2...v3.8.0) (2020-08-14)


### Features

* allow > 500 items in save/delete by chunking the array ([c552d3a](https://github.com/NaturalCycles/datastore-lib/commit/c552d3a5ffd217690342ade090eaf2ba35855c3d))

## [3.7.2](https://github.com/NaturalCycles/datastore-lib/compare/v3.7.1...v3.7.2) (2020-08-10)


### Bug Fixes

* deps ([633825d](https://github.com/NaturalCycles/datastore-lib/commit/633825d0a6be01c7f0f9755a06e08aa2281fa5dd))

## [3.7.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.7.0...v3.7.1) (2020-06-03)


### Bug Fixes

* deps ([9c8e024](https://github.com/NaturalCycles/datastore-lib/commit/9c8e02497a5d924edcdac779826b9a16c44a201d))

# [3.7.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.6.1...v3.7.0) (2020-05-31)


### Features

* adapt to db-lib@7 ([2d34fb4](https://github.com/NaturalCycles/datastore-lib/commit/2d34fb4a170b1d92c0fd23cfdd18ac3521b4a50b))

## [3.6.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.6.0...v3.6.1) (2020-05-24)


### Bug Fixes

* adapt to CommonDB ([abafb97](https://github.com/NaturalCycles/datastore-lib/commit/abafb9739455b0466a09920c07e23e30253f8220))

# [3.6.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.5.7...v3.6.0) (2020-05-24)


### Features

* CommonDB@6 (transactions) ([f44f8a4](https://github.com/NaturalCycles/datastore-lib/commit/f44f8a4e2aa7b8f405f944490aabc978c9117527))

## [3.5.7](https://github.com/NaturalCycles/datastore-lib/compare/v3.5.6...v3.5.7) (2020-04-25)


### Bug Fixes

* deps ([7614462](https://github.com/NaturalCycles/datastore-lib/commit/7614462b87942eaf5bb390f67daf9a3f63add477))

## [3.5.6](https://github.com/NaturalCycles/datastore-lib/compare/v3.5.5...v3.5.6) (2020-04-23)


### Bug Fixes

* deps ([44c147f](https://github.com/NaturalCycles/datastore-lib/commit/44c147fc166e183e7ae9490e8be0bd6ed3c566b6))

## [3.5.5](https://github.com/NaturalCycles/datastore-lib/compare/v3.5.4...v3.5.5) (2020-04-19)


### Bug Fixes

* deps ([081b037](https://github.com/NaturalCycles/datastore-lib/commit/081b03700a2f4f286d471a3d5c30682743d68e1e))

## [3.5.4](https://github.com/NaturalCycles/datastore-lib/compare/v3.5.3...v3.5.4) (2020-04-11)


### Bug Fixes

* support projection queries without 'id' field ([699191a](https://github.com/NaturalCycles/datastore-lib/commit/699191a103be78c22b07d4df97af3068d2e05d9d))

## [3.5.3](https://github.com/NaturalCycles/datastore-lib/compare/v3.5.2...v3.5.3) (2020-04-01)


### Bug Fixes

* ping method, getByIds sorting ([16f5d15](https://github.com/NaturalCycles/datastore-lib/commit/16f5d15c6d283757fcf950c23654669c8e2c4746))

## [3.5.2](https://github.com/NaturalCycles/datastore-lib/compare/v3.5.1...v3.5.2) (2020-03-31)


### Bug Fixes

* deps ([25b7e93](https://github.com/NaturalCycles/datastore-lib/commit/25b7e93d60abb9a858db1f3ca23c89211d62fdb3))

## [3.5.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.5.0...v3.5.1) (2020-03-31)


### Bug Fixes

* deps ([1cdd926](https://github.com/NaturalCycles/datastore-lib/commit/1cdd926d7afc0461b4a6056f9d115cfda40d3311))

# [3.5.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.4.1...v3.5.0) (2020-03-22)


### Features

* bump nodejs-lib (joi 17) ([ba337ac](https://github.com/NaturalCycles/datastore-lib/commit/ba337ac61ac2a291cd544c4dfa68fd7abc124ba9))

## [3.4.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.4.0...v3.4.1) (2020-03-16)


### Bug Fixes

* deps ([bdf3fe1](https://github.com/NaturalCycles/datastore-lib/commit/bdf3fe1bfeeec9649de552293bccb8c3bafb0f4e))

# [3.4.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.3.1...v3.4.0) (2020-03-01)


### Features

* deps ([8c8c1f2](https://github.com/NaturalCycles/datastore-lib/commit/8c8c1f2abd4b67a26ab3f775cf41f290018d99f6))

## [3.3.1](https://github.com/NaturalCycles/datastore-lib/compare/v3.3.0...v3.3.1) (2019-11-19)


### Bug Fixes

* support @google-cloud/datastore@5 ([2ffd5d1](https://github.com/NaturalCycles/datastore-lib/commit/2ffd5d10f50d743c037e5bbab7e8cfcddf3f824c))

# [3.3.0](https://github.com/NaturalCycles/datastore-lib/compare/v3.2.5...v3.3.0) (2019-11-09)


### Features

* getDBAdapter(), changed DatastoreDBCfg format ([0794bc2](https://github.com/NaturalCycles/datastore-lib/commit/0794bc2abf4bb25897ca73ec798dd2a3a09de513))

## [3.2.5](https://github.com/NaturalCycles/datastore-lib/compare/v3.2.4...v3.2.5) (2019-11-09)


### Bug Fixes

* **schema:** order id first ([3899334](https://github.com/NaturalCycles/datastore-lib/commit/389933485f2450ed58175edd7d257664b4b5af17))

## [3.2.4](https://github.com/NaturalCycles/datastore-lib/compare/v3.2.3...v3.2.4) (2019-11-09)


### Bug Fixes

* exclude dot-properties from schema ([8865867](https://github.com/NaturalCycles/datastore-lib/commit/8865867b94b77188d6c38fda1ca08292083d09d7))

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
