/*************************************************************************
 * Atos Germany
 ************************************************************************
 * Created by     : Thomas Sablotny, Atos Germany
 ************************************************************************
 * Description    : Maintenance Oders Dispachter App
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
	"sap/ui/base/Object"
], function (Object) {

	"use strict";

	var APP = "QPLANNER";

	return Object.extend("zatos.qplanboard.utils.Storage", {

		_oStorage: false,

		/**
		 * Create session storage object or keep it as false
		 * @public
		 */
		constructor: function (bSession) {
			if (bSession === true) {
				if (!window.sessionStorage) {
					return;
				}

				this._oStorage = window.sessionStorage;
			} else {
				if (!window.localStorage) {
					return;
				}

				this._oStorage = window.localStorage;
			}
		},

		/**
		 * Return storage parameter name, that this app uses
		 * @private
		 * @param {string} sParam parameter name
		 * @returns {string} full storage parameter name for this app only!
		 */
		_getStorageParamName: function (sParam) {
			return APP + "{" + sParam + "}";
		},

		/**
		 * Save one parameter and value to storage
		 * @public
		 * @param {string} sParam - parameter name
		 * @param {mixed} value - parameter value
		 */
		setStorageParam: function (sParam, value) {
			if (this._oStorage === false) {
				return;
			}

			var store = typeof value === "object" ? JSON.stringify(value) : value;

			this._oStorage.setItem(
				this._getStorageParamName(sParam),
				store
			);
		},

		/**
		 * Try to get one parameter and value from storage
		 * @public
		 * @param {string} sParam - parameter name
		 * @return {mixed} parameter value
		 */
		getStorageParam: function (sParam) {
			if (this._oStorage === false) {
				return false;
			}

			var prop = this._oStorage.getItem(this._getStorageParamName(sParam));
			var value;

			// ---- JSON.parse can crash, so the try/catch block is justified
			try {
				value = JSON.parse(prop);
			} catch (e) {
				value = prop;
			}

			return value;
		},

		/**
		 * Remove one parameter from storage
		 * @public
		 * @param {string} sParam parameter name
		 */
		clearStorageItem: function (sParam) {
			if (this._oStorage === false) {
				return;
			}

			this._oStorage.removeItem(this._getStorageParamName(sParam));
		},

		/**
		 * Empty storage (all of it - use cautiosly!)
		 * @public
		 */
		clearStorage: function () {
			if (this._oStorage === false) {
				return;
			}

			this._oStorage.clear();
		}

	});
});