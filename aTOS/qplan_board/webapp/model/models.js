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
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
 
function (JSONModel, Device) {

        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);

                oModel.setDefaultBindingMode("OneWay");
                
                return oModel;
        }

    };
});