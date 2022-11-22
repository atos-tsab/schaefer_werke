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
	"zatos/qplanboard/controller/BaseController",
	"zatos/qplanboard/controls/ExtScanner",
	"zatos/qplanboard/model/formatter",
	"zatos/qplanboard/utils/tools",
    "zatos/qplanboard/utils/eams",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/ui/core/mvc/Controller"
], function (BaseController, ExtScanner, formatter, tools, eams, JSONModel, BarcodeScanner, Controller) {

	"use strict";

	// ---- The app namespace is to be define here!
	var _fragmentPath = "zatos.qplanboard.view.fragments.";
	var APP = "QPLANNER";


	return BaseController.extend("zatos.qplanboard.controller.QPlanBoard", {
		// ---- Implementation of formatter functions
		formatter: formatter,

		// ---- Implementation of an utility toolset for generic use
		tools: tools,
        eams : eams,


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Init:
		// --------------------------------------------------------------------------------------------------------------------

		onInit: function () {
			this._initLocalVars();
			this._initLocalModels();
			this._initBarCodeScanner();
			this._initLocalRouting();
		},

		_initLocalVars: function () {
			// ---- Define variables for the License View
			this.oView = this.getView();

			// ---- Define the Owner Component for the Tools Util
			tools.onInit(this.getOwnerComponent());

			// ---- Define the Table Panels
			this.tablePanelUI = this.byId("idPanelTableUI_" + APP);
			this.tablePanelM = this.byId("idPanelTableM_" + APP);
			this.MaintenanceOrder = "";
			this.ActiveStatus = "";
			this.PanelType = "M";

			// ---- Define the Smart components
			this.smartFilterbar = this.byId("idSmartFilterBar_" + APP);
			this.smartTableUI = this.byId("idSmartTableUI_" + APP);
			this.smartTableM = this.byId("idSmartTableM_" + APP);
			this.uiTable = this.byId("idTableUI_" + APP);
			this.mTable = this.byId("idTableM_" + APP);

			// ---- Set the Basic Search Fields in Smart Filterbar
			// this.smartFilterbar.setBasicSearchFieldName("AgencyName");
		},

		_initLocalModels: function () {
			// ---- Get the Main Models.
			this.oModel = this.getOwnerComponent().getModel();
			this.SettingsModel = new JSONModel({ navigatedItem: "" });
			this.BarCodeModel = BarcodeScanner.getStatusModel();

			// ---- Set the Main Models.
			this.getView().setModel(this.oModel);
			this.getView().setModel(this.SettingsModel, "settings");

			// ---- Set Jason Models.
			this.StatusModel = new JSONModel();
		},

		_initBarCodeScanner: function () {
			var that = this;

			// ---- Handle the Bar / QR Code scanning
			this.oMainModel = this.getOwnerComponent().getModel();

			this.oScanner = new ExtScanner({
				settings:     true,
				valueScanned: that.onScanned.bind(that),
				decoderKey:   "text",
				decoders:     that.getDecoders(),
				models: 	  that.oMainModel
			});
		},

		_initLocalRouting: function () {
			// ---- Handle the routing
			this.getRouter().getRoute("qplanner").attachPatternMatched(this._onObjectMatched, this);
		},

		// --------------------------------------------------------------------------------------------------------------------

		onBeforeRendering: function () {
		},

		onAfterRendering: function () {
		},

		onExit: function () {
			if (this.byId("idPanelTableUI_" + APP)) {
				this.byId("idPanelTableUI_" + APP).destroy();
			}
			if (this.byId("idPanelTableM_" + APP)) {
				this.byId("idPanelTableM_" + APP).destroy();
			}

			if (this.byId("idSmartFilterBar_" + APP)) {
				this.byId("idSmartFilterBar_" + APP).destroy();
			}
			if (this.byId("idSmartTableUI_" + APP)) {
				this.byId("idSmartTableUI_" + APP).destroy();
			}
			if (this.byId("idSmartTableM_" + APP)) {
				this.byId("idSmartTableM_" + APP).destroy();
			}
			if (this.byId("idTableUI_" + APP)) {
				this.byId("idTableUI_" + APP).destroy();
			}
			if (this.byId("idTableM_" + APP)) {
				this.byId("idTableM_" + APP).destroy();
			}
		},

		_onObjectMatched: function (oEvent) {
			// this._resetAll();
			this._loadAllCodeListData();
		},

		_loadAllCodeListData: function () {
			var that = this;

			// ---- Set Code List parameters0

			var listData = [
				{ 
					"Entity":   "C_MaintOrderTypeVH",
					"CompId":   "idMultiComboBoxMaintenanceOrderTypeF4",
					"AddTxt":   "MaintenanceOrderTypeName",
					"Key":		"MaintenanceOrderType",
					"Txt":		"MaintenanceOrderType"
				}
			];
		
			this.oModel.setDeferredGroups(["filterListGroup"]);
			this.oModel.setUseBatch(true);
			this.getView().setBusy(true);

			// ---- Read all relevant Code List data for the Edit mode
			for (let i = 0; i < listData.length; i++) {
				let sname = listData[i].Entity;
				
				this.oModel.read("/" + sname,  { groupId: "filterListGroup", success: function(oData, oResponse) {}, error: function(oError, resp) {} });
			}

			this.oModel.submitChanges({
				groupId: "filterListGroup",
				error: function (oError, resp) {
					that.oModel.setUseBatch(false);
					that.getView().setBusy(false);

					// tools.handleODataRequestFailed(oError, resp, true); 
				},
				success: function (oData, oResponse) {
					that.oModel.setUseBatch(false);
					that.getView().setBusy(false);

					that._setCodeListData(oData, listData); 
				}
			}); 
		},
		
		_setCodeListData: function (oData, listData) {
			if (oData.__batchResponses) {
				for (let i = 0; i < listData.length; i++) {
					if (oData.__batchResponses[i].data) {
						let data   = oData.__batchResponses[i].data
						let entity = listData[i].Entity;
						let addtxt = listData[i].AddTxt;
						let key    = listData[i].Key;
						let txt    = listData[i].Txt;
						let id     = listData[i].CompId;

						this._setFilterlist_gen(data, entity, id, addtxt, key, txt);
					}
				}
			}
		},

		_setFilterlist_gen: function (oData, entity, id, addtxt, key, txt) {
			// ---- Set Data for Scene Status
			if (oData !== null && oData !== undefined) {
				if (oData.results !== null && oData.results !== undefined && oData.results.length > -1) {
					var oComboBox = this.byId(id);
					var oModel = new JSONModel();

					// ---- Sort of String fields
					oData.results.sort(function (a, b) {
						return a[key].localeCompare(b[key]);
					});

					// ---- Set data to the Models
					oModel.setData({
						[entity]: oData.results
					});

					// ---- Create a ComboBox binding
					var oItemTemplate = new sap.ui.core.ListItem();
						oItemTemplate.bindProperty("key", key);
						oItemTemplate.bindProperty("text", txt);
						oItemTemplate.bindProperty("additionalText", addtxt);

					if (oComboBox !== null && oComboBox !== undefined) {
						oComboBox.setModel(oModel);

						oComboBox.bindItems({ 
							path: "/" + entity, 
							template: oItemTemplate, 
							sorter: { path: key },
							templateShareable:false
						});
					}
				}
			}
		},
		

		// --------------------------------------------------------------------------------------------------------------------
		// ---- Button Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		onPressDetails: function () {
			var msgText = this.getResourceBundle().getText("NoSceneSelectedDetails");
			var selectedSceneNumber = "";

			// ---- Check which Table is in focus at runtime
			if (this.PanelType === "M" && this.SelectedSceneNumber !== "") {
				selectedSceneNumber = this.SelectedSceneNumber;
			} else if (this.PanelType === "E" && this.SelectedSceneNumber !== "") {
				selectedSceneNumber = this.SelectedSceneNumber;
			} else {
				selectedSceneNumber = "";
			}

			if (selectedSceneNumber !== "") {
				// this.onNavToDetails(selectedSceneNumber);
			} else {
				tools.alertMeWidth(msgText, "35em");
			}
		},
		
		onStatusChange: function () {
			var msgText = this.getResourceBundle().getText("NoSceneSelectedStatus");
			var selectedSceneNumber = "";

			// ---- Check which Table is in focus at runtime
			if (this.PanelType === "M" && this.SelectedSceneNumber !== "") {
				selectedSceneNumber = this.SelectedSceneNumber;
			} else if (this.PanelType === "E" && this.SelectedSceneNumber !== "") {
				selectedSceneNumber = this.SelectedSceneNumber;
			} else {
				selectedSceneNumber = "";
			}

			if (selectedSceneNumber !== "") {
				this.onStatusDialogOpen(selectedSceneNumber, this.ActiveStatus);
			} else {
				tools.alertMeWidth(msgText, "35em");
			}
		},
		
		onPressHistory: function () {
			var msgText = this.getResourceBundle().getText("NoSceneSelectedHistorie");
			var selectedSceneNumber = "";

			// ---- Check which Table is in focus at runtime
			if (this.PanelType === "M" && this.SelectedSceneNumber !== "") {
				selectedSceneNumber = this.SelectedSceneNumber;
			} else if (this.PanelType === "E" && this.SelectedSceneNumber !== "") {
				selectedSceneNumber = this.SelectedSceneNumber;
			} else {
				selectedSceneNumber = "";
			}

			if (selectedSceneNumber !== "") {
				// this.onNavToHistory(selectedSceneNumber);
			} else {
				tools.alertMeWidth(msgText, "35em");
			}
		},
		
		onToggleFooter: function () {
			this._getPage().setShowFooter(!this._getPage().getShowFooter());

			// ---- Set the Footer icons based on visibility
			var footerOff = this.getResourceBundle().getText("ToggleFooterOff");
			var footerOn = this.getResourceBundle().getText("ToggleFooterOn");
			var footer = this._getPage().getShowFooter();

			if (footer) {
				// ---- Footer is visible
				this.byId("idButtonToggleFooter_" + APP).setIcon("sap-icon://busy");
				this.byId("idButtonToggleFooter_" + APP).setText(footerOff);
			} else {
				// ---- Footer is not visible
				this.byId("idButtonToggleFooter_" + APP).setIcon("sap-icon://appear-offline");
				this.byId("idButtonToggleFooter_" + APP).setText(footerOn);
			}
		},

		onResizeColumnsPress: function () {
			tools.autoResizeColumns(this.uiTable);
		},

		onPressTableTypeExcel: function (oEvent) {
			var that = this;

			// ---- Set the Table Panels for Excel type
			this.tablePanelM.setVisible(false);
			this.tablePanelUI.setVisible(true);
			this.mTable.removeSelections(true);
			this.PanelType = "E";

			// ---- Resize the Excel table
			setTimeout(function () {
				tools.autoResizeColumns(that.uiTable);
			}.bind(this), 800);
		},

		onPressTableTypeMobile: function (oEvent) {
			var that = this;

			// ---- Set the Table Panels for Mobile type
			this.tablePanelM.setVisible(true);
			this.tablePanelUI.setVisible(false);
			this.uiTable.clearSelection();
			this.PanelType = "M";
		},

		onAssignmentPress: function () {
			eams.alertMe("Hier könnte die Zuordnung geändert werden!");
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- QR/Bar Code Scanner Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		onScanned: function (oEvent) {
			var scanValue = oEvent.getParameter("valueScan");
			var seneValue = oEvent.getParameter("valueScene");
			var evidValue = oEvent.getParameter("valueEvidence");
			var typeValue = oEvent.getParameter("typeEvidence");

			this.onNavToEvidenceDetails(seneValue, evidValue, typeValue, scanValue);
		},

		onScan: function () {
			this.oScanner.openScanDialog();
		},

		getDecoders: function () {
			var that = this;

			return [
				{
					key:     "PDF417-UII",
					text:    "PDF417-UII",
					decoder: that.parserPDF417UII,
				},
				{
					key:     "text",
					text:    "TEXT",
					decoder: that.parserText,
				},
			];
		},

		parserText: function (oResult) {
			var iLength = oResult.text.length;
			var sText = "";

			for (var i = 0; i !== iLength; i++) {
				if (oResult.text.charCodeAt(i) < 32) {
					sText += " ";
				} else {
					sText += oResult.text[i];
				}
			}

			return sText;
		},

		parserPDF417UII: function (oResult) {
			// ---- We expect that first symbol of UII (S - ASCII = 83) or it just last group
			var sText = oResult.text || "";

			if (oResult.format && oResult.format === 10) {
				var iLength = oResult.text.length;
				var aChars  = [];
				sText       = "";

				for (var i = 0; i !== iLength; i++) {
					aChars.push(oResult.text.charCodeAt(i));
				}

				var iStart     = -1;
				var iGRCounter = 0;
				var iGroupUII  = -1;
				var sTemp      = "";

				aChars.forEach(function (code, k) {
					switch (code) {
						case 30:
							if (iStart === -1) {
								iStart = k;
								sTemp  = "";
							} else {
								sText      = sTemp;
								iGRCounter = -1;
							}
							break;
						case 29:
							iGRCounter += 1;
							break;
						default:
							if (iGRCounter > 2 && code === 83 && iGRCounter > iGroupUII) {
								sTemp     = "";
								iGroupUII = iGRCounter;
							}
							if (iGroupUII === iGRCounter) {
								sTemp += String.fromCharCode(code);
							}
					}
				});
				if (sText) {
					sText = sText.slice(1);
				}
			}

			return sText;
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- QR/Bar Code Scanner Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		onScanScene: function (oEvent) {
			var noBarCodeScanner = this.getResourceBundle().getText("NoBarCodeScanner");
			var scanPossible = this.BarCodeModel.getData().available;
			var that = this;

			if (scanPossible) {
				BarcodeScanner.scan(
					function (mResult) {
						var oScanned = { "Asservat": "" };

						if (mResult.cancelled) {
							return;
						}

						tools.alertMe("We got a bar code\n" +
							"Result: " + mResult.text + "\n" +
							"Format: " + mResult.format + "\n" +
							"Cancelled: " + mResult.cancelled);



					},
					function (Error) {
						var errText = that.getResourceBundle().getText("ScanningFailed");

						tools.alertMe(errText + Error);
					},
					function (mParams) {
						var paramText = that.getResourceBundle().getText("EnterredValue");

						tools.alertMe(paramText + mParams.newValue);
					},
					// ---- Hard coded Dialog Title for manual data entering
					"Manuelle Qr / Barcode Eingabe"

					// Fragment.load({
					//     id: this.oView.getId(),
					//     name: _fragmentPath + "EnterMaterialNumberDialog",
					//     controller: this
					// }).then(function (oDialog) {
					//     that._scanned = true;

					//     that.oView.addDependent(oDialog);
					//     that.oView._materialEnterMaterialDialog = oDialog;
					//     that.oView._materialEnterMaterialDialog.open();
					//     that.oView.byId("idEnterMaterialNumber").focus();
					// }.bind(this))
				);
			} else {
				tools.showMessageWarning(noBarCodeScanner, "");
			}
		},

		onAcceptEnterMaterialDialog: function () {
			var oValue = this.byId("idEnterMaterialNumber").getValue();

			// this._proceedWithMaterialDialog(oValue);
		},

		onCancelEnterMaterialDialog: function () {
			this.getView()._materialEnterMaterialDialog.close();
		},

		onAfterCloseEnterMaterialDialog: function () {
			this.getView()._materialEnterMaterialDialog.destroy();
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Dialog Functions
		// --------------------------------------------------------------------------------------------------------------------

		onStatusDialogOpen: function (sceneNumber, activeStatus) {
			var fragmentFile = _fragmentPath + "DialogStatusChange";
			var oView = this.getView();
			var that = this;
			
			// ---- Starts the Value Help Dialog for Equipments
			if (!this.getView().dialogChangeStatus) {
				sap.ui.core.Fragment.load({
					id: oView.getId(),
					name: fragmentFile,
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oView.dialogChangeStatus = oDialog;

					that._setStatusData(sceneNumber, activeStatus);

					oView.dialogChangeStatus.addStyleClass(that.getOwnerComponent().getContentDensityClass());
					oView.dialogChangeStatus.open();
				});
			} else {
				this._setStatusData(sceneNumber, activeStatus);

				oView.dialogChangeStatus.addStyleClass(that.getOwnerComponent().getContentDensityClass());
				oView.dialogChangeStatus.open();
			}
		},

		onChangeStatusClose: function () {
			if (this.getView().dialogChangeStatus) {
				this.getView().dialogChangeStatus.close();
			}
		},

		onDialogStatusChangeAfterClose: function () {
			// ---- Reset the Table selection
			if (this.PanelType === "E") {
				this.uiTable.clearSelection();
			} else {
				this.mTable.removeSelections(true);
			}
		},

		_setStatusData: function (sceneNumber, activeStatus) {
			var oComboBox = this.byId("idDialogStatusChange");
			var oModel = new JSONModel();

			// ---- Set Data for model
			var mData = {
				results:[
					{StatusCode:"221_1",Status:"eingegangen"},
					{StatusCode:"221_2",Status:"in Bearbeitung"},
					{StatusCode:"221_3",Status:"abgeschlossen"}
				]
			};
				
			// ---- Set data to the Models
			oModel.setData({
				"StatusCollection": mData.results
			});

			// ---- Create a ComboBox binding
			var oItemTemplate = new sap.ui.core.ListItem();
				oItemTemplate.bindProperty("key", "StatusCode");
				oItemTemplate.bindProperty("text", "Status");
				oItemTemplate.bindProperty("additionalText", "Status");
	
			if (oComboBox !== null && oComboBox !== undefined) {
				oComboBox.setModel(oModel);

				oComboBox.bindItems({ 
					path: "/StatusCollection", 
					template: oItemTemplate, 
					sorter: { path: 'StatusCode' },
					templateShareable:false
				});
				
				oComboBox.setSelectedKey(undefined);
			}

			// ---- Set the actual values for the Scene Number and the actual Status
			var oTextAera1 = this.byId("idTextAreaSceneNumber");
				oTextAera1.setValue(sceneNumber);

			var oTextAera2 = this.byId("idTextAreaActiveStatus");
				oTextAera2.setValue(activeStatus);
		},

		onSelectSceneStatus: function (oEvent) {
			var source = oEvent.getSource();

			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				var key = source.getValue();

				if (key === this.ActiveStatus) {
					this.byId("idButtonChangeStatus").setEnabled(false);
				} else {
					this.byId("idButtonChangeStatus").setEnabled(true);
				}
			}
		},

		onChangeSceneStatus: function (oEvent) {
			var source = oEvent.getSource();

			// ---- Disable the Status Change button
			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				source.setEnabled(false);
			}

			// ---- Close the Status Change Dialog
			if (this.getView().dialogChangeStatus) {
				this.getView().dialogChangeStatus.close();
			}
			
			tools.alertMe("Hier könnte der Status geändert werden, wenn dies gewünscht ist!");
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Table Functions
		// --------------------------------------------------------------------------------------------------------------------

		onBeforeRebindTable_QPLANNER: function (oEvent) {
			var oBindingParams = oEvent.getParameter("bindingParams");

			// ---- Add DataReceived Binding Listener
			tools.addBindingListener(oBindingParams, "dataReceived", this.onDataReceived.bind(this));

			// ---- Set new Custom Filter data for Countries
			var oComboBox = this.smartFilterbar.getControlByKey("MaintenanceOrderType");
			var aMaintenanceOrderType = oComboBox.getSelectedKeys();

			if (aMaintenanceOrderType.length > 0) {
				for (var i = 0; i < aMaintenanceOrderType.length; i++) {
					var newFilter1 = new sap.ui.model.Filter("MaintenanceOrderType", sap.ui.model.FilterOperator.EQ, aMaintenanceOrderType[i]);
					oBindingParams.filters.push(newFilter1);
				}
			}
			
			// ---- Set new Custom Filter data for Business Units
			// oComboBox = this.smartFilterbar.getControlByKey("SceneStatusName");
			// var aStatusKeys = oComboBox.getSelectedKeys();

			// if (aStatusKeys.length > 0) {
			// 	for (i = 0; i < aStatusKeys.length; i++) {
			// 		var newFilter2 = new sap.ui.model.Filter("SceneStatusCode", sap.ui.model.FilterOperator.EQ, aStatusKeys[i]);
			// 		oBindingParams.filters.push(newFilter2);
			// 	}
			// }
		},

		onDataReceived: function (oEvent) {
			var fragmentFile = _fragmentPath + "DialogShowModelData";
			var that = this;

			if (oEvent.getParameters().data !== null && oEvent.getParameters().data !== undefined) {
				let oData = oEvent.getParameter("data");

				if (oData.results.length > 0) {
					this.Data = oData;

					// ---- ToDo: Remove the Uri Parameters
					var test = eams.getUriParameters("ShowModelData");

					if (test) {
						var sPath = "/C_ObjPgMaintOrder(MaintenanceOrder='1000640')";

						// ---- onVisualizeModelTableData: (thisExt, oView, sPath, oData, entity, entityId, fragmentFile, isExpanded, expandArray) {
						eams.onVisualizeModelTableData(this, this.oView, sPath, oData.results[0], "/C_ObjPgMaintOrder", "1000640", fragmentFile, false, "");
					}

					setTimeout(function () {
						if (that.PanelType === "E") {
							tools.autoResizeColumns(that.uiTable);
						}
					}.bind(this), 800);
				}
			}
		},

		onAfterVariantLoad: function (oEvent) {
			if (this.smartFilterbar) {
				// ---- Get the Filter data for custom Countries and set it into the Country Filter
				var filterData = oEvent.getSource().getFilterData();
				var oCustomFieldData = filterData._CUSTOM;

				if (oCustomFieldData !== null && oCustomFieldData !== undefined) {
					this.byId("idMultiComboBoxMaintenanceOrderTypeF4").setSelectedKeys(oCustomFieldData.MaintenanceOrderType);
					// this.byId("idMultiComboBoxSeneStatusF4").setSelectedKeys(oCustomFieldData.SceneStatusName);
				}
			}
		},

		onBeforeVariantSave: function(oEvent) {
			this._updateCustomFilter();
		},

		onBeforeVariantFetch: function() {
			this._updateCustomFilter();
		},

		_updateCustomFilter: function() {
			if (this.smartFilterbar) {
				var aMaintenanceOrderType = this.byId("idMultiComboBoxMaintenanceOrderTypeF4").getSelectedKeys();
				// var aStatusKeys = this.byId("idMultiComboBoxSeneStatusF4").getSelectedKeys();
	
				this.smartFilterbar.setFilterData({ _CUSTOM: {"MaintenanceOrderType": aMaintenanceOrderType}});
				// this.smartFilterbar.setFilterData({ _CUSTOM: {"SceneTypeCode": aStatusKeys}});
			}
		},
		  
		onClearClicked: function (oEvent) {
			// ---- Clear the Custom Filter data
			if (this.byId("idMultiComboBoxMaintenanceOrderTypeF4") !== null && this.byId("idMultiComboBoxMaintenanceOrderTypeF4") !== undefined) {
				this.byId("idMultiComboBoxMaintenanceOrderTypeF4").setSelectedKeys(undefined);
			}

			// if (this.byId("MaintenanceOrderType") !== null && this.byId("idMultiComboBoxSeneStatusF4") !== undefined) {
			// 	this.byId("idMultiComboBoxSeneStatusF4").setSelectedKeys(undefined);
			// }
		},

		// --------------------------------------------------------------------------------------------------------------------

		onPressMobileSelectionChanged: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var oTable = oEvent.getSource();

					if (oTable.getSelectedItem() !== null && oTable.getSelectedItem() !== undefined) {
						// ---- Get the Binding Context
						var item = oTable.getSelectedItem();
						var oBindingContext = item.getBindingContext();
						var oObject = oBindingContext.getObject();

						// this.SelectedSceneNumber = oObject.SceneNumber;
						// this.ActiveStatus = oObject.ActiveText;
					}
				}
			}
		},		
		
		onPressExcelSelectionChanged: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var oTable = oEvent.getSource();

					if (oTable.getSelectedIndex() !== null && oTable.getSelectedIndex() !== undefined) {
						// ---- Get the Binding Context SceneNumber
						var index   = oTable.getSelectedIndex();

						if (index > -1) {
							var oObject = oTable.getContextByIndex(index).getObject();

							// this.SelectedSceneNumber = oObject.SceneNumber;
							// this.ActiveStatus = oObject.ActiveText;
						}
					}
				}
			}
		},		
		
		onPressMobileEntry: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var oItem = oEvent.getSource();

					if (oItem.getBindingContext() !== null && oItem.getBindingContext() !== undefined) {
						// ---- Get the Binding Context
						var oBindingContext = oItem.getBindingContext();
						var oObject = oBindingContext.getObject();

						this.SettingsModel.setProperty("/navigatedItem", this.oModel.getProperty("SceneNumber", oBindingContext));
						// this.onNavToEvidenceList(oObject.SceneNumber);
					}
				}
			}
		},

		onPressExcelEntry: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getParameter("row") !== null && oEvent.getParameter("row") !== undefined) {
					var oRow = oEvent.getParameter("row");

					if (oRow.getBindingContext() !== null && oRow.getBindingContext() !== undefined) {
						// ---- Get the Binding Context SceneNumber
						var oBindingContext = oRow.getBindingContext();
						var oObject = oBindingContext.getObject();

						// this.onNavToEvidenceList(oObject.SceneNumber);
					}
				}
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Navigation Functions
		// --------------------------------------------------------------------------------------------------------------------

		onNavToDetails: function (sceneNumber) {
			// if (sceneNumber !== null && sceneNumber !== undefined && sceneNumber !== "") {
			// 	// ---- Set Starage parameter for routing
			// 	this._setStorageParam();

			// 	// ---- Set Naviagtion parameter for routing
			// 	var sceneNumber = encodeURIComponent(sceneNumber);

			// 	this.getRouter().navTo("sdetails", {
			// 		"SN": sceneNumber
			// 	});
			// }
		},

		onNavToHistory: function (sceneNumber) {
			// if (sceneNumber !== null && sceneNumber !== undefined && sceneNumber !== "") {
			// 	// ---- Set Starage parameter for routing
			// 	this._setStorageParam();

			// 	// ---- Set Naviagtion parameter for routing
			// 	var sceneNumber = encodeURIComponent(sceneNumber);

			// 	this.getRouter().navTo("shistory", {
			// 		"SN": sceneNumber
			// 	});
			// }
		},

		onNavBack: function () {
			// ---- Remove Model data from the local session storage
			this.getStorage().clearStorageItem("SceneListData");

			if (sap.ushell !== null && sap.ushell !== undefined) {
				if (sap.ushell.Container !== null && sap.ushell.Container !== undefined) {
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

					oCrossAppNavigator.toExternal({
						target: {
							shellHash: "#Shell-home"
						}
					});
				}
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Helper Functions
		// --------------------------------------------------------------------------------------------------------------------

		_getPage: function () {
			return this.byId("idDynamicPage_" + APP);
		},

		_resetAll: function () {
			// ---- Reset the Footer behavior (Default: Footer is visible)
			var footerOff = this.getResourceBundle().getText("ToggleFooterOff");

			this._getPage().setShowFooter(true);
			this.byId("idButtonToggleFooter_" + APP).setIcon("sap-icon://busy");
			this.byId("idButtonToggleFooter_" + APP).setText(footerOff);

			// ---- Reset the Table Panels
			this.tablePanelM.setVisible(true);
			this.tablePanelUI.setVisible(false);

			// ---- Reset the M Table
			this.mTable.removeSelections(true);

			// ---- Reset the UI Table
			this.uiTable.clearSelection();

			if (this.uiTable.getBusy()) {
				this.uiTable.setBusy(!this.uiTable.getBusy());
			}

			// ---- Reset the selected Scene Number
			// this.SelectedSceneNumber = "";
			// this.ActiveStatus = "";
		},

		_isNavigated: function (sNavigatedItemId, sItemId) {
			return sNavigatedItemId === sItemId;
		},

		_setStorageParam: function () {
			var oStorageParams = {};
			    oStorageParams.QPlannerListData = this.Data.results;

			// ---- Save Model data to the local session storage
			this.getStorage().setStorageParam("QPlannerListData", oStorageParams);
		}


		// --------------------------------------------------------------------------------------------------------------------
		// END
		// --------------------------------------------------------------------------------------------------------------------

	});
});
