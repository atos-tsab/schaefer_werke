/************************************************************************
 * Atos Germany
 ************************************************************************
 * Created by     : Thomas Sablotny, Atos Germany
 ************************************************************************
 * Description    : Meggitt - Process Lot application
 ************************************************************************
 * Authorization  : Checked by backend
 ************************************************************************/


sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (CoreLibrary, Controller, JSONModel) {

    "use strict";

    var ValueState = CoreLibrary.ValueState;

    return {

        // --------------------------------------------------------------------------------------------------------------------
        // ---- Init
        // --------------------------------------------------------------------------------------------------------------------

        onInit: function (ownerComponent) {
            this.OwnerComponent = ownerComponent;

            // ---- Setup the Ajax default connection parameter
            this.AjaxAsyncDefault = this.getResourceBundle().getText("AjaxAsyncDefault");
            this.AjaxTypePost     = this.getResourceBundle().getText("AjaxTypePost");
            this.AjaxTypeGet      = this.getResourceBundle().getText("AjaxTypeGet");
        },


        // --------------------------------------------------------------------------------------------------------------------
        // ---- Generic Functions
        // --------------------------------------------------------------------------------------------------------------------

        onGetData: function (oEvent, app, prg, aData) {
            var errorMes = this.getResourceBundle().getText("errorText");
            var that = this;

            // ---- Get Uri connection string
            var uri = this._handleQueryUri(app, prg);

            try {
                jQuery.ajax({
                    url:   uri,
                    type:  this.AjaxTypeGet,
                    async: this.AjaxAsyncDefault,
                    data:  aData,
                    success: function (oData, oResponse) {
                        if (oData.Rowsets.Rowset !== null && oData.Rowsets.Rowset !== undefined) {
                            return oData;
                        } else {
                            that.showMessageError(oData.Rowsets.FatalError, "");
                        }
                    },
                    error: function (oError, oResp) {
                        that.showMessageError(oError);
                    }
                });
            } catch (error) {
                that.showMessageError(errorMes);
            }
        },

        onGetIntervalData: function (oEvent, app, prg, aData, interval) {
            var sDefaultInterval = parseInt(this.getResourceBundle().getText("DefaultInterval"), 10);
            var errorMes = this.getResourceBundle().getText("errorText");
            var that = this;

            if (interval !== null && interval !== undefined) {
                if (this._isNumeric(interval)) {
                	sDefaultInterval = interval;
                }
            }

            // ---- Get Uri connection string
            var uri = this._handleQueryUri(app, prg);

            try {
                setInterval(function () {
                    jQuery.ajax({
                        url:   uri,
                        type:  this.AjaxTypeGet,
                        async: this.AjaxAsyncDefault,
                        data:  aData,
                        success: function (oData, oResponse) {
                            if (oData.Rowsets.Rowset !== null && oData.Rowsets.Rowset !== undefined) {
                                return oData;
                            } else {
                                that.showMessageError(oData.Rowsets.FatalError, "");
                            }
                        },
                        error: function (oError, oResp) {
                            that.showMessageError(oError);
                        }
                    });
                }, sDefaultInterval);
            } catch (error) {
                that.showMessageError(errorMes);
            }
        },

        onPostData: function (oEvent, app, prg, aData) {
            var errorMes = this.getResourceBundle().getText("errorText");
            var that = this;

            // ---- Get Uri connection string
            var uri = this._handleQueryUri(app, prg);

            try {
                jQuery.ajax({
                    url: uri,
                    type: this.AjaxTypePost,
                    async: this.AjaxAsyncDefault,
                    data: aData,
                    success: function (oData, oResponse) {
                        if (oData.Rowsets.Rowset !== null && oData.Rowsets.Rowset !== undefined) {
                            return oData;
                        } else {
                            that.showMessageError(oData.Rowsets.FatalError, "");
                        }
                    },
                    error: function (oError, oResp) {
                        that.showMessageError(oError);
                    }
                });
            } catch (error) {
                that.showMessageError(errorMes);
            }
        },

        onPostDataWithReturnMes: function (oEvent, app, prg, aData, sErrorMes) {
            var errorMes = this.getResourceBundle().getText("errorText");
            var that = this;

            // ---- Get Uri connection string
            var uri = this._handleQueryUri(app, prg);

            try {
                jQuery.ajax({
                    url: uri,
                    type: this.AjaxTypePost,
                    async: this.AjaxAsyncDefault,
                    data: aData,
                    success: function (oData, oResponse) {
                        if (oData.Rowsets.Rowset !== null && oData.Rowsets.Rowset !== undefined) {
                            if (oData.Rowsets.Rowset[0].Row[0].ReturnMessage !== "") {
                                that.showMessageSuccess(oData.Rowsets.Rowset[0].Row[0].ReturnMessage, "");
                            } else {
                                that.showMessageWarning(sErrorMes, "");
                            }
                        } else {
                            that.showMessageError(oData.Rowsets.FatalError, "");
                        }
                    },
                    error: function (oError, oResp) {
                        that.showMessageError(oError);
                    }
                });
            } catch (error) {
                that.showMessageError(errorMes);
            }
        },

        _handleQueryUri: function (app, prg) {
            // ---- Get all the Connection parameter names from i18n file
            var illuminator  = this.getResourceBundle().getText("XMiiIlluminator");
            var qTempName    = this.getResourceBundle().getText("XMiiQueryTempName");
            var qTemplate    = this.getResourceBundle().getText("XMiiQueryTemplate");
            var qTempConst   = this.getResourceBundle().getText("XMiiQueryTempConst");
            var qContTypeTxt = this.getResourceBundle().getText("XMiiQueryContentTypeText");
            var qContentType = this.getResourceBundle().getText("XMiiQueryContentType");

            // ---- Define the Uri string for the Ajax Query and return it
            var uri = "";
                uri = "'" + illuminator + "?" + qTempName + "=" + qTemplate + "/" + app + "/" + qTempConst + "/" + prg + "&" + qContTypeTxt + "=" + qContentType + "'";

            return uri;
        },


        // --------------------------------------------------------------------------------------------------------------------
        // ---- Helper Functions
        // --------------------------------------------------------------------------------------------------------------------

        splitStringIntoArray: function (seperatorText, seperator) {
            var ResultArray = null;

            if (seperatorText !== null) {
                var SplitChars = seperator;

                if (seperatorText.indexOf(SplitChars) >= 0) {
                    ResultArray = seperatorText.split(SplitChars);
                }
            }

            return ResultArray;
        },

        removeArrayData: function (oView, data) {
            var oModel = oView.getModel();

            if (data !== null && data !== undefined && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let param = data[i];

                    oModel.setProperty("/" + param, "");
                }
            }
        },

		_isNumeric: function (num) {
			if (typeof(num) === "number" && !isNaN(num)) {
				return true;
			} else if (typeof(num) === "string" && isNaN(num)) {
				return false;
			} else if (num.trim() === undefined && num.trim() === "") {
				return false;
			} else{
				return false;
			}
		},

        _isObject: function (obj) {
            return obj instanceof Object && obj.constructor === Object;
        },

        autoResizeColumns: function (oTable) {
            var tcols = oTable.getColumns();

            // ---- Auto resize all automatic rendered columns from a UI Table
            for (var index in tcols) {
                if (tcols.hasOwnProperty(index)) {
                    oTable.autoResizeColumn(index);
                }
            }

            // ---- Auto resize the first columns from a UI Table
            oTable.autoResizeColumn(0);
        },

        getUriParameterCType: function (prop) {
            var uriCheck = "";

            if (jQuery.sap.getUriParameters() !== null && jQuery.sap.getUriParameters() !== undefined &&
                jQuery.sap.getUriParameters().mParams !== null && jQuery.sap.getUriParameters().mParams !== undefined) {

                var param = jQuery.sap.getUriParameters().mParams;

                // ---- Set Test Flags over Url parameter
                if (param[prop] !== null && param[prop] !== undefined && param[prop].length > 0) {
                    if (param[prop][0] !== "") {
                        uriCheck = param[prop][0];
                    }
                }
            }

            return uriCheck;
        },

        getUriParameters: function (prop) {
            var uriCheck = false;

            if (jQuery.sap.getUriParameters() !== null && jQuery.sap.getUriParameters() !== undefined &&
                jQuery.sap.getUriParameters().mParams !== null && jQuery.sap.getUriParameters().mParams !== undefined) {

                var param = jQuery.sap.getUriParameters().mParams;

                // ---- Set Test Flags over Url parameter
                if (param[prop] !== null && param[prop] !== undefined && param[prop].length > 0) {
                    if (param[prop][0] === "true") {
                        uriCheck = true;
                    } else {
                        uriCheck = false;
                    }
                }
            }

            return uriCheck;
        },

        getResourceBundle: function (ownerComponent) {
            return this.OwnerComponent.getModel("i18n").getResourceBundle();
        },


        // --------------------------------------------------------------------------------------------------------------------
        // ---- Basic Functions
        // --------------------------------------------------------------------------------------------------------------------

        showMessageInfo: function (oInfo, oDetails) {
            sap.m.MessageBox.information(oInfo, {
                details: oDetails,
                actions: [sap.m.MessageBox.Action.OK],
                onClose: function () {
                    this._bMessageOpen = false;
                }.bind(this)
            }
            );
        },

        showMessageWarning: function (oWarning, oDetails) {
            sap.m.MessageBox.warning(oWarning, {
                details: oDetails,
                actions: [sap.m.MessageBox.Action.OK],
                onClose: function () {
                    this._bMessageOpen = false;
                }.bind(this)
            }
            );
        },

        showMessageSuccess: function (oSuccess, oDetails) {
            sap.m.MessageBox.success(oSuccess, {
                details: oDetails,
                actions: [sap.m.MessageBox.Action.OK],
                onClose: function () {
                    this._bMessageOpen = false;
                }.bind(this)
            }
            );
        },

        showMessageError: function (oError, oDetails) {
            sap.m.MessageBox.error(oError, {
                details: oDetails,
                actions: [sap.m.MessageBox.Action.CLOSE],
                onClose: function () {
                    this._bMessageOpen = false;
                }.bind(this)
            }
            );
        },

        alertMe: function (msg) {
            sap.m.MessageToast.show(msg, {
                duration: 3000,
                my: sap.ui.core.Popup.Dock.CenterCenter,
                at: sap.ui.core.Popup.Dock.CenterCenter,
                width: "20em",
                autoClose: true
            });
        },

        alertMeWidth: function (msg, boxw) {
            sap.m.MessageToast.show(msg, {
                duration: 3000,
                my: sap.ui.core.Popup.Dock.CenterCenter,
                at: sap.ui.core.Popup.Dock.CenterCenter,
                width: boxw,
                autoClose: true
            });
        }


        // --------------------------------------------------------------------------------------------------------------------
        // ---- End
        // --------------------------------------------------------------------------------------------------------------------

    };
});