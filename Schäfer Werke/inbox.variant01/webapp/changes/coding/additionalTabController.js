sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/mvc/OverrideExecution",
    "sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller"
], function (ControllerExtension, OverrideExecution, ResourceModel, JSONModel, Controller) {

    'use strict';

 	// ---- The app namespace is to be define here!
    var _sAppPath = "customer.inbox.variant01.";
	var _sAppModulePath = "customer/inbox/variant01/";

    return ControllerExtension.extend("customer.inbox.variant01.additionalTabController", {

        metadata: {
        	// ---- Extension can declare the public methods
        	// ---- In general methods that start with "_" are private
        	methods: {

                // publicMethod: {
        		// 	public: true /*default*/ ,
        		// 	final: false /*default*/ ,
        		// 	overrideExecution: OverrideExecution.Instead /*default*/
        		// },
        		// finalPublicMethod: {
        		// 	final: true
        		// },
        		// onMyHook: {
        		// 	public: true /*default*/ ,
        		// 	final: false /*default*/ ,
        		// 	overrideExecution: OverrideExecution.After
        		// },

                _addResourceBundle: {
        			public: false
        		},
        		_initModels: {
        			public: false
        		},
        		_createTabContent: {
        			public: false
        		},
        		_initLocalVars: {
        			public: false
        		},
        		_alertMe: {
        			public: false
        		},
        		_showMessageError: {
        			public: false
        		},
        		_decodeBase64String: {
        			public: false
        		},
        		_getBindingData: {
        			public: false
        		},                
        		_loadPDFData: {
        			public: false
        		}
        	}
        },

        _addResourceBundle: function () {
            // ---- Set i18n Model on View
            var i18nModel = new ResourceModel({
                bundleName: _sAppPath + "i18n.i18n"
            });

            this.getView().setModel(i18nModel, "i18n");

            this.oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
        },

        _initModels: function () {
            let sTitle = this.oResourceBundle.getText("customer.inbox.variant01_sap.app.title1PDFViewer");

            // ---- Set PDF Jason Model.
            let oModelData = {
                "Source":  "",
                "Title":   "",
                "Count":   "",
                "Height":  "600px",
                "showBTN": false
            };

            let oPDFModel = new JSONModel(oModelData);

            this.getView().setModel(oPDFModel, "PDFModel");
        },

        _createTabContent: function () {
            let sToolTip    = this.oResourceBundle.getText("customer.inbox.variant01_sap.app.iconTabToolTip");
            let oIconTabBar = this.getView().byId("tabBar");

            let oFlexItemData = new sap.m.FlexItemData({ growFactor: 1 });

            let oLayoutData = new sap.ui.core.LayoutData({});
                oLayoutData.setLayoutData(oFlexItemData);

            let oNewPDFViewer = new sap.m.PDFViewer("idPDFViewer", { source: "{PDFModel>/Source}", title: "{PDFModel>/Title}", height: "{PDFModel>/Height}", width: "100%", showDownloadButton: "{PDFModel>/showBTN}", isTrustedSource: true });
                oNewPDFViewer.setLayoutData(oLayoutData);

            this._PDFViewer = oNewPDFViewer;

            let oNewFlexBox = new sap.m.FlexBox({ direction: "Column", renderType: "Div" });
                oNewFlexBox.addStyleClass("sapUiSmallMargin");
                oNewFlexBox.addItem(oNewPDFViewer);

            let oNewScrollContainer = new sap.m.ScrollContainer({ height: "100%", width: "100%", horizontal: true, vertical: true });
                oNewScrollContainer.addContent(oNewFlexBox);

            // ---- Create a new IconTabFilter and add content to the new tab
            let oNewTab = new sap.m.IconTabFilter("idPDFTabFilter", { tooltip: sToolTip, key: "pdfTab", count: "{PDFModel>/Count}", text: "", icon: "sap-icon://pdf-attachment"});
                oNewTab.addContent(oNewScrollContainer);

            // ---- Add the new tab to the IconTabBar
            oIconTabBar.addItem(oNewTab);
        },

        _initLocalVars: function () {
            // ---- Set a Model for the PDF Viewer
            let oModelPDF = this.getView().getModel("PDFModel");

            if (oModelPDF !== null && oModelPDF !== undefined) {
                if (this._PDFViewer !== null && this._PDFViewer !== undefined) {
                    this._PDFViewer.setModel(oModelPDF);
                }    
            }

            // ---- In order to fetch the PDF in response as blob
            jQuery.sap.addUrlWhitelist("blob");
        },

        _alertMe: function (msg) {
            sap.m.MessageToast.show(msg, {
                duration: 3000,
                my: sap.ui.core.Popup.Dock.CenterCenter,
                at: sap.ui.core.Popup.Dock.CenterCenter,
                width: "20em",
                autoClose: true
            });
        },
    
        _showMessageError: function (oError, oDetails) {
            sap.m.MessageBox.error(oError, {
                details: oDetails,
                actions: [sap.m.MessageBox.Action.CLOSE],
                onClose: function () {
                    this._bMessageOpen = false;
                }.bind(this)
            });
        },

        _decodeBase64String: function (sBase64) {
            let that = this;

			return new Promise((resolve, reject) => {
				try {
                    // ---- Decode the base64 string
                    let base64EncodedPDF  = sBase64;
                    let decodedPdfContent = atob(base64EncodedPDF);

                    let byteArray = new Uint8Array(decodedPdfContent.length);

                    for (let i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }

                    let blob    = new Blob([byteArray.buffer], { type: 'application/pdf' });
                    let sPDFUrl = window.URL.createObjectURL(blob);

                    resolve(sPDFUrl);

				} catch (oError) {
                    reject(oError.message);
				}
			});
        },
    
        _getBindingData: async function () {
            // ---- Get the Binding data
            let oBinding = this.getView().getBindingContext();
            let sPath    = oBinding.getPath();
            let oModel   = oBinding.getModel();
            let that = this;

            this.oBindingArray = {};
            this.oBindingArray.SAP__Origin = oBinding.getProperty('SAP__Origin');
            this.oBindingArray.InstanceID  = oBinding.getProperty('InstanceID');
            this.oBindingArray.orderId     = "";

            // ---- Check for CustomAttributeData collection
            oModel.read(sPath + "/CustomAttributeData", {
                error: function(oError, resp) {
                    that._showMessageError(oError.message);
                },
                success: function(oData, response) {
                    if (oData.results !== null && oData.results !== undefined && oData.results.length > 0) {
                        for (let i = 0; i < oData.results.length; i++) {
                            let item = oData.results[i];
                            
                            if (item.Name === "Invoice") {
                                that.oBindingArray.orderId = item.Value;

                                break;
                            }
                        }

                        if (that.oBindingArray.orderId !== "") {
                            that._loadPDFData(that.oBindingArray.orderId);
                        }
                    }
                }
            });          
        },

        _loadPDFData: function (orderId) {
            let sTitle2   = this.oResourceBundle.getText("customer.inbox.variant01_sap.app.title2PDFViewer", orderId);
            let oModelPDF = this.getView().getModel("PDFModel");
            let that = this;

            // ---- ToDo: Remove hardcoded order ID 
            orderId = "4500000303";
            orderId = "4500000001";

            // ---- Read the PDF Data from the backend
            let sPath = "/POPDFSet('" + orderId + "')";

            let oModel = this.getView().getModel("customer.downloadPDF");
                oModel.read(sPath, {
                    error: function(oError, resp) {
                        that._showMessageError(oError.message);
                    },
                    success: function(oData, response) {
                        if (oData !== null && oData !== undefined && response.statusCode === "200") {
                            if (oData.PDFContent !== "") {
                                that._decodeBase64String(oData.PDFContent).then((sPDFSource) => {
                                    // ---- Bind the PDF Content data to the PDF Viewer
                                    oModelPDF.setProperty("/Source", sPDFSource);
                                    oModelPDF.setProperty("/Count", "1");
                                    oModelPDF.setProperty("/Title", sTitle2);
                                }).catch((oErrorProm) => {
                                    that._showMessageError(oErrorProm.message);
                                })
                            }
                        }
                    }
                });          
        },


        // // adding a private method, only accessible from this controller extension
        // _privateMethod: function() {},
        // // adding a public method, might be called from or overridden by other controller extensions as well
        // publicMethod: function() {},
        // // adding final public method, might be called from, but not overridden by other controller extensions as well
        // finalPublicMethod: function() {},
        // // adding a hook method, might be called by or overridden from other controller extensions
        // // override these method does not replace the implementation, but executes after the original method
        // onMyHook: function() {},
        // // method public per default, but made private via metadata
        // couldBePrivate: function() {},


        // ---- This section allows to extend lifecycle hooks or override public methods of the base controller
        
        override: {
        	/**
        	 * Called when a controller is instantiated and its View controls (if available) are already created.
        	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
        	 * @memberOf {{controllerExtPath}}
        	 */
            // --------------------------------------------------------------------------------------------------------------------
            // ---- Init:
            // --------------------------------------------------------------------------------------------------------------------

            onInit: function() {
                this._addResourceBundle();
                this._initModels();
                this._createTabContent();
                this._initLocalVars();
        	},

            extHookGetEntitySetsToExpand: function (oDetailData) {
                let sTitle1   = this.oResourceBundle.getText("customer.inbox.variant01_sap.app.title1PDFViewer");
                let oModelPDF = this.getView().getModel("PDFModel");
                    oModelPDF.setProperty("/Source", "");
                    oModelPDF.setProperty("/Count", "0");
                    oModelPDF.setProperty("/Title", sTitle1);
    
                let oIconTabBar = this.getView().byId("tabBar");

                // ---- Place your hook implementation code here  d.CustomAttributeData.results[0].Value
                if (oIconTabBar !== null && oIconTabBar !== undefined) {
                    if (this._PDFViewer !== null && this._PDFViewer !== undefined) {
                        this._getBindingData();
                    }
                }
            },


            /**
        	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
        	 * (NOT before the first rendering! onInit() is used for that one!).
        	 * @memberOf {{controllerExtPath}}
        	 */
        	onBeforeRendering: function() {
        	},

        	/**
        	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
        	 * This hook is the same one that SAPUI5 controls get after being rendered.
        	 * @memberOf {{controllerExtPath}}
        	 */
        	onAfterRendering: function() {
        	},

        	/**
        	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
        	 * @memberOf {{controllerExtPath}}
        	 */
        	onExit: function() {
        	}

        	// ---- Override public method of the base controller
        	// basePublicMethod: function() {
        	// }
        }

    });
});
