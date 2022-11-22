/*************************************************************************
 * Atos Germany
 ************************************************************************
 * Created by     : Thomas Sablotny, Atos Germany
 ************************************************************************
 * Description    : Atos - Quick planning board App
 ************************************************************************
 * Authorization  : Checked by backend
 ************************************************************************
 * Code-Inspector : 
 ************************************************************************
 * Changed by     :
 * WR/CR number   :
 * Change         :
 ************************************************************************/


 sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/base/Log",
	"zatos/qplanboard/utils/Storage"
], function (Controller, History, MessageToast, Log, Storage) {

	"use strict";

	return Controller.extend("zatos.qplanboard.controller.BaseController", {

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getStorage: function () {
			return this.getOwnerComponent().getStorage();
		},

		disableDefaultErrorHandler: function (bDefault) {
			this.getOwnerComponent()._oErrorHandler._bMessageOpen = bDefault;
		},

		// ---- Show error message (try-catch)
		showErr: function (oErr) {
			try {
				MessageToast.show(oErr.message);
				
				Log.error(oErr);
			} catch (oErrX) {
				MessageToast.show(oErrX.message);
				
				Log.error(oErrX);
			}
		},
		
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		}

	});
});