## [1.3.1](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/compare/v1.3.0...v1.3.1) (2023-09-05)


### Bug Fixes

* extend the list of attributes that can be overriden to `'x', 'y', 'rx', 'ry', 'r', 'cx', 'cy'` ([a024bd2](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/commit/a024bd28d07217f53d8d8391287841148c4ec99a))

# [1.3.0](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/compare/v1.2.1...v1.3.0) (2023-09-05)


### Bug Fixes

* Support overriding the x and y attributes. Fix [#36](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/issues/36) ([ab2039d](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/commit/ab2039d5f55a99c1edb74d2f5a1c95f586198d56))


### Features

* Added a new `ResetSelection` service that clears all selected items. Fix [#41](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/issues/41) ([dad1a2f](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/commit/dad1a2f3651b869e7d41f5464819d14a280b20ce))
* Update dependencies, adopt latest build process ([8c73edc](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/commit/8c73edc5262e878f5fdc983c2125e0c17674ad2d))

## [1.2.1](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/compare/v1.2.0...v1.2.1) (2021-01-07)


### Bug Fixes

* Fix issue with dynamic svg url not working when pan and zom is disabled. Fixes [#20](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/issues/20), fixes [#17](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/issues/17) ([d47f498](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/commit/d47f4984d45535d092cb2deec555a42b51058f02))

# [1.2.0](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/compare/v1.1.2...v1.2.0) (2020-09-04)


### Bug Fixes

* **compatiblity:** Added compatibility with Thingworx 9. Fixes [#11](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/issues/11) ([94b1987](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/commit/94b1987cad63272bad1fd1b952ab2899a26fa37d))
* **deps:** Updated all the depedencies to fix security issues ([dc1383d](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/commit/dc1383d9f7d9d6a869bd45c61d4750dcb62003b3))


### Features

* **selected:** The `SelectedElementID` can now be binded. This means that the user can select a default selected element with a static value, or bind this dynamicaly. ([f28bf69](https://github.com/ptc-iot-sharing/SvgViewerWidgetTWX/commit/f28bf696cefa2faaebfc0723776e4692ef3b2c18))
