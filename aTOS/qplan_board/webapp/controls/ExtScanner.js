/* global ZXing:true */


sap.ui.define([
    "sap/ui/core/Control",
	"zatos/qplanboard/model/formatter",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/ResponsivePopover",
    "sap/m/List",
    "sap/m/DisplayListItem",
    "sap/ui/Device",
], function (Control, formatter, jQuery, JSONModel, MessageToast, ResponsivePopover, List, DisplayListItem, Device) {

    "use strict";

	// ---- The app namespace is to be define here!
	var _fragmentPath   = "zatos.qplanboard.controls.fragments.";
	var _sAppModulePath = "zatos/qplanboard/";
	var APP = "QPLANNER";


    return Control.extend("zatos.qplanboard.controls.ExtScanner", {

		// ---- Implementation of formatter functions
		formatter: formatter,

		// --------------------------------------------------------------------------------------------------------------------
		// ---- Init:
		// --------------------------------------------------------------------------------------------------------------------

        metadata: {
            manifest: "json",
            properties: {
                // ---- Possible "QR-Code", "Barcode", "Multi"
                type: {
                    type: "string",
                    defaultValue: "Multi"
                },
                editMode: {
                    type: "boolean",
                    defaultValue: true
                },
                settings: {
                    type: "boolean",
                    defaultValue: false
                },
                decoderKey: {
                    type: "string",
                    defaultValue: "raw"
                },
                decoders: {
                    type: "object",
                    defaultValue: null
                },
                tryHarder: {
                    type: "boolean",
                    defaultValue: false
                },
                laser: {
                    type: "boolean",
                    defaultValue: false
                }
            },
            events: {
                valueScanned: {
                    parameters: {
                        valueScan: {
                            type: "string"
                        },
                    },
                },
                cancelled: {}
            }
        },
    
        init: function () {
			this._initLocalVars();
			this._initLocalModels();
    		this._initHandlers();
    		this._initLoadData();
        },
    
		_initLocalVars: function () {
            // ---- Set initial properties
            this._oToolbar        = null;
            this._oScanModel      = null;
            this._oTD             = null; // ---- Scan dialog
            this._oID             = null; // ---- Input dialog
            this._oBarCodeDecoder = null;
            this._oQRCodeDecoder  = null;
		},

		_initLocalModels: function () {
            // ---- Set main model
            this._oScanModel  = new JSONModel({
                okButton:      false,
                changeButton:  true,
                valueScan:     "",
                valueScene:    "",
                valueEvidence: "",
                typeEvidence:  "",
                videoDeviceId: null,
                decoders:      this.getDecoders(),
                decoderKey:    this.getDecoderKey(),
                editButton:    this.getEditMode(),
                settings:      this.getSettings(),
                tryHarder:     this.getTryHarder(),
                type:          this.getType()
            });
            this._oInputModel = new JSONModel();
 
            // ---- i18n from owner or library if possible
            this.setModel(sap.ui.core.Component.getOwnerComponentFor(this).getModel("i18n"), "i18n");
            this.setModel(this._oScanModel,  "scanModel");
            this.setModel(this._oInputModel, "evidModel");
            this.setModel(new JSONModel(Device), "device");
        },

		_initHandlers: function () {
			// ---- Attach the needed Handlers
            sap.ui.Device.orientation.attachHandler(this.adaptVideoSourceSize.bind(this));
		},

		_initLoadData: function () {
			// ---- Get the OData Services from the manifest.json file. mediaService
			var sManiFile = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json");
			var oManiData = jQuery.sap.syncGetJSON(sManiFile).data;
			var mainDataSource = oManiData["sap.app"].dataSources.mainService;

			this._MainServiceUrl = mainDataSource.uri;
		},

		// --------------------------------------------------------------------------------------------------------------------

		onBeforeRendering: function () {
		},

		onAfterRendering: function () {
		},

        exit: function () {
            sap.ui.Device.orientation.detachHandler(this.adaptVideoSourceSize);
        },

        adaptByOrientationChange: function () {
            this.adaptVideoSourceSize();
            this._resetScan();
        },
    
        adaptVideoSourceSize: function () {
            var oDevice = this.getModel("device");
            var tmp;

            var bPhone   = oDevice.getProperty("/system/phone");
            var bPortain = oDevice.getProperty("/orientation/portrait");
            var iWidth   = oDevice.getProperty("/resize/width");
            var iHeight  = oDevice.getProperty("/resize/height");
 
            if (bPhone) {
                if (bPortain) {
                    iHeight -= 96;
                } else {
                    tmp     = iHeight;
                    iHeight = iWidth - 96;
                    iWidth  = tmp;
                }
            }

            if (bPhone) {
                $('div[id$="videoContainer"]').width(iWidth);
                $('div[id$="videoContainer"]').height(iHeight);
            } else {
                $('div[id$="videoContainer"]').width("100%");
                $('div[id$="videoContainer"]').height("100%");
            }
        },


        // --------------------------------------------------------------------------------------------------------------------
		// ---- Loading Functions
		// --------------------------------------------------------------------------------------------------------------------

        loadEvidenceData: function (key) {
            var sceneNumber = encodeURIComponent(key);
            var sPath = "/EvidenceScene('" + sceneNumber  + "')/to_evidence";
            var combo = sap.ui.getCore().byId("__scanner1--idComboEvidNumberF4");
            var that = this;
						
			this.oModel.read(sPath, {
				success: function(oData, response) {
					if (oData.results !== null && oData.results !== undefined) {
                        // ----------------------------------------------------------------------
                        // Setup dynamicly a Combobox with several properties:
                        //
                        // Property definitions:
                        // 
                        //  - model       - object  - Json Model object
                        //  - component   - object  - Combo Box componentobject
                        //  - data        - json    - Data for the Model in json format
                        //  - collection  - string  - Needed Collection for the Model entity 
                        //  - key         - string  - Key field for the Combo Box
                        //  - text        - string  - Text field for the Combo Box
                        //  - addText     - string  - Additional Text field for the Combo Box
                        //  - sorter      - string  - Sort field of the Combo Box
                        //  - showAddText - boolean - shows the additional text of a Combo Box
                        //
                        // ----------------------------------------------------------------------
 
                        that.onSetComboBoxData(that._oInputModel, combo, oData, "evidModel", "EvidenceId", "EvidenceId", "EvidenceId", "EvidenceId", false);
                    }
				},
				error: function(err) {
					console.log("Error loading Evidence number data!", err); // eslint-disable-line
				}
			});
		},

        onSetComboBoxData: function (oModel, component, mData, collection, key, txt, atxt, asorter, showAddText) {
            // ---- Set data to the Models
            oModel.setData({
                [collection]: mData.results
            });
    
            // ---- Create a ComboBox binding
            var oItemTemplate = new sap.ui.core.ListItem();
                oItemTemplate.bindProperty("key", key);
                oItemTemplate.bindProperty("text", txt);
    
            if (showAddText) {
                oItemTemplate.bindProperty("additionalText", atxt);
            }
     
            var oComboBox = component;
    
            if (oComboBox !== null && oComboBox !== undefined) {
                oComboBox.setModel(oModel);
    
                oComboBox.bindItems({ 
                    path: "/" + collection, 
                    template: oItemTemplate, 
                    sorter: { path: asorter },
                    templateShareable:false
                });
                
                oComboBox.setSelectedKey(undefined);
            }
        },
    
            
        // --------------------------------------------------------------------------------------------------------------------
		// ---- Button Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

        onDecoderChanges: function (oEvent) {
            var oItem    = oEvent.getParameter("item");
            var oDecoder = this.getDecoderByKey(oItem.getKey());

            if (this.lastScannedResult) {
                var sResultText = oDecoder.decoder(this.lastScannedResult) || this.lastScannedResult.text;

                this._oScanModel.setProperty("/valueScan", sResultText);
            }

            if (this.oSettingsPopover) {
                this.oSettingsPopover.close();
            }
        },

        onHarderChange: function () {
            var bHarder    = this._oScanModel.getProperty("/tryHarder");
            var bOldHarder = this.getProperty("/tryHarder");

            if (bOldHarder !== bHarder) {
                this.setTryHarder(bHarder);
            }
            
            if (this.oSettingsPopover) {
                this.oSettingsPopover.close();
            }
        },

        onChangePress: function (oEvent) {
            var aDevices = this._oScanModel.getProperty("/videoDevices");

            if (aDevices && aDevices.length > 1) {
                if (aDevices.length === 2) {
                    var sCurrent = this.getCurrentVideoDevice();

                    aDevices.some(
                        function(item) {
                            if (item.deviceId !== sCurrent) {
                                this.changeDevice(item.deviceId);

                                return true;
                            }

                            return false;
                        }.bind(this)
                    );
                } else {
                    this.openChangePopover(oEvent.getSource());
                }
            }
        },

        onChangeDevice: function (oEvent) {
            var oItem = oEvent.getProperty("listItem");
            var sId   = oItem.getValue();

            this.getChangePopover().close();
            this.changeDevice(sId);
        },
 
        changeDevice: function (sId) {
            this._oScanModel.setProperty("/videoDeviceId", sId);

            this._stopScan();
            this._startScan();
        },

        onResetScan: function () {
            this.lastScannedResult = null;
            this._resetInputs();
            this._resetScan();

            if (this.oSettingsPopover) {
                this.oSettingsPopover.close();
            }
        },

        onComboBoxSceneNumberChanged: function (oEvent) {
            if (oEvent !== null && oEvent !== undefined) {
                if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
                    var source = oEvent.getSource();
                    var key = source.getSelectedKey();
    
                    if (key !== null && key !== undefined && key !== "") {
                        this._oScanModel.setProperty("/valueScene", key);
                        this.loadEvidenceData(key);
                    } else {
                       this._oScanModel.setProperty("/valueScene", "");
                    }

                    this._validateInputs();
                }
            }
        },

        onComboBoxEvidNumberChanged: function (oEvent) {
            if (oEvent !== null && oEvent !== undefined) {
                if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
                    var source = oEvent.getSource();
                    var key = source.getSelectedKey();
                    var oModel = source.getModel();
                    var data = oModel.getData().evidModel;
    
                    if (key !== null && key !== undefined && key !== "") {
                        this._oScanModel.setProperty("/typeEvidence", "");
                        this._oScanModel.setProperty("/valueEvidence", key);

                        for (let i = 0; i < data.length; i++) {
                            var row = data[i];

                            if (row.EvidenceId === key) {
                                this._oScanModel.setProperty("/typeEvidence", row.EvidenceType);
                            }                            
                        }
                    } else {
                        this._oScanModel.setProperty("/typeEvidence", "");
                        this._oScanModel.setProperty("/valueEvidence", "");
                    }
                    
                    this._validateInputs();
                }
            }
        },
        
        
		// --------------------------------------------------------------------------------------------------------------------
		// ---- Scan Dialog Functions
		// --------------------------------------------------------------------------------------------------------------------

        openScanDialog: function () {
            // ---- Show the Scan Dialog
            this.onShowDialog();
        },

        onShowDialog: function () {
            var noCams = this.getResourceBundle().getText("NoCameraDevices");

            this.lastScannedResult = null;
            this._initDecoder();

            if (this._oDecoder) { this._oDecoder.listVideoInputDevices().then( function(aDevices) {
                    this._oScanModel.setProperty("/videoDevices", aDevices);

                    if (aDevices && aDevices.length) {
                        if (aDevices.length === 1) {
                            this._oScanModel.setProperty("/changeButton", false);
                        } else {
                            this._oScanModel.setProperty("/changeButton", true);
                        }

                        this.setProperty("laser", true);
                    } else {
                        jQuery.sap.log.error(noCams);
                    }

                    return true;

                    }.bind(this)
                ).then( function() {
                        this._showScanDialog();
                    }.bind(this)
                ).catch( function(error) {
                        jQuery.sap.log.warning(error);

                        this._showInputDialog();
                    }.bind(this)
                );
            }
        },

        _showScanDialog: function () {
            this._openDialog(this._getScanDialog());
            this.updateLaser();
            this.adaptVideoSourceSize();
        },

        _getScanDialog: function () {
            if (!this._oTD) {
                this._oTD = sap.ui.xmlfragment(this.getId(), _fragmentPath + "scanDialog", this);

                if (this.getEditMode() === true) {
                    this._addHeader(this._oTD);
                }

                this._oTD.attachAfterOpen(this._onAfterOpen.bind(this));
                this._oTD.attachAfterClose(this._onAfterClose.bind(this));

                this.addDependent(this._oTD);
            }

            return this._oTD;
        },
 
        onCancelPress: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
                oDialog.close();

            this.fireCancelled({});
            this._resetInputs();
        },

        onOkPress: function (oEvent) {
            var oDialog = oEvent.getSource().getParent();
                oDialog.close();

            var check = this._validateOkPressed();

            if (check) {
                this.fireValueScanned({
                    valueScan:     this._oScanModel.getProperty("/valueScan"),
                    valueScene:    this._oScanModel.getProperty("/valueScene"),
                    valueEvidence: this._oScanModel.getProperty("/valueEvidence"),
                    typeEvidence:  this._oScanModel.getProperty("/typeEvidence")
                });
            } else {
                this.fireValueScanned({
                    valueScan:     this._oScanModel.getProperty("/valueScan"),
                    valueScene:    this._oScanModel.getProperty("/valueScene"),
                    valueEvidence: this._oScanModel.getProperty("/valueEvidence"),
                    typeEvidence:  this._oScanModel.getProperty("/typeEvidence")
                });
            }

            this._resetInputs();
        },

        _openDialog: function (oDialog) {
            if (this.getModel("device").getProperty("/system/phone") === true) {
                oDialog.setStretch(true);
            } else {
                oDialog.setStretch(false);
            }

            oDialog.open();
        },

        _onAfterOpen: function () {
            this._startScan();
        },

        _onAfterClose: function () {
            this._stopScan();
        },

        _saveScannedValue: function (result, error) {
            var errVideoDecoderMulti = this.getResourceBundle().getText("ErrorVideoDecoderMulti");

            if (result) {
                this.lastScannedResult = result;

                var oDecoder    = this.getDecoderByKey(this._oScanModel.getProperty("/decoderKey"));
                var sResultText = oDecoder.decoder(result) || result.text;

                this._oScanModel.setProperty("/valueScan", sResultText);
                this._oScanModel.setProperty("/okButton", true);
                
                if (this.getEditMode() === false) {

                    this.fireValueScanned({
                            valueScan:     sResultText,
                            valueScene:    this._oScanModel.getProperty("/valueScene"),
                            valueEvidence: this._oScanModel.getProperty("/valueEvidence"),
                            typeEvidence:  this._oScanModel.getProperty("/typeEvidence")
                    });

                    this._getScanDialog().close();
                } else {
                    MessageToast.show(sResultText);
                }
            }

            if (error && !(error instanceof ZXing.NotFoundException)) {
                jQuery.sap.log.warning(errVideoDecoderMulti);
                jQuery.sap.log.warning(error);
            }
        },


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Input Dialog Functions
		// --------------------------------------------------------------------------------------------------------------------

        _showInputDialog: function () {
            this._openDialog(this._getInputDialog());
        },

        _getInputDialog: function () {
            if (!this._oID) {
                this._oID = sap.ui.xmlfragment(this.getId(), _fragmentPath + "inputDialog", this);
                
                this.addDependent(this._oID);
            }

            // ---- Set the Main Model
			this.oModel = this.getModel();

            return this._oID;
        },


		// --------------------------------------------------------------------------------------------------------------------
		// ---- PopOver Dialog Functions
		// --------------------------------------------------------------------------------------------------------------------

        onSettingsPopover: function (oEvent) {
            var oSource = oEvent.getSource();

            this.getSettingsPopover().openBy(oSource);
        },

        openChangePopover: function (oSource) {
            var oPopover = this.getChangePopover();
            var oList    = oPopover.getContent()[0];

            if (oList) {
                var sSelectedId = this.getCurrentVideoDevice();

                if (sSelectedId) {
                    var oSelectedItem = this._oScanModel.getProperty("/videoDevices").find(function(item) {
                        return item.deviceId === sSelectedId;
                    });

                    var oItem = oList.getItems().find(function(item) {
                        return item.getValue() === oSelectedItem.label;
                    });

                    if (oItem) {
                        oList.setSelectedItem(oItem);
                    }
                } else {
                    oList.removeSelections(true);
                }
            }

            oPopover.openBy(oSource, false);
        },


        // --------------------------------------------------------------------------------------------------------------------
		// ---- Setter Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

        setDecoders: function (oDecoders) {
            var aDecoders = [this.getRawDecoder()];

            if (oDecoders instanceof Array) {
                aDecoders = aDecoders.concat(oDecoders);
            }

            if (this._oScanModel) {
                this._oScanModel.setProperty("/decoders", aDecoders);
            }

            this.setProperty("decoders", aDecoders);
        },

        setDecoderKey: function (sKey) {
            if (this._oScanModel) {
                this._oScanModel.setProperty("/decoderKey", sKey);
            }

            this.setProperty("decoderKey", sKey);
        },
    
        setType: function (sType) {
            if (sType === "Barcode" || sType === "QR-Code" || sType === "Multi") {
                this.setProperty("type", sType);

                if (this._oScanModel) {
                    this._oScanModel.setProperty("/type", sType);
                }
            }
        },

        setSettings: function (bValue) {
            if (this._oScanModel) {
                this._oScanModel.setProperty("/settings", bValue);
            }
            
            this.setProperty("settings", bValue);
        },

        setTryHarder: function (bHarder) {
            this.setProperty("tryHarder", bHarder, false);

            if (this._oDecoder) {
                this.resetDecoder();
            }
        },

        // ---- ToDo: Refactor
        setEditMode: function (bEditMode) {
            var sOld = this.getProperty("editMode");

            this.setProperty("editMode", bEditMode);

            if (this._oScanModel) {
                this._oScanModel.setProperty("/editButton", true);

                if (sOld !== bEditMode) {
                    var oTD = this._getScanDialog();

                    if (bEditMode === true) {
                        this._addHeader(oTD);
                    } else {
                        oTD.setCustomHeader();
                    }
                }
            }
        },


        // --------------------------------------------------------------------------------------------------------------------
		// ---- Getter Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

        getRawDecoder: function () {
            return {
                key: "raw",
                text: "RAW",
                decoder: function(oDecodeResult) {
                    return oDecodeResult ? oDecodeResult.text : "";
                }
            };
        },

        getDecoderByKey: function (sKey) {
            var oDecoder = this._oScanModel.getProperty("/decoders").find(function(item) {
                    return item.key === sKey;
                });

            return oDecoder || this.getRawDecoder();
        },

        getCurrentVideoDevice: function () {
            var sId = this._oScanModel.getProperty("/videoDeviceId");

            if (!sId) {
                if (this._oDecoder && this._oDecoder.stream) {
                    var oTrack = this._oDecoder.stream.getVideoTracks()[0];

                    if (oTrack) {
                        var oCap = oTrack.getCapabilities ? oTrack.getCapabilities() : oTrack.getSettings();

                        if (oCap) {
                            sId = oCap.deviceId;
                        }
                    }
                }
            }

            return sId;
        },

        getSettingsPopover: function () {
            if (!this.oSettingsPopover) {
                this.oSettingsPopover = sap.ui.xmlfragment(this.getId(), _fragmentPath + "settingsPopover", this);
 
                this._getScanDialog().addDependent(this.oSettingsPopover);
            }

            return this.oSettingsPopover;
        },

        getChangePopover: function () {
            if (!this._oChangePopover) {
                var oList = new List({ mode: "SingleSelectMaster", });
                    oList.setModel(this._oScanModel);
                    oList.bindItems({
                        path: "/videoDevices",
                        template: new DisplayListItem({
                            value: '{label}',
                        }),
                    });

                this._oChangePopover = new ResponsivePopover({
                    class: "sapUiContentPadding",
                    showHeader: false,
                    selectionChange: this.onChangeDevice.bind(this),
                });

                this._oChangePopover.addContent(oList);
            }

            return this._oChangePopover;
        },

        getTitle: function (sText, sMode) {
            return sMode === "Multi" ? sText + " Multiple formats" : sText + " " + sMode;
        },

        // --------------------------------------------------------------------------------------------------------------------

        _getDialogHeader: function () {
            if (!this._oHeader) {
                this._oHeader = sap.ui.xmlfragment(this.getId(), _fragmentPath + "toolbar", this);
                
                this._getScanDialog().addDependent(this._oHeader);
            }

            return this._oHeader;
        },

        _getOpenButton: function () {
            if (!this._oBtn) {
                this._oBtn = new Button(this.createId("idScanOpenDialogBtn"), {
                    icon: "sap-icon://bar-code",
                    press: this.onShowDialog.bind(this),
                });
            }

            return this._oBtn;
        },

        _getBarCodeDecoder: function () {
            if (!this._oBarCodeDecoder) {
                this._oBarCodeDecoder = new ZXing.BrowserBarcodeReader(new Map([["TRY_HARDER", this.getTryHarder()]]));
            }
            
            return this._oBarCodeDecoder;
        },

        _getQRCodeDecoder: function () {
            if (!this._oQRCodeDecoder) {
                this._oQRCodeDecoder = new ZXing.BrowserQRCodeReader(new Map([["TRY_HARDER", this.getTryHarder()]]));
            }

            return this._oQRCodeDecoder;
        },

        _getMultiCodeDecoder: function () {
            if (!this._oMultiCodeDecoder) {
                this._oMultiCodeDecoder = new ZXing.BrowserMultiFormatReader(new Map([["TRY_HARDER", this.getTryHarder()]]));
            }

            return this._oMultiCodeDecoder;
        },
   

        // --------------------------------------------------------------------------------------------------------------------
		// ---- Helper Functions
		// --------------------------------------------------------------------------------------------------------------------

        _initDecoder: function () {
            var sType = this.getProperty("type");

            switch (sType) {
                case "Barcode":
                    this._oDecoder = this._getBarCodeDecoder();
                    break;
                case "QR-Code":
                    this._oDecoder = this._getQRCodeDecoder();
                    break;
                default:
                    this._oDecoder = this._getMultiCodeDecoder();
            }

            return this._oDecoder;
        },

        _addHeader: function (oDialog) {
            if (oDialog) {
                var oHeader = this._getDialogHeader();

                oDialog.setCustomHeader(oHeader);
                oDialog.invalidate();
            }
        },

        _startScan: function () {
            var emesg = this.getResourceBundle().getText("UnexpectedDecoderErr");
            var noCam = this.getResourceBundle().getText("NoCameraDevice");

            this._oDecoder
            .decodeFromVideoDevice(this._oScanModel.getProperty("/videoDeviceId"), this.getId() + "--scanVideo", this._saveScannedValue.bind(this))
            .catch( function(err) {
                    if (err && err.name && err.name === "NotAllowedError") {
                        jQuery.sap.log.error(noCam);
                    } else {
                        MessageToast.show(err.message || emesg);
                        jQuery.sap.log.error(err.message || emesg);
                    }

                    this._getScanDialog().close();

                    this._showInputDialog();
                }.bind(this)
            );
        },

        _stopScan: function () {
            this._oDecoder.stopContinuousDecode();
            this._oDecoder.stopAsyncDecode();
            this._oDecoder.reset();
        },

        _resetScan: function () {
            this._stopScan();
            this._startScan();
        },

        resetDecoder: function () {
            this.lastScannedResult  = null;
            this._oBarCodeDecoder   = null;
            this._oQRCodeDecoder    = null;
            this._oMultiCodeDecoder = null;

            this._stopScan();
            this._resetInputs();
            this._initDecoder();
            this._startScan();
        },
    
        _resetInputs: function () {
            // ---- Reset the Scan Model Properties
            this._oScanModel.setProperty("/valueScan", "");
            this._oScanModel.setProperty("/valueScene", "");
            this._oScanModel.setProperty("/valueEvidence", "");
            this._oScanModel.setProperty("/typeEvidence", "");
            this._oScanModel.setProperty("/okButton", false);
            
            // ---- Reset the Input Model
            this._oInputModel.setData([]);

            // ---- Reset the Input Comboboxes
            var oComboBoxS = sap.ui.getCore().byId("__scanner1--idComboSceneNumberF4");

            if (oComboBoxS !== null && oComboBoxS !== undefined) {
                oComboBoxS.setSelectedKey(undefined);
            }

            var oComboBoxE = sap.ui.getCore().byId("__scanner1--idComboEvidNumberF4");

            if (oComboBoxE !== null && oComboBoxE !== undefined) {
                oComboBoxE.setSelectedKey(undefined);
            }
        },
    
        _validateInputs: function () {
            var sNumber = this._oScanModel.getProperty("/valueScene");
            var eNumber = this._oScanModel.getProperty("/valueEvidence");

            if (sNumber !== null && sNumber !== undefined && sNumber !== "" && 
                eNumber !== null && eNumber !== undefined && eNumber !== "") {
                    
                this._oScanModel.setProperty("/okButton", true);
            } else {
                this._oScanModel.setProperty("/okButton", false);
            }
        },
    
        _validateOkPressed: function () {
            var sNumber = this._oScanModel.getProperty("/valueScene");
            var eNumber = this._oScanModel.getProperty("/valueEvidence");
            var eType   = this._oScanModel.getProperty("/typeEvidence");

            if (sNumber !== null && sNumber !== undefined && sNumber !== "" && 
                eNumber !== null && eNumber !== undefined && eNumber !== "" &&
                eType !== null && eType !== undefined && eType !== "") {
                    
                return true;
            } else {
                return false;
            }
        },
    
        updateLaser: function () {
            var bLaser = this.getProperty("laser");

            if (bLaser) {
                $(".scanner-laser").show();
            } else {
                $(".scanner-laser").hide();
            }
        },

        getResourceBundle: function (ownerComponent) {
            return sap.ui.core.Component.getOwnerComponentFor(this).getModel("i18n").getResourceBundle();
        }
    
    
		// --------------------------------------------------------------------------------------------------------------------
		// END
		// --------------------------------------------------------------------------------------------------------------------

    });
});
