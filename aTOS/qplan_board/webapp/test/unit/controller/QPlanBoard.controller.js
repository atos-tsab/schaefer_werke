/*global QUnit*/

sap.ui.define([
	"zatos/qplan_board/controller/QPlanBoard.controller"
], function (Controller) {
	"use strict";

	QUnit.module("QPlanBoard Controller");

	QUnit.test("I should test the QPlanBoard controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
