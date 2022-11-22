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
    "sap/m/library",
    "sap/ui/core/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "zatos/qplanboard/utils/eams"
], function (MobileLibrary, CoreLibrary, Controller, JSONModel, eams) {

    "use strict";

    var ListMode = MobileLibrary.ListMode;
    var ValueState = CoreLibrary.ValueState;
    var _sAppModulePath = "zatos/qplanboard/";

    return {

        // ---- Implementation of an utility toolset for generic use
        eams: eams,

        // --------------------------------------------------------------------------------------------------------------------
        // ---- Init
        // --------------------------------------------------------------------------------------------------------------------

        onInit: function (thisIn, ownerComponent) {
            this._initLocalVars(thisIn, ownerComponent);
            this._initUploadSet(thisIn);
        },

        _initLocalVars: function (thisIn, ownerComponent) {
            // ---- Define variables for the License View
            this.OwnerComponent = ownerComponent;
            this.oView = thisIn.getView();
            this.EvidenceNumber = "";

            // ---- Get the OData Services from the manifest.json file. mediaService
            var sManiFile = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json");
            var oManiData = jQuery.sap.syncGetJSON(sManiFile).data;
            var mediaDataSource = oManiData["sap.app"].dataSources.mediaService;

            this._MediaServiceUrl = mediaDataSource.uri;
        },

        _initUploadSet: function (thisIn) {
            // ---- Define the Upload component
            this.UpCheckbox = thisIn.byId("idCheckboxAllAttachments");
            this.UploadSet = thisIn.byId("idMediaUploader");
            this.UploadSet.getList().setMode(ListMode.MultiSelect);

            // ---- Define the Attachment component
            var oAttachmentUpl = this.UploadSet.getDefaultFileUploader();
            oAttachmentUpl.setIcon("sap-icon://add").setIconOnly(true);
            oAttachmentUpl.setMultiple(true);

            // ---- Set the Main Models.
            var uploadModel = new JSONModel([]);

            this.oView.setModel(uploadModel, "oModelAttach");
        },


        // --------------------------------------------------------------------------------------------------------------------
        // ---- Loading Data Functions UploadSet
        // --------------------------------------------------------------------------------------------------------------------

        _onLoadUploadData: function (evidenceId) {
            var oView = this.oView;
            var that = this;

            // ---- Setup the UploadSet data
            var url = this._MediaServiceUrl + "GOSXSet('" + evidenceId + "')/$value";
            url = "/sap/opu/odata/sap/ZEAMS_MEDIA_HANDLING_V2_SRV/GOSXSet('" + evidenceId + "')/$value";

            this.EvidenceNumber = evidenceId;
            this._setupUploadSet(url);

            // ---- Load the UploadSet data
            var GOS_Set_No = "/GOSSet('" + evidenceId + "')";

            this.OwnerComponent.getModel("mediaDataSource").read(GOS_Set_No, {
                success: function (oData) {
                    var gos = JSON.parse(oData.Value).items;
                    var json = new JSONModel([]);
                    json.items = [];

                    for (var i = 0; i < gos.length; i++) {
                        // ---- Switch to boolean parameter
                        for (var j = 0; j < gos[i].attributes.length; j++) {
                            var att = gos[i].attributes[j];
                            att.active = that.parseBool(att.active);
                        }

                        for (var k = 0; k < gos[i].statuses.length; k++) {
                            var att = gos[i].statuses[k];
                            att.active = that.parseBool(att.active);
                        }

                        // ---- Set the item values for the UploadSet component
                        var item = {
                            fileName: gos[i].filename,
                            mediaType: gos[i].mediatype,
                            uploadState: gos[i].uploadstate,
                            thumbnailUrl: null,
                            visibleEdit: true,
                            visibleRemove: true,
                            url: gos[i].url,
                            selected: gos[i].selected,
                            attributes: gos[i].attributes,
                            markers: gos[i].markers,
                            statuses: gos[i].statuses
                        };

                        json.items.push(item);
                    }

                    oView.getModel("oModelAttach").setData(json);

                    if (that.UploadSet.getItems().length > 0) {
                        that.UpCheckbox.setVisible(true);
                    }

                }.bind(this),
                error: function (oError) {
                    sap.m.MessageToast.show("Error occured reading data");
                }
            });
        },


        // --------------------------------------------------------------------------------------------------------------------
        // ---- Generic Functions UploadSet
        // --------------------------------------------------------------------------------------------------------------------

        onOpenPressed: function (oEvent) {
            if (oEvent !== null && oEvent !== undefined) {
                oEvent.preventDefault();

                if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
                    var source = oEvent.getSource();

                    if (source.getMediaType() === "application/pdf" || source.getMediaType() === "image/jpeg") {
                        window.open(source.getUrl());
                    } else {
                        var link = document.createElement("a");
                        link.download = source.getFileName();
                        link.href = source.getUrl();
                        link.target = "_blank";
                        link.dispatchEvent(new MouseEvent("click"));
                    }
                }
            }
        },

        onUploadSelectedButton: function (oEvent) {
            if (oEvent !== null && oEvent !== undefined) {
                if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
                    var source = oEvent.getSource().oParent.oParent.oParent;

                    source.getItems().forEach(function (oItem) {
                        var x = oItem.getListItem();

                        if (oItem.getListItem().getSelected()) {
                            source.uploadItem(oItem);
                        }
                    });
                }
            }
        },

        onUploadCompleted: function (oEvent) {
            if (oEvent !== null && oEvent !== undefined) {
                if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
                    var source = oEvent.getSource().oParent.oParent.oParent;
                    source.removeAllIncompleteItems();
                    source.getBinding("items").refresh();
                }
            }
        },

        onUpload: function (oEvent) {
            var aItemsToUpload = this.UploadSet.getIncompleteItems();

            this.UploadSet.setUploadUrl("/sap/opu/odata/sap/ZEAMS_MEDIA_HANDLING_V2_SRV/GOSXSet('" + this.EvidenceNumber + "')/$value");

            //...
            if (aItemsToUpload.length > 0) {
                var oXCSRFToken = new sap.ui.core.Item({
                    key: "X-CSRF-Token",
                    text: this.getOwnerComponent().getModel("PDF").getSecurityToken(),
                });

                var oSlug = new sap.ui.core.Item({
                    key: "SLUG",
                    text: "MyFile.txt",
                });

                this.UploadSet.setHttpRequestMethod("PUT");
                this.UploadSet.addHeaderField(oXCSRFToken).addHeaderField(oSlug).uploadItem(aItemsToUpload[0]);

                return;
            } else {
                var data = {
                    mediaType: "mediaType",
                    fileName: "mediaType",
                    size: "mediaType"
                };

                var url = "https://app01s50.approyo.com:44301" + this.UploadSet.getUploadUrl();

                $.ajax(url, {
                    method: "PUT",
                    dataType: 'json',  // ---- Type of response data
                    headers: {
                        "Content-type": "application/json",
                        "X-CSRF-Token": this.getOwnerComponent().getModel("PDF").getSecurityToken(),
                    },
                    data: JSON.stringify(data),
                    success: function (data, status, xhr) {   // ---- Success callback function
                        console.log(status);
                    },
                    error: function (jqXhr, textStatus, errorMessage) { // ---- Error callback 
                        console.log(errorMessage);
                    }
                });
            }
        },

        // --------------------------------------------------------------------------------------------------------------------

        onDownload: function (oEvent) {
            if (oEvent !== null && oEvent !== undefined) {
                if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
                    var source = oEvent.getSource().oParent.oParent.oParent;

                    source.getItems().forEach(function (oItem) {
                        if (oItem.getListItem().getSelected()) {
                            oItem.download(true);
                        }
                    });
                }
            }
        },






        onBeforeUploadStarts: function (oEvent) {
            var oHeaderItem = oEvent.getParameter("item"),
                slugVal = oHeaderItem.getFileName() + ",1234,ZSD_SAMPLES";

            oHeaderItem.removeAllStatuses();
            oHeaderItem.addHeaderField(new sap.ui.core.Item({ key: "slug", text: slugVal }));
            oHeaderItem.addHeaderField(new sap.ui.core.Item({ key: "x-csrf-token", text: this.getOwnerComponent().getModel().getSecurityToken() }));
        },

        onUploadComplete: function (oEvent) {
            var oStatus = oEvent.getParameter("status"),
                oItem = oEvent.getParameter("item"),
                oUploadSet = this.getView().byId("idAttach");

            if (oStatus && oStatus !== 201) {
                oItem.setUploadState("Error");
                oItem.removeAllStatuses();
            } else {
                oUploadSet.removeIncompleteItem(oItem);

                this.setAttachmentModel();
            }
        },

        setAttachmentModel: function () {
            this.getOwnerComponent().getModel().read("/AttachmentSet", {
                filters: [new Filter("RefGuid", FilterOperator.EQ, "1234")],
                success: function (oData) {
                    var json = new JSONModel([]);
                    json.items = [];

                    for (var i = 0; i < oData.results.length; i++) {
                        var item = {
                            Guid: oData.results[i].Guid,
                            fileName: oData.results[i].Filename,
                            meddiaType: oData.results[i].Mimetype,
                            url: "/sap/opu/odata/sap/ZATTACHMENTS_SRV/AttachmentSet('" + oData.results[i].Guid + "')/$value",
                            uploadState: "Complete",
                            CreatedBy: oData.results[i].CreatedBy,
                            Erdat: oData.results[i].Erdat,
                            selected: false
                        };

                        json.items.push(item);
                    }

                    this.getView().getModel("oModelAttach").setData(json);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageToast.show("Error occured reading data");
                }
            });
        },



        onAfterItemAddedOld: function (oEvent) {
            var item = oEvent.getParameter("item")

            this._createEntity(item).then((id) => {
                this._uploadContent(item, id);
            })
                .catch((err) => {
                    eams.alertMe(err.responseText);
                })
        },

        onAfterItemAdded: function (oEvent) {
            if (oEvent !== null && oEvent !== undefined) {
                var item = oEvent.getParameter("item");
                var xobj = item.getFileObject();
                var size = item.getFileObject().size;

                this._createEntity(item).then((id) => {
                    eams.alertMe("Type: " + typeof xobj + "\nSize: " + size);

                    this._uploadContent(item, id);
                })
                    .catch((err) => {
                        eams.alertMe(err.responseText);
                    })
            }
        },

       _createEntity: function (item) {
            var data = {
                mediaType: item.getMediaType(),
                fileName: item.getFileName(),
                size: item.getFileObject().size
            };

            var url = this.UploadSet.setUploadUrl("/sap/opu/odata/sap/ZEAMS_MEDIA_HANDLING_V2_SRV/GOSXSet('" + this.EvidenceNumber + "')/$value");

            var settings = {
                url: "/attachments/Files",
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                data: JSON.stringify(data)
            }

            return new Promise((resolve, reject) => {
                $.ajax(settings)
                    .done((results, textStatus, request) => {
                        resolve(results.ID);
                    })
                    .fail((err) => {
                        reject(err);
                    })
            })
        },

        _uploadContent: function (item, id) {
            var url = "/attachments/Files(${id})/content";

            item.setUploadUrl(url);

            this.UploadSet.setHttpRequestMethod("PUT")
            this.UploadSet.uploadItem(item);
        },

        _download: function (item) {
            var settings = {
                url: item.getUrl(),
                method: "GET",
                xhrFields: {
                    responseType: "blob"
                }
            }

            return new Promise((resolve, reject) => {
                $.ajax(settings)
                    .done((result, textStatus, request) => {
                        resolve(result);
                    })
                    .fail((err) => {
                        reject(err);
                    })
            });
        },


        // --------------------------------------------------------------------------------------------------------------------
        // ---- Basic Functions
        // --------------------------------------------------------------------------------------------------------------------

        _setupUploadSet: function (uploadUrl) {
            var fileTypes = this.getResourceBundle().getText("FileTypes");
            var maxFileNameLength = this.getResourceBundle().getText("MaxFileNameLength");
            var maxFileSize = this.getResourceBundle().getText("MaxFileSize");
            var noDataDescription = this.getResourceBundle().getText("NoDataDescription");
            var noDataText = this.getResourceBundle().getText("NoDataText");
            var instantUpload = this.getResourceBundle().getText("InstantUpload");
            var showIcons = this.getResourceBundle().getText("ShowIcons");
            var terminationEnabled = this.getResourceBundle().getText("TerminationEnabled");
            var uploadEnabled = this.getResourceBundle().getText("UploadEnabled");

            // ---- Remove all Items from the UploadSet
            this.UploadSet.removeAllItems();

            // ---- Set all neccesarry Items for the UploadSet
            this.UploadSet.setFileTypes([fileTypes]);
            this.UploadSet.setMaxFileNameLength(parseInt(maxFileNameLength, 10));
            this.UploadSet.setMaxFileSize(parseFloat(maxFileSize));
            this.UploadSet.setNoDataDescription(noDataDescription);
            this.UploadSet.setNoDataText(noDataText);
            this.UploadSet.setInstantUpload(this.parseBool(instantUpload));
            this.UploadSet.setShowIcons(this.parseBool(showIcons));
            this.UploadSet.setTerminationEnabled(this.parseBool(terminationEnabled));
            this.UploadSet.setUploadEnabled(this.parseBool(uploadEnabled));
            this.UploadSet.setUploadUrl(uploadUrl);
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

        parseBool: function (str) {
            if (typeof str === "string" && str.toLowerCase() === "true") {
                return true;
            } else {
                return false;
            }
        },

        getResourceBundle: function (ownerComponent) {
            return this.OwnerComponent.getModel("i18n").getResourceBundle();
        }


        // --------------------------------------------------------------------------------------------------------------------
        // ---- End
        // --------------------------------------------------------------------------------------------------------------------

    };
});