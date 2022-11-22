sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "processlot/model/models"
],
function (UIComponent, Device, models) {

    "use strict";

    return UIComponent.extend("processlot.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            // ---- Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // ---- Enable routing
            this.getRouter().initialize();

            // ---- Set the device model
            this.setModel(models.createDeviceModel(), "device");
        }

    });
});