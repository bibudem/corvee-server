# Changelog

## [2.2.0](https://github.com/bibudem/corvee-server/compare/v2.1.0...v2.2.0) (2026-01-06)


### Features

* Changement de la date de la 'job' pour cette corvée ([3ecf233](https://github.com/bibudem/corvee-server/commit/3ecf233ca23da8711b80aba056a9c1173b75f94c))
* MAJ du module config ([17a4461](https://github.com/bibudem/corvee-server/commit/17a44617d519c62d2e462411e7dacce12bff7f87))
* **server:** Updated browserlist ([e250d26](https://github.com/bibudem/corvee-server/commit/e250d26e54a6d56e768c57b43f01d35ca61ec4eb))
* **server:** Updated browserlist ([2e476fb](https://github.com/bibudem/corvee-server/commit/2e476fbf1ccf2f866d45e2869883cd55c63bfc3f))


### Bug Fixes

* **client:** Correction du style de la console. ([a378f54](https://github.com/bibudem/corvee-server/commit/a378f5426be5696ffa0dd9934d4b9d78beaf0361))
* **parser:** Amélioration de la comparaison des données avec les liens dans la page ([fb93cf0](https://github.com/bibudem/corvee-server/commit/fb93cf0e5d689b029be5ac384b6850718516a761))
* **parser:** Amélioration de la comparaison des données avec les liens dans la page ([471e34a](https://github.com/bibudem/corvee-server/commit/471e34a60d5e5f8bfc3aed85fc74f3e61f140aaf))
* **server:** Les dates de la corvée d'hiver n'avaient pas été mises à jour ([19068a3](https://github.com/bibudem/corvee-server/commit/19068a37257ffb6593ab27aadb3ec38dc33478b3))
* **style:** Correction de la largeur de la console ([6c8b2ce](https://github.com/bibudem/corvee-server/commit/6c8b2ce48b55ea1a2909ed3169e1b0fa91344dab))

## [2.1.0](https://github.com/bibudem/corvee-server/compare/v2.0.0...v2.1.0) (2023-06-13)


### Features

* Added few public apis to the globalThis.corvee object ([1866a98](https://github.com/bibudem/corvee-server/commit/1866a985fa0e61e1e8aa709b53854468b7467ac4))
* **reporter:** Shorter console in height ([d29d2a8](https://github.com/bibudem/corvee-server/commit/d29d2a80fddc1e830b3e80c864d6f20be491d8e2))


### Bug Fixes

* **reporter:** Fix issue with report windows not closing, also copyed tooltip reappearing after click/copy ([9140aa7](https://github.com/bibudem/corvee-server/commit/9140aa7c6799ec1fcd40750a717c14143100ee18))
* **reporter:** Fix of the vertical alignment of the close btn of the console ([9001757](https://github.com/bibudem/corvee-server/commit/90017576029333888415c5eb49ae19fd6c3b8695))
* **reporter:** Fix of the vertical alignment of the close btn of the console ([8256171](https://github.com/bibudem/corvee-server/commit/825617176891bbc29e280d08eafd263e2964fd22))
* **reporter:** Reporter app was not closing on clicking the console close btn ([cdbd521](https://github.com/bibudem/corvee-server/commit/cdbd5218c5dadc871135a6d6531a9d7c53c9bb62))
* Search bar was not emptyed properly when the chip was cleared ([e3da1bf](https://github.com/bibudem/corvee-server/commit/e3da1bff26f537699a55eb2d056c875f87de506d))
* **style:** Reporter console: fix "last modified" last letter hidden ([c22bf0c](https://github.com/bibudem/corvee-server/commit/c22bf0c3b977eee98ee0e250fbbd57b82e0cdc8e))


### Performance Improvements

* **reporter:** Improved loader size by moving some code outside the file ([cdbd521](https://github.com/bibudem/corvee-server/commit/cdbd5218c5dadc871135a6d6531a9d7c53c9bb62))

## 2.0.0 (2023-06-05)

### Features

- **accessibility:** Added aria label ([36f42b6](https://github.com/bibudem/corvee-server/commit/36f42b67adf336a9901052a20f964d2a5f75b274))
- Changed copy box styles ([2e9f18c](https://github.com/bibudem/corvee-server/commit/2e9f18c6c804777cdf6a0252521fc91c21dc5fed))
- **reporter:** Bigger report window ([c79c3ec](https://github.com/bibudem/corvee-server/commit/c79c3ec5e6c04a7b57744d520ce4fc50cd3ef85d))
- **SEO:** Added no indexing for robots ([be54830](https://github.com/bibudem/corvee-server/commit/be54830b1621cc11b72259c2f7181010d90c1c07))
- **server:** Improved section page loading state visibility ([c0163f2](https://github.com/bibudem/corvee-server/commit/c0163f2a32566c69a14b1b8f9b5d51b04a4cd8c5))
- **server:** Smaller "small" font size ([f8b34a5](https://github.com/bibudem/corvee-server/commit/f8b34a5bdc1b8da28aa3f32ee4a73fc957ef6b84))
- Smaller report icon ([4ec5c29](https://github.com/bibudem/corvee-server/commit/4ec5c2990d4e4052171d98a630f3e22d8a9a6798))
- Updated job for the current Corvée ([37ab8bd](https://github.com/bibudem/corvee-server/commit/37ab8bd58ab1dc25d314529c207a5e702eda10af))
- Updated job for the current Corvée ([9697841](https://github.com/bibudem/corvee-server/commit/9697841be8a4f9597e92912087f259517dfdc797))

### Bug Fixes

- Fix wrong import path ([c7eb62b](https://github.com/bibudem/corvee-server/commit/c7eb62b0fc9118045eb521d6142d54bf61f1d6c5))
- **reporter:** Prevent report window from opening twice on mouseenter ([cfda93b](https://github.com/bibudem/corvee-server/commit/cfda93bf90629e875d1a87090e40927abad19b57))
- **server:** Chrome crashed on filter selection ([ce27407](https://github.com/bibudem/corvee-server/commit/ce274079dc8562a5c5f6f30e79384d944067def6))
- **server:** Fix close dialoging when clicking on disabled pagination items ([19b4092](https://github.com/bibudem/corvee-server/commit/19b40928c508949609d8aacbb98e6c36b2bb297d))
- **server:** lodash dependencie is required in production env ([b85dd24](https://github.com/bibudem/corvee-server/commit/b85dd247bf4ea7567c024aa8781d7281743ce655))
- **server:** Pagination items are now not selectable ([40d3357](https://github.com/bibudem/corvee-server/commit/40d3357815251a824c13425ef5e37c244560df20))

### Miscellaneous Chores

- release 2.0.0 ([f8430a1](https://github.com/bibudem/corvee-server/commit/f8430a12768562b7eafafaec3b83a16ff02cdaae))
