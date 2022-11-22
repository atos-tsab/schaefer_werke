/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"process_lot/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
