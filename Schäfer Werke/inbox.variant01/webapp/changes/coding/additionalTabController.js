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
        		_createTabContent: {
        			public: false
        		},
        		_alertMe: {
        			public: false
        		},
        		_showMessageError: {
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

        _createTabContent: function () {
            var sToolTip    = this.oResourceBundle.getText("customer.inbox.variant01_sap.app.iconTabToolTip");
            var sTitle      = this.oResourceBundle.getText("customer.inbox.variant01_sap.app.titlePDFViewer");
            var oIconTabBar = this.getView().byId("tabBar");

            var oFlexItemData = new sap.m.FlexItemData({ growFactor: 1 });

            var oLayoutData = new sap.ui.core.LayoutData({});
                oLayoutData.setLayoutData(oFlexItemData);

            var oNewPDFViewer = new sap.m.PDFViewer("idPDFViewer", { source: "{PDFModel>/Source}", title: sTitle, height: "{PDFModel>/Height}", width: "100%", showDownloadButton: "{PDFModel>/showBTN}" });
                oNewPDFViewer.setLayoutData(oLayoutData);

            var oNewFlexBox = new sap.m.FlexBox({ direction: "Column", renderType: "Div" });
                oNewFlexBox.addStyleClass("sapUiSmallMargin");
                oNewFlexBox.addItem(oNewPDFViewer);

            var oNewScrollContainer = new sap.m.ScrollContainer({ height: "100%", width: "100%", horizontal: true, vertical: true });
                oNewScrollContainer.addContent(oNewFlexBox);

            // ---- Create a new IconTabFilter and add content to the new tab
            var oNewTab = new sap.m.IconTabFilter("idPDFTabFilter", { tooltip: sToolTip, key: "pdfTab", count: "{PDFModel>/Count}", text: "", icon: "sap-icon://pdf-attachment"});
                oNewTab.addContent(oNewScrollContainer);

            // ---- Add the new tab to the IconTabBar
            oIconTabBar.addItem(oNewTab);

            this._alertMe("1. Additional tab created!");
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
                this._createTabContent();

                // ---- Set Jason Models.
                var oModelData = {
                    "Source":  "",
                    "Count":   "0",
                    "Height":  "600px",
                    "showBTN": false
                };

                this.oPDFModel = new JSONModel(oModelData);

                this.getView().setModel(this.oPDFModel, "PDFModel");
        	},

            extHookGetEntitySetsToExpand: function (oDetailData) {
                var sPDFSource  = sap.ui.require.toUrl("customer/inbox/variant01/changes/coding/sample.pdf");
                var oPDFViewer  = this.getView().byId("idPDFViewer");
                var oIconTabBar = this.getView().byId("tabBar");
   
                if (oIconTabBar !== null && oIconTabBar !== undefined) {
                    this.oPDFModel.setProperty("/Source", "");
                    this.oPDFModel.setProperty("/Count", "0");

                }

                this._alertMe("2. In extHookGetEntitySetsToExpand function");
            },


        //     <IconTabFilter 
        //     id="PDFLinkTabFilter" 
        //     icon="sap-icon://pdf-attachment" 
        //     tooltip="{i18n>relatedObjects.tooltip}"
        //     count="1"
        //     visible="true"
        //     key="PDFLINK">
        //     <core:ExtensionPoint xmlns:core="sap.ui.core" name="CustomerExtensionForPDFTabContent">
        //         <ScrollContainer
        //             height="100%"
        //             width="100%"
        //             horizontal="true"
        //             vertical="true">
        //             <FlexBox direction="Column" renderType="Div" class="sapUiSmallMargin">
        //                 <PDFViewer source="{PDFModel>/Source}" title="{PDFModel/Title}" height="{PDFModel>/Height}">
        //                     <layoutData>
        //                         <FlexItemData growFactor="1" />
        //                     </layoutData>
        //                 </PDFViewer>
        //             </FlexBox>
        //         </ScrollContainer>
        //     </core:ExtensionPoint>
        // </IconTabFilter>





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
        	},

        	// ---- Override public method of the base controller
        	basePublicMethod: function() {
        	}
        }

    });
});
