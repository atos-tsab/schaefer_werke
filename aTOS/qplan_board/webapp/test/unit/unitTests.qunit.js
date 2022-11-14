/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"zatos/qplan_board/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
