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
    var _dataPath = "../model/data/";

    return {

        // --------------------------------------------------------------------------------------------------------------------
        // ---- Init
        // --------------------------------------------------------------------------------------------------------------------

        onInit: function (ownerComponent, mockData) {
            this.OwnerComponent = ownerComponent;
            this.MockData = mockData;

            // ---- Setup the Ajax default connection parameter
            this.AjaxAsyncDefault = this.getResourceBundle().getText("AjaxAsyncDefault");
            this.AjaxTypePost = this.getResourceBundle().getText("AjaxTypePost");
            this.AjaxTypeGet = this.getResourceBundle().getText("AjaxTypeGet");
        },


        // --------------------------------------------------------------------------------------------------------------------
        // ---- Generic Functions
        // --------------------------------------------------------------------------------------------------------------------

        onGetData: function (app, prg, aData, mockFile) {
            var errorMes = this.getResourceBundle().getText("errorText");
            var that = this;

            // ---- Get Uri connection string
            var uri = this._handleQueryUri(app, prg);

            try {
                jQuery.ajax({
                    url: uri,
                    type: that.AjaxTypeGet,
                    async: that.AjaxAsyncDefault,
                    data: aData,
                    success: function (oData, oResponse) {
                        if (oData.Rowsets.Rowset !== null && oData.Rowsets.Rowset !== undefined) {
                            return oData.Rowsets.Rowset.Row;
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

        onGetIntervalData: function (app, prg, aData, interval) {
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
                        url: uri,
                        type: that.AjaxTypeGet,
                        async: that.AjaxAsyncDefault,
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
                }, sDefaultInterval);
            } catch (error) {
                that.showMessageError(errorMes);
            }
        },

        onPostData: function (app, prg, aData) {
            var errorMes = this.getResourceBundle().getText("errorText");
            var that = this;

            // ---- Get Uri connection string
            var uri = this._handleQueryUri(app, prg);

            try {
                jQuery.ajax({
                    url: uri,
                    type: that.AjaxTypePost,
                    async: that.AjaxAsyncDefault,
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

        onPostDataWithReturnMes: function (app, prg, aData, sErrorMes) {
            var errorMes = this.getResourceBundle().getText("errorText");
            var that = this;

            // ---- Get Uri connection string
            var uri = this._handleQueryUri(app, prg);

            try {
                jQuery.ajax({
                    url: uri,
                    type: that.AjaxTypePost,
                    async: that.AjaxAsyncDefault,
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
        }

        // --------------------------------------------------------------------------------------------------------------------
        // ---- End
        // --------------------------------------------------------------------------------------------------------------------

    };
});