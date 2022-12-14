/************************************************************************
 * Atos Germany
 ************************************************************************
 * Created by     : Thomas Sablotny, Atos Germany
 ************************************************************************
 * Description    : Meggitt - Furnace Run application
 ************************************************************************
 * Authorization  : Checked by backend
 ************************************************************************/


 sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
        
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);

                oModel.setDefaultBindingMode("OneWay");

                return oModel;
        }

    };
});