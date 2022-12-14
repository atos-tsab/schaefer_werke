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
	"processlot/controller/BaseController",
	"processlot/model/formatter",
	"processlot/utils/tools",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (BaseController, formatter, tools, JSONModel, Filter) {

	"use strict";

	// ---- The app namespace is to be define here!
	var _fragmentPath = "processlot.view.fragments.";
	var _dataPath = "../model/data/";
	var APP = "processlot";


	return BaseController.extend("processlot.controller.Main", {
		// ---- Implementation of formatter functions
		formatter: formatter,

		// ---- Implementation of an utility toolset for generic use
		tools: tools,


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Init:
		// --------------------------------------------------------------------------------------------------------------------

		onInit: function () {
			this._initLocalVars();
			this._initLocalModels();
			this._initLocalRouting();
		},

		_initLocalVars: function () {
			// ---- Define variables for the License View
			this.oView = this.getView();

			this.CarrierType = "";
			this.SelectedSFC = "";
			this.NewCarrierId = "";
			this.DummyData = true;
			this.MockData = true;

            // ---- Setup the Ajax default connection parameter
            this.AjaxAsyncDefault = this.getResourceBundle().getText("AjaxAsyncDefault");
            this.AjaxTypePost = this.getResourceBundle().getText("AjaxTypePost");
            this.AjaxTypeGet = this.getResourceBundle().getText("AjaxTypeGet");

			// ---- Define the Owner Component for the Tools Util
			tools.onInit(this.getOwnerComponent());

			// ---- Define the Smart components
			this.mTable = this.byId("idTableSFCLot");
		},

		_initLocalModels: function () {
			// ---- Get the Main Models.
			this.oModel = this.getOwnerComponent().getModel();

			// ---- Set the Main Models.
			this.getView().setModel(this.oModel);

			// ---- Set Jason Models.
			this.CarrierTypeModel = new JSONModel();
			this.CarrierIdModel = new JSONModel();
			this.SFCTableModel = new JSONModel();
			this.SFCModel = new JSONModel();
		},

		_initLocalRouting: function () {
			// ---- Handle the routing
			this.getRouter().getRoute("main").attachPatternMatched(this._onObjectMatched, this);
		},

		// --------------------------------------------------------------------------------------------------------------------

		onBeforeRendering: function () {
		},

		onAfterRendering: function () {
		},

		onExit: function () {
			if (this.byId("idTableSFCLot")) {
				this.byId("idTableSFCLot").destroy();
			}
		},

		_onObjectMatched: function (oEvent) {
			// ---- Get the Uri Parameter for the Carrier Type
			var ctype = qhelp.getUriParameterCType("CARRIER_TYPE");

			// ---- Reset all relevant buttons and combo boxes
			this._resetAll();
			this._setCarrierTypeData(ctype);
			this._setSFCNumberData();
			this._createTableData();
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Button Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		onCompleteAll: function (oEvent) {
			tools.alertMe("Complete All button clicked!");
		},

		onAddSFC: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var sValue = this.SelectedSFC;

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						var data = this.SFCTableModel.getData().SFCCollection;

						this.byId("idButtonRemoveAll").setEnabled(false);
						this.byId("idButtonCompleteAll").setEnabled(false);
						this.byId("idButtonAddSFC").setEnabled(false);

						// ---- Find last added Position
						var lastPos = this._findLastPosition(data);

						// ---- Add the last open Position
						for (let j = 0; j < data.length; j++) {
							let item = data[j];

							if (item.Position === lastPos) {
								item.SFC = sValue;
								item.Selection = true;
								item.VisibleSel = true;

								this.byId("idButtonRemoveAll").setEnabled(true);
								this.byId("idButtonCompleteAll").setEnabled(true);

								break;
							}
						}

						this.byId("idComboBoxSFC").setSelectedKey(undefined);
						this.SFCTableModel.setData({ SFCCollection: data });
						this.mTable.setModel(this.SFCTableModel);
						this.SelectedSFC = "";
					}
				}
			}
		},

		onRemoveSelected: function (oEvent, pos, sfcNumber) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var sValue = sfcNumber;

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						var data = this.SFCTableModel.getData().SFCCollection;

						// ---- Remove the selected Position from top to down
						for (let j = 0; j < data.length; j++) {
							let item = data[j];

							if (item.Position === pos) {
								item.SFC = "";
								item.Selection = false;
								item.VisibleSel = false;
							} else if (item.Position === (pos - 1)) {
								item.Selection = true;
							}
						}

						this.SFCTableModel.setData({ SFCCollection: data });
						this.mTable.setModel(this.SFCTableModel);

						if (pos === 1) {
							this._resetBySelection();
						}
					}
				}
			}
		},

		onRemoveAll: function (oEvent) {
			// ---- Reset Table
			this._removeTableData();

			// ---- Reset Buttons
			this.byId("idButtonRemoveAll").setEnabled(false);
			this.byId("idButtonCompleteAll").setEnabled(false);
			this.byId("idButtonAddSFC").setEnabled(false);

			// ---- Reset SFC Combo Box
			this.byId("idComboBoxSFC").setSelectedKey(undefined);
			this.byId("idComboBoxSFC").setValue("");
			this.byId("idInputCarrierId").setValue("");
		},

		// --------------------------------------------------------------------------------------------------------------------

		onChangeCarrierType: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				this.byId("idInputCarrierId").setValue("");

				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var source = oEvent.getSource();
					var sValue = source.getValue();

					if (sValue === "Jig") {
						this._resetByCarrierType();
						this.CarrierType = sValue;
						this._setCarrierIdData(sValue);
					} else if (sValue === "Stack") {
						this._resetByCarrierType();
						this.CarrierType = sValue;
						this._setCarrierIdData(sValue);
					} else {
						this.CarrierIdModel.setData([]);
						this.CarrierType = "";

						source.setSelectedKey(undefined);
						source.setValue("");
					}

					this._createTableData();
				}
			}
		},

		onCreateCarrierId: function () {
			var oData = this.CarrierIdModel.getData().Collection;
			oData.push(this.NewCarrierId);

			this.CarrierIdModel.setData({
				"Collection": oData
			});

			// ---- Find the last added Position
			var data = this.SFCTableModel.getData().SFCCollection;
			var lastPos = this._findLastPosition(data) - 1;
			var that = this;

			if (lastPos > 0) {
				// ---- Create a new Carrierd dataset
				this._createCarrierIdSet(this.CarrierType, this.NewCarrierId, data);

				this.byId("idButtonCreateTable").setEnabled(true);

				tools.alertMe("New Carrier ID created!");

				// ---- Disable the Create button after creation process
				setTimeout(function () {
					that.byId("idButtonCreateTable").setEnabled(false);
					that.byId("idInputCarrierId").setValue("");
					that._createTableData();
				}.bind(this), 3000);
			} else {
				tools.alertMe("Add one or more SFC numbers!");
			}
		},

		_createCarrierIdSet: function (carrierType, newCarrierId, sfcData) {
			var cidModel = this.getOwnerComponent().getModel("cidData");
			var cData = cidModel.getData();
			var mData = {};
			var sData = {};

			if (carrierType === "Jig") {
				mData = {
					"CARRIER_TYPE":    "JIG",
					"CARRIER_TYPE_BO": "CarrierTypeBO:3015,JIG",
					"DESCRIPTION":     "Jig",
					"ProcessLot": newCarrierId.ProcessLot,
					"I_Site": 3015,
					"toStackSFC": []
				};
			} else if (carrierType === "Stack") {
				mData = {
					"CARRIER_TYPE":    "STACK",
					"CARRIER_TYPE_BO": "CarrierTypeBO:3015,STACK",
					"DESCRIPTION":     "Stack",
					"ProcessLot": newCarrierId.ProcessLot,
					"I_Site": 3015,
					"toStackSFC": []
				};
			}

			// ---- Find last added Position
			var lastPos = this._findLastPosition(sfcData) - 1;
			var maxPos = lastPos;

			// ---- Add the last open Position
			for (let j = 0; j < sfcData.length; j++) {
				let item = sfcData[j];

				if (item.Position === lastPos) {
					sData = {
						"RowNumber": item.Position,
						"SFC": item.SFC
					};

					mData.toStackSFC.push(sData);

					lastPos = lastPos - 1;

					// ---- Remove selected SFC entry from the SFC Model
					this._removeSfcSet(item.SFC);
				}

				if (lastPos === 1) {
					this._resetBySelection();
				}
			}

			cData.results.push(mData);
		},

		_removeSfcSet: function (sfcNumber) {
			// ---- Remove entries from the SFC list
			var sfcModel = this.getOwnerComponent().getModel("sfcData");
			var mData = sfcModel.getData().results;

			// ---- Add the last open Position
			for (let j = 0; j < mData.length; j++) {
				let item = mData[j];

				if (item.SFC === sfcNumber) {
					// ---- Remove selected SFC entry from the SFC Model
					mData.splice(j, 1);
				}
			}

			this.SFCModel.setData({
				"SFCCollection": mData
			});
		},

		onChangeCarrierId: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var source = oEvent.getSource();
					var sValue = source.getValue();

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						var oData = this.CarrierIdModel.getData().Collection;
						var check = this._checkCarrierId(oData, sValue);

						if (!check) {
							var data = { ProcessLot: sValue };

							this.NewCarrierId = data;
							this._removeTableData();
							this._resetButtons();
							this.byId("idButtonCreateTable").setEnabled(true);
						}
					} else {
						source.setSelectedKey(undefined);
						source.setValue("");

						this._removeTableData();
						this._resetButtons();
					}
				}
			}
		},

		onChangeComboBoxSFC: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var source = oEvent.getSource();
					var sValue = source.getValue();

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						this.byId("idButtonAddSFC").setEnabled(true);

						this.SelectedSFC = sValue;
					} else {
						source.setSelectedKey(undefined);
						source.setValue("");
					}
				}
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Special Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		_setCarrierTypeData: function (ctype) {
			var cidModel = this.getOwnerComponent().getModel("cidData");
			var xmlFile = _dataPath + "GetCarrierType.xml";
			var inputParam = "";
			var that = this;
			var entry = "";
			var cData = {};

			if (ctype === "JIG") {
				entry = "Jig";
			} else if (ctype === "STACK") {
				entry = "Stack";
			} else {
				entry = "Jig";
			}

			this.CarrierType = entry;
			this._setCarrierIdData();

			if (this.MockData) {
				if (this.DummyData) {
					cidModel = this.getOwnerComponent().getModel("cidData");
					cData = cidModel.getData().results;

					// ---- Set Data model for the selected Carrier Type
					this._loadCarrierTypeComboBox(cData, entry);
				} else {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the selected Carrier Type
						that._loadCarrierTypeComboBox(data, entry);
					}).catch((error) => {
						qhelp.showMessageError(errorMes);
					})
				}
			} else {
				this.onGetData("Build_Module", "SQL_GetCarrierType", inputParam).then((data) => {
					// ---- Set Data model for the selected Carrier Type
					that._loadCarrierTypeComboBox(data, entry);
				}).catch((error) => {
					qhelp.showMessageError(errorMes);
				})
			}
		},

		_loadCarrierTypeComboBox: function (cData, entry) {
			var id = this.byId("idComboBoxCarrierType");
			var mData = { results: [] };

			if (cData !== null && cData !== undefined) {
				var stackCount = 0;
				var jigCount = 0;

				for (let i = 0; i < cData.length; i++) {
					var item = cData[i];
					var xData = {
						"CarrierTypeKey": item.CARRIER_TYPE_BO,
						"CarrierType": item.DESCRIPTION
					};

					if (item.DESCRIPTION === "Jig" && jigCount < 1) {
						mData.results.push(xData);

						jigCount = jigCount + 1;
					} else if (item.DESCRIPTION === "Stack" && stackCount < 1) {
						mData.results.push(xData);

						stackCount = stackCount + 1;
					}
				}
			}

			// ---- Create a ComboBox binding oModels.undefined.oData.CarrierTypeCollection[1].CarrierType
			// ---- onSetComboBoxDataWithSelection: (Jason Model, ComboBox ID, mData, Collection,          Key,              Name,          Additional Text, Sort Parameter, Param,      Entry, show Additional Text)
			tools.onSetComboBoxDataWithSelection(this.CarrierTypeModel, id, mData, "CarrierTypeCollection", "CarrierTypeKey", "CarrierType", "CarrierTypeKey", "CarrierType", "CarrierType", entry, true);
		},

		_setCarrierIdData: function () {
			var inputParam = "Param.1=3015&Param.2=" + this.CarrierType;
			var cidModel = this.getOwnerComponent().getModel("cidData");
			var xmlFile  = _dataPath + "GetProcessLotByCarrierType.xml";
			var that  = this;
			var cData = {};

			if (this.MockData) {
				if (this.DummyData) {
					cidModel = this.getOwnerComponent().getModel("cidData");
					cData = cidModel.getData().results;

					// ---- Set Data model for the selected Carrier Type
					this._loadCarrierIdComboBox(cData);
				} else {
					// ---- Initialize the model with the JSON file
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the selected Carrier Type
						that._loadCarrierIdComboBox(data);
					}).catch((error) => {
						qhelp.showMessageError(errorMes);
					})
				}
			} else {
				this.onGetData("Build_Module", "XAC_GetProcessLotByCarrierType", inputParam).then((data) => {
					// ---- Set Data model for the selected Carrier Type
					that._loadCarrierIdComboBox(data);
				}).catch((error) => {
					qhelp.showMessageError(errorMes);
				})
			}
		},

		_loadCarrierIdComboBox: function (cData) {
			var id = this.byId("idComboBoxCarrierId");
			var mData = { results: [] };
			var that = this;

			if (cData !== null && cData !== undefined) {
				// ---- Set Data model for the selected Carrier Type
				var mData = { results: [] };

				for (let i = 0; i < cData.length; i++) {
					var item = cData[i];

					if (this.DummyData) {
						if (item.DESCRIPTION === that.CarrierType) {
							var xData = { ProcessLot: item.ProcessLot };

							mData.results.push(xData);
						}
					} else {
						if (item) {
							// var carrierType = tools.splitStringIntoArray(item.CARRIER_TYPE_BO, ",")[1];

							// if (carrierType === that.CarrierType.toUpperCase()) {
							var xData = { ProcessLot: item.ProcessLot };

							mData.results.push(xData);
							// }
						}
					}
				}

				this.mData = mData;
			}

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection, Key, Name, Additional Text, Sort Parameter, show Additional Text)
			tools.onSetComboBoxData(this.CarrierIdModel, id, mData, "Collection", "ProcessLot", "ProcessLot", "", "ProcessLot", false);
		},

		_setSFCNumberData: function () {
			var inputParam = "Param.1=3015&Param.2=" + this.CarrierType;
			var sfcModel = this.getOwnerComponent().getModel("sfcData");
			var xmlFile  = _dataPath + "BrowseForSFCByResource.xml";
			var that  = this;
			var cData = {};

			if (this.MockData) {
				if (this.DummyData) {
					sfcModel = this.getOwnerComponent().getModel("sfcData");
					cData = sfcModel.getData().results;

					// ---- Set Data model for the selected Carrier Type
					this._loadSFCNumberComboBox(cData);
				} else {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the selected Carrier Type
						that._loadSFCNumberComboBox(data);
					}).catch((error) => {
						qhelp.showMessageError(errorMes);
					})
				}
			} else {
				this.onGetData("Build_Module", "XAC_BrowseForSFCByResource", inputParam).then((data) => {
					// ---- Set Data model for the selected Carrier Type
					that._loadSFCNumberComboBox(data);
				}).catch((error) => {
					qhelp.showMessageError(errorMes);
				})
			}
		},

		_loadSFCNumberComboBox: function (cData) {
			var id = this.byId("idComboBoxSFC");
			var mData = { results: [] };

			if (cData !== null && cData !== undefined) {
				// ---- Set Data model for the selected Carrier Type
				var mData = { results: [] };

				for (let i = 0; i < cData.length; i++) {
					var item = cData[i];

					if (item) {
						var xData = { SFC: item.SFC };

						mData.results.push(xData);
					}
				}
			}

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection, Key, Name, Additional Text, Sort Parameter, show Additional Text)
			tools.onSetComboBoxData(this.SFCModel, id, mData, "SFCCollection", "SFC", "SFC", "SFC", "SFC", false);
		},

		_fillCarrierIdList: function (carrierId) {
			var cidModel = this.getOwnerComponent().getModel("cidData");
			var xmlFile  = _dataPath + "GetProcessLotMembers.xml";
			var that = this;

			// ---- Set Data model for the selected Carrier Type
			if (this.DummyData) {
				if (cidModel !== null && cidModel !== undefined) {
					var cData = cidModel.getData().results;
					var data  = { results: [] };

					for (let i = 0; i < cData.length; i++) {
						var item = cData[i];

						if (item.DESCRIPTION === that.CarrierType) {
							if (item.ProcessLot === carrierId) {
								if (item.DESCRIPTION === "Jig") {
									data.results = item.toJigSFC;
								} else if (item.DESCRIPTION === "Stack") {
									data.results = item.toStackSFC;
								}
							}
						}
					}
				}

				// ---- Add data to SFC Table
				this._autoFillSFCList(data.results);
			} else {
				if (this.MockData) {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Add data to SFC Table
						that._autoFillSFCList(data);
					})
					.catch((error) => {
						qhelp.showMessageError(errorMes);
					})
				} else {
					// onGetData: (app, taction, aData{ProcessLot, Site})
					this.onGetData("Build_Module", "XAC_GetProcessLotMembers", { "ProcessLot": carrierId, "Site": 3015 }).then((data) => {
						// ---- Add data to SFC Table
						that._autoFillSFCList(data);
					})
					.catch((error) => {
						qhelp.showMessageError(errorMes);
					})
				}
			}
		},

		_autoFillSFCList: function (mData) {
			var that = this;

			// ---- Reset Table
			this._removeTableData();

			// ---- Sort of String fields
			// mData.sort(function (a, b) {
			// 	var numA = a.RowNumber.toString();
			// 	var numB = b.RowNumber.toString();

			// 	return numA.localeCompare(numB);
			// });

			// ---- Add data to SFC Table
			for (let i = 0; i < mData.length; i++) {
				var sValue = mData[i].SFC;

				if (sValue !== null && sValue !== undefined && sValue !== "") {
					var data = this.SFCTableModel.getData().SFCCollection;

					this.byId("idButtonRemoveAll").setEnabled(false);
					this.byId("idButtonCompleteAll").setEnabled(false);
					this.byId("idButtonAddSFC").setEnabled(false);

					// ---- Find last added Position
					var lastPos = this._findLastPosition(data);

					// ---- Add the last open Position
					for (let j = 0; j < data.length; j++) {
						let item = data[j];

						if (item.Position === lastPos) {
							item.SFC = sValue;
							item.Selection = true;
							item.VisibleSel = true;

							this.byId("idButtonRemoveAll").setEnabled(true);
							this.byId("idButtonCompleteAll").setEnabled(true);
						}
					}

					this.byId("idComboBoxSFC").setSelectedKey(undefined);
					this.SFCTableModel.setData({ SFCCollection: data });
					this.mTable.setModel(this.SFCTableModel);
					this.SelectedSFC = "";
				}
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Ajax Functions
		// --------------------------------------------------------------------------------------------------------------------

		onGetData: function (app, prg, aData) {
			var errorMes = this.getResourceBundle().getText("errorText");

			// ---- Get Uri connection string
			var uri = tools._handleQueryUri(app, prg);

			return new Promise((resolve, reject) => {
				try {
					jQuery.ajax({
						url: uri,
						type: "GET",
						async: false,
						data: aData,
						success: function (oData, oResponse) {
							if (oData.Rowsets.Rowset !== null && oData.Rowsets.Rowset !== undefined) {
								var data = oData.Rowsets.Rowset[0].Row;

								resolve(data);
							} else {
								tools.showMessageError(oData.Rowsets.FatalError, "");
							}
						},
						error: function (oError, oResp) {
							reject(oError);
						}
					});
				} catch (error) {
					tools.showMessageError(errorMes);
				}
			});
		},

		onPostData: function (app, prg, aData) {
			var errorMes = this.getResourceBundle().getText("errorText");

			// ---- Get Uri connection string
			var uri = tools._handleQueryUri(app, prg);

			return new Promise((resolve, reject) => {
				try {
					jQuery.ajax({
						url: uri,
						type: "POST",
						async: false,
						data: aData,
						success: function (oData, oResponse) {
							if (oData.Rowsets.Rowset !== null && oData.Rowsets.Rowset !== undefined) {
								var data = oData.Rowsets.Rowset[0].Row;

								resolve(data);
							} else {
								tools.showMessageError(oData.Rowsets.FatalError, "");
							}
						},
						error: function (oError, oResp) {
							reject(oError);
						}
					});
				} catch (error) {
					tools.showMessageError(errorMes);
				}
			});
		},

		_onLoadXmlData: function (xmlFile) {
			var errorMes = this.getResourceBundle().getText("errorText");

			return new Promise((resolve, reject) => {
				try {
					// ---- Initialize the model with the JSON file
					var oModel = new sap.ui.model.xml.XMLModel();
					oModel.loadData(xmlFile);
					oModel.attachRequestCompleted(function (oEventModel) {
						if (oEventModel !== null && oEventModel !== undefined) {
							var success = oEventModel.getParameter("success");

							// ---- Convert XML Data to JASON
							var xmlStr = oModel.getXML();
							var xmlDOM = new DOMParser().parseFromString(xmlStr, 'text/xml');
							var mData  = tools._parseXmlToJson(xmlDOM);

							// ---- Create a ComboBox binding
							if (success) {
								if (mData.Rowsets.Rowset !== null && mData.Rowsets.Rowset !== undefined) {
									if (mData.Rowsets.Rowset.Row.length !== undefined && mData.Rowsets.Rowset.Row.length > 0) {
										var data = mData.Rowsets.Rowset.Row;

										resolve(data);
									} else {
										var data = mData.Rowsets.Rowset.Row;

										resolve(data);
									}
								} else {
									tools.showMessageError(mData.Rowsets.FatalError, "");
								}
							}
						}
					});
				} catch (error) {
					tools.showMessageError(errorMes);
				}
			});
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Dialog Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		onCarrierIdValueHelp: function (oEvent) {
			var title = this.getResourceBundle().getText("CarrierIDs");
			this.CarrierIdInput = oEvent.oSource.sId;

			// ---- Check the Model data in case the Carrier Type is not selected
			if (this.mData !== null && this.mData !== undefined) {
				this.CarrierIdModel.setData({
					"Collection": this.mData.results
				});

				// ---- Create the Value help dialog
				if (!this._valueHelpDialog) {
					this._valueHelpDialog = sap.ui.xmlfragment(_fragmentPath + "DialogCarrierId", this);

					this._valueHelpDialog.setModel(this.CarrierIdModel);
					this._valueHelpDialog.setTitle(title);

					this.getView().addDependent(this._valueHelpDialog);
				}

				// ---- Open Value help dialog
				this._valueHelpDialog.open();
			}
		},

		_handleValueHelpSearch: function (oEvent, param) {
			if (oEvent !== null & oEvent !== undefined) {
				if (oEvent.getParameter("value") !== null & oEvent.getParameter("value") !== undefined) {
					var sValue = oEvent.getParameter("value");

					var oFilter = new Filter(param, sap.ui.model.FilterOperator.Contains, sValue);

					oEvent.getSource().getBinding("items").filter([oFilter]);
				} else {
					oEvent.getSource().getBinding("items").filter([]);
				}
			}
		},

		_handleValueHelpClose: function (oEvent) {
			if (oEvent !== null & oEvent !== undefined) {
				if (oEvent.getParameter("selectedItem") !== null & oEvent.getParameter("selectedItem") !== undefined) {
					var source = oEvent.getSource();
					var sValue = oEvent.getParameter("selectedItem");

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						var carrierIdInput = this.byId(this.CarrierIdInput);
						carrierIdInput.setValue(sValue.getTitle());

						// ---- Fill the SFC Numbers for the selected Carrier ID
						this._fillCarrierIdList(sValue.getTitle());
					} else {
						this._removeTableData();
						this._resetButtons();

						source.setSelectedKey(undefined);
						source.setValue("");
					}
				}

				oEvent.getSource().getBinding("items").filter([]);
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Table Functions
		// --------------------------------------------------------------------------------------------------------------------

		_createTableData: function () {
			var scrollPositions = this._getMaxPosition()[0];
			var maxPositions = this._getMaxPosition()[1];
			var that = this;
			var data = [];

			for (let index = maxPositions; index > 0; index--) {
				var item = {
					Position: index,
					SFC: "",
					Selection: false,
					VisibleSel: false
				};

				data.push(item);
			}

			this.SFCTableModel.setData({
				"SFCCollection": data
			});

			this.mTable.setModel(this.SFCTableModel);

			setTimeout(function () {
				that.byId("idScrollContainerSFC").scrollTo(0, scrollPositions, 0);
			}, 500);
		},

		_removeTableData: function () {
			this._createTableData();
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Navigation Functions
		// --------------------------------------------------------------------------------------------------------------------

		onNavBack: function () {
			// if (sap.ushell !== null && sap.ushell !== undefined) {
			// 	if (sap.ushell.Container !== null && sap.ushell.Container !== undefined) {
			// 		var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			// 		oCrossAppNavigator.toExternal({
			// 			target: {
			// 				shellHash: "#Shell-home"
			// 			}
			// 		});
			// 	}
			// } else {
				setTimeout(function () {
					window.close();
				}, 800);
			// }
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Helper Functions
		// --------------------------------------------------------------------------------------------------------------------

		_checkCarrierId: function (oData, sValue) {
			var check = false;

			// ---- Check the new Carrier ID against the model
			if (oData !== null && oData !== undefined) {
				for (var i = 0; i < oData.length; i++) {
					var id = oData[i].I_ProcessLot;

					if (id === sValue) {
						check = true;
						break;
					}
				}
			}

			return check;
		},

		_getMaxPosition: function () {
			var scrollPositions = 0;
			var maxPositions = 0;

			if (this.CarrierType === "Jig") {
				maxPositions = 20;
				scrollPositions = 880;
			} else if (this.CarrierType === "Stack") {
				maxPositions = 40;
				scrollPositions = 990;
			} else {
				maxPositions = 16;
				scrollPositions = 0;
			}

			return [scrollPositions, maxPositions];
		},

		_findLastPosition: function (data) {
			var lastPos = 0;

			for (let index = 0; index < data.length; index++) {
				let item = data[index];
				item.Selection = false;

				if (item.SFC !== "") {
					lastPos = item.Position;

					break;
				}
			}

			// ---- Add the last open Position
			lastPos = lastPos + 1;

			return lastPos;
		},

		_resetAll: function () {
			// ---- Reset Model data
			this.CarrierIdModel.setData([]);
			this.SFCTableModel.setData([]);
			this.SFCModel.setData([]);

			// ---- Reset the Buttons
			this._resetButtons();
		},

		_resetBySelection: function () {
			// ---- Reset Buttons
			this.byId("idButtonRemoveAll").setEnabled(false);
			this.byId("idButtonCompleteAll").setEnabled(false);
			this.byId("idButtonAddSFC").setEnabled(false);

			// ---- Reset SFC Combo Box
			this.byId("idComboBoxSFC").setSelectedKey(undefined);
			this.byId("idComboBoxSFC").setValue("");
		},

		_resetByCarrierType: function () {
			// ---- Reset the Buttons
			this._resetButtons();

			// ---- Reset the SFC Table
			this._removeTableData();

			this.byId("idInputCarrierId").setSelectedKey(undefined);
			this.byId("idComboBoxSFC").setSelectedKey(undefined);
		},

		_resetButtons: function () {
			// ---- Reset the Buttons
			this.byId("idButtonRemoveAll").setEnabled(false);
			this.byId("idButtonCreateTable").setEnabled(false);
			this.byId("idButtonCompleteAll").setEnabled(false);
			this.byId("idButtonAddSFC").setEnabled(false);
		}


		// --------------------------------------------------------------------------------------------------------------------
		// END
		// --------------------------------------------------------------------------------------------------------------------

	});
});
