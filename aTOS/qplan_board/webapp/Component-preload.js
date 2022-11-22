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
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "zatos/qplanboard/model/models",
    "zatos/qplanboard/utils/Storage",
    "zatos/qplanboard/controller/ErrorHandler"
    ],
function (UIComponent, Device, models, Storage, ErrorHandler) {

    "use strict";

    return UIComponent.extend("zatos.qplanboard.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            // ---- Create a new List Selector and Error Handler
            this._oErrorHandler = new ErrorHandler(this);

            // ---- Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // ---- Set the device model
            this.setModel(models.createDeviceModel(), "device");

            // ---- Enable routing
            this.getRouter().initialize();

            // ---- Create local storage object
            this._oStorage = new Storage(true);
        },

        getStorage: function () {
            if (!this._oStorage) {
                return false;
            }

            return this._oStorage;
        },

        destroy: function () {
            // ---- Destroy all
            this._oErrorHandler.destroy();

            // ---- Call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        getContentDensityClass: function () {
            if (this._sContentDensityClass === undefined) {
                // ---- Check whether FLP has already set the content density class; do nothing in this case

                // eslint-disable-next-line sap-no-proprietary-browser-api
                if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) {
                    // ---- Apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // ---- "Cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }

            return this._sContentDensityClass;
        }

    });
});