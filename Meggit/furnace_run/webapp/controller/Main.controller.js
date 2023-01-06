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
	"furnacerun/controller/BaseController",
	"furnacerun/model/formatter",
	"furnacerun/utils/tools",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (BaseController, formatter, tools, JSONModel, Filter) {

	"use strict";

	// ---- The app namespace is to be define here!
	var _fragmentPath = "furnacerun.view.fragments.";
	var _dataPath = "../model/data/";
	var APP = "furnacerun";


	return BaseController.extend("furnacerun.controller.Main", {

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
			// ---- Define variables for the Main View
			this.ImagePath = this.getResourceBundle().getText("ImagePath");
			this.oView = this.getView();

			this.DummyData = false;
			this.MockData  = true;

			this.Layer             = "";
			this.Position          = "";
			this.RunAction         = "";
			this.ProcessLot        = "";
			this.SelectedStatus    = "";
			this.SelectedResource  = "";
			this.SelectedFurnRunId = "";

			// ---- Setup the Ajax default connection parameter
			this.AjaxAsyncDefault = this.getResourceBundle().getText("AjaxAsyncDefault");
			this.AjaxTypePost     = this.getResourceBundle().getText("AjaxTypePost");
			this.AjaxTypeGet      = this.getResourceBundle().getText("AjaxTypeGet");

			// ---- Define the Owner Component for the Tools Util
			tools.onInit(this.getOwnerComponent());

			// ---- Define the Components
			this.uiTable = this.byId("idTableWorkList");
		},

		_initLocalModels: function () {
			// ---- Get the Main Models.
			this.oModel = this.getOwnerComponent().getModel();

			// ---- Set the Main Models.
			this.getView().setModel(this.oModel);

			// ---- Set Jason Models.
			this.oColModel         = new JSONModel();
			this.ImageModel        = new JSONModel();
			this.StatusModel       = new JSONModel();
			this.LayerModel        = new JSONModel();
			this.LayerDetailsModel = new JSONModel();
			this.ResourceModel     = new JSONModel();
			this.FurnaceRunIdModel = new JSONModel();
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
			if (this.byId("idTableWorkList")) {
				this.byId("idTableWorkList").destroy();
			}
		},

		_onObjectMatched: function (oEvent) {
			// ---- Reset all relevant buttons and combo boxes
			this._resetAll();
			this._setResourceData();
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Button Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		onStatusChangePress: function () {
			var status = this.byId("idInputFurnaceStatus").getValue();
			var sId    = this.byId("idInputFurnaceStatus").getId();

			this._setStatusData(status, sId);
		},

		onPressWI: function () {
			// tools.alertMe("Button WI pressed!");
		},

		onPressComment: function () {
			// tools.alertMe("Button Comment pressed!");
		},

		onPressLogNC: function () {
			// tools.alertMe("Button Log NC pressed!");
		},

		onLoadJig: function (event, layer, pos) {
			var title = this.getResourceBundle().getText("EnterProcessLot");
			
			this.Layer      = layer;
			this.Position   = pos;
			this.RunAction  = "LOAD";
			this.ProcessLot = "";

			// ---- Create the Status Change dialog
			if (!this._loadJigDialog) {
				this._loadJigDialog = sap.ui.xmlfragment(_fragmentPath + "DialogProcessLot", this);
				this._loadJigDialog.setTitle(title);
	
				this.getView().addDependent(this._loadJigDialog);
			} else {
				sap.ui.getCore().byId("idInputProcessLot").setValue("");
			}

			// ---- Open the Status Change dialog
			this._loadJigDialog.open();
		},

		onProcessLotPress: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getParameter("value") !== null && oEvent.getParameter("value") !== undefined) {
					this.ProcessLot = oEvent.getParameter("value");					
				}
			}
		},
			
		onSaveLoadJigDialog: function (oEvent) {
			this._loadJigDialog.close();

			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				if (this.ProcessLot !== null && this.ProcessLot !== undefined) {

					this._StartSFCByProcessLot(this.ProcessLot, this.Layer, this.Position, this.RunAction);
				}
			}
		},
	
		onCloseLoadJigDialog: function (event) {
			this.Layer      = "";
			this.Position   = "";
			this.RunAction  = "";
			this.ProcessLot = "";
			
			this._loadJigDialog.close();
		},

		onUnLoadJig: function (event, layer, pos, jigId) {
			this.Layer      = layer;
			this.Position   = "";
			this.RunAction  = "UNLOAD";
			this.JigID      = jigId;

			this._SignOffSFCByProcessLot(this.JigID, this.Layer, this.Position, this.RunAction);
		},

		onPressAvatar: function (oEvent) {
			// tools.alertMe("Avatar button clicked!");
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Combo Box Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		onSelectionChangeResource: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var source = oEvent.getSource();
					var sValue = source.getValue();

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						// ---- Reset all Comboxes
						this._resetAll();

						if (this.byId("idComboBoxLayer").getModel() !== null && this.byId("idComboBoxLayer").getModel() !== undefined) {
							this.byId("idComboBoxLayer").getModel().setData([]);
						}
			
						// ---- Start with Resource selection
						this.SelectedResource = sValue;
						this._setFurnaceRunIdData(sValue);
					} else {
						source.setSelectedKey(undefined);
						source.setValue("");
					}
				}
			}
		},

		onSelectionChangeFurnRunId: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var source = oEvent.getSource();
					var sValue = source.getValue();

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						this.RunId = sValue;
						this._setLayerByRunIdData(sValue);
					} else {
						source.setSelectedKey(undefined);
						source.setValue("");
					}
				}
			}
		},

		onSelectionChangeLayer: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var source = oEvent.getSource();
					var sValue = source.getValue();

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						this.SelectedFurnRunId = sValue;
						
						this._setLayerDetailsData(sValue);
						this._setLayerDetailsImage(sValue);
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

		_setResourceData: function () {
			var resModel = this.getOwnerComponent().getModel("resData");
			var xmlFile = _dataPath + "GetResourceByResourceType.xml";
			var inputParam = "Param.1=1021&Param.2=RT_FURNACE";
			var that = this;
			var data = {};

			if (this.MockData) {
				if (this.DummyData) {
					data = resModel.getData().results;

					// ---- Set Data model for the Resources
					this._loadResourceData(data);
				} else {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the Resources
						that._loadResourceData(data);
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Resource", "SQL_GetResourceByResourceType", inputParam).then((data) => {
					// ---- Set Data model for the Resources
					that._loadResourceData(data);
				}).catch((error) => {
					tools.showMessageError(error);
				})
			}
		},

		_loadResourceData: function (oData) {
			var id = this.byId("idComboBoxResource");
			var mData = { results: [] };
			var entry = "";

			if (oData !== null && oData !== undefined) {
				for (let i = 0; i < oData.length; i++) {
					var item = oData[i];

					var xData = {
						"RESOURCE":      item.RESOURCE,
						"RESOURCE_TYPE": item.RESOURCE_TYPE
					};

					mData.results.push(xData);
				}
			}

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxDataWithSelection: (Jason Model, ComboBox ID, mData, Collection,          Key,              Name, Additional Text, Sort Parameter, Param,      Entry, show Additional Text)
			tools.onSetComboBoxDataWithSelection(this.ResourceModel, id, mData, "ResourceCollection", "RESOURCE_TYPE", "RESOURCE", "RESOURCE_TYPE", "RESOURCE", "RESOURCE", entry, true);
		},

		_setFurnaceRunIdData: function (resource) {
			var inputParam = "Param.1=1021&Param.2=ResourceBO:1021," + resource;
			var friModel  = this.getOwnerComponent().getModel("friData");
			var xmlFile1  = _dataPath + "GetFurnaceRunIDByResource.xml";
			var xmlFile2  = _dataPath + "GetFurnaceRunDetailsByResource.xml";
			this.Resource = resource;
			var that = this;
			var data = {};

			if (this.MockData) {
				if (this.DummyData) {
					data = friModel.getData().results;

					// ---- Set Data model for the Furnace
					this._loadFurnaceRunIdData(data, resource);

					var mdata = {
						"FURNACE_RUN_STATUS": "LOADING",
						"FURNACE_RUN_START_DATE": "NA",
						"FURNACE_RUN_END_DATE": "NA",
						"RunTime": 0,
						"RemainingTime": 0
					}

					that._loadStatusDetailData(mdata);
				} else {
					this._onLoadXmlData(xmlFile1).then((data) => {
						// ---- Set Data model for the Furnace
						that._loadFurnaceRunIdData(data, resource);
					}).catch((error) => {
						tools.showMessageError(error);
					})

					this._onLoadXmlData(xmlFile2).then((data) => {
						// ---- Set Data model for the Furnace
						that._loadStatusDetailData(data);
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Furnace", "SQL_GetFurnaceRunIDByResource", inputParam).then((data) => {
					// ---- Set Data model for the Furnace
					that._loadFurnaceRunIdData(data, resource);
				}).catch((error) => {
					tools.showMessageError(error);
				})

				this.onGetData("Furnace", "SQL_GetFurnaceRunDetailsByResource", inputParam).then((data) => {
					// ---- Set Data model for the Furnace
					that._loadStatusDetailData(data);
				}).catch((error) => {
					tools.showMessageError(error);
				})
			}
		},

		_loadFurnaceRunIdData: function (oData, resource) {
			var id = this.byId("idComboBoxFurnRunId");
			var mData = { results: [] };
			var entry = resource;

			if (oData !== null && oData !== undefined) {
				for (let i = 0; i < oData.length; i++) {
					var item = oData[i];
					var res  = item.FurnaceRunID.substring(0, resource.length);

					if (res === resource) {
						var xData = {
							"FurnaceRunID":   item.FurnaceRunID,
							"PlannedRunDate": item.PlannedRunDate
						};

						mData.results.push(xData);
					}
				}

				this.byId("idButtonStatusChange").setEnabled(true);
			} else {
				this.byId("idButtonStatusChange").setEnabled(false);
			}

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxDataWithSelection: (Jason Model, ComboBox ID, mData, Collection,          Key,              Name, Additional Text, Sort Parameter, Param,      Entry, show Additional Text)
			tools.onSetComboBoxDataWithSelection(this.FurnaceRunIdModel, id, mData, "RunIdCollection", "FurnaceRunID", "FurnaceRunID", "PlannedRunDate", "FurnaceRunID", "FurnaceRunID", entry, true);
		},

		_loadStatusDetailData: function (oData, resource) {
			var id = this.byId("idComboBoxFurnRunId");
			var mData = { results: [] };
			var entry = resource;

			if (oData !== null && oData !== undefined) {
				if (this.MockData) {
					if (oData.FURNACE_RUN_START_DATE === "NA") { oData.FURNACE_RUN_START_DATE = ""; }
					if (oData.RemainingTime === "0" || oData.RemainingTime === 0) { oData.RemainingTime = "00:00"; }
					if (oData.RunTime === "0" || oData.RunTime === 0) { oData.RunTime = "00:00"; }

					this.byId("idInputFurnaceStatus").setValue(oData.FURNACE_RUN_STATUS);
					this.byId("idInputStartDateTime").setValue(oData.FURNACE_RUN_START_DATE);
					this.byId("idInputRemainTime").setValue(oData.RemainingTime);
					this.byId("idInputRunTime").setValue(oData.RunTime);

					this.SelectedStatus = oData.FURNACE_RUN_STATUS;
				} else {
					if (oData[0].FURNACE_RUN_START_DATE === "NA") { oData[0].FURNACE_RUN_START_DATE = ""; }
					if (oData[0].RemainingTime === "0" || oData[0].RemainingTime === 0) { oData[0].RemainingTime = "00:00"; }
					if (oData[0].RunTime === "0" || oData[0].RunTime === 0) { oData[0].RunTime = "00:00"; }

					this.byId("idInputFurnaceStatus").setValue(oData[0].FURNACE_RUN_STATUS);
					this.byId("idInputStartDateTime").setValue(oData[0].FURNACE_RUN_START_DATE);
					this.byId("idInputRemainTime").setValue(oData[0].RemainingTime);
					this.byId("idInputRunTime").setValue(oData[0].RunTime);

					this.SelectedStatus = oData[0].FURNACE_RUN_STATUS;
				}
			}
		},

		_setLayerByRunIdData: function (runId) {
			var layModel = this.getOwnerComponent().getModel("layData");
			var xmlFile  = _dataPath + "GetLayersByFurnaceRunID.xml";
			var inputParam = "Param.1=1021&Param.2=" + runId;
			var that = this;
			var data = {};

			this.RunId = runId;

			if (this.MockData) {
				if (this.DummyData) {
					data = layModel.getData().results;

					// ---- Set Data model for the Furnace
					this._loadLayerByRunIdData(data, runId);
				} else {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the Furnace
						that._loadLayerByRunIdData(data, runId);
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Furnace", "SQL_GetLayersByFurnaceRunID", inputParam).then((data) => {
					// ---- Set Data model for the Furnace
					that._loadLayerByRunIdData(data, runId);
				}).catch((error) => {
					tools.showMessageError(error);
				})
			}
		},

		_loadLayerByRunIdData: function (oData, runId) {
			var id = this.byId("idComboBoxLayer");
			var mData = { results: [] };
			var entry = runId;
				entry = "";

			if (oData !== null && oData !== undefined) {
				for (let i = 0; i < oData.length; i++) {
					var item = oData[i];
					var rID  = item.LayerType.substring(0, runId.length);

					// ---- ToDo: Get all Layers for the selected Furnace Run ID
					runId = rID;

					if (rID === runId) {
						var xData = {
							"Layer": item.Layer,
							"LayerType": item.LayerType
						};

						mData.results.push(xData);
					}
				}
			}

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxDataWithSelection: (Jason Model, ComboBox ID, mData, Collection,          Key,              Name, Additional Text, Sort Parameter, Param,      Entry, show Additional Text)
			tools.onSetComboBoxDataWithSelection(this.LayerModel, id, mData, "LayerCollection", "Layer", "Layer", "LayerType", "Layer", "Layer", entry, true);
		},

		_setLayerDetailsData: function (layer) {
			var inputParam = "Param.1=1021&Param.2=" + this.RunId + "&Param.3=" + layer;
			var detModel = this.getOwnerComponent().getModel("layDetailsData");
			var xmlFile  = _dataPath + "GetLayerDetailsByFurnaceLayer.xml";
			var that = this;
			var data = {};

			if (this.MockData) {
				if (this.DummyData) {
					data = detModel.getData().results;

					// ---- Set Data model for the Furnace
					this._loadLayerDetailsData(data, layer);
				} else {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the Furnace
						that._loadLayerDetailsData(data, layer);
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Furnace", "SQL_GetLayerDetailsByFurnaceLayer", inputParam).then((data) => {
					// ---- Set Data model for the Furnace
					that._loadLayerDetailsData(data, layer);
				}).catch((error) => {
					tools.showMessageError(error);
				})
			}
		},

		_setLayerDetailsImage: function (layer) {
			var inputParam = "{'Param.1':'1021','Param.2':'" + layer + "'}";
			var xmlFile = _dataPath + "GetLayerDetailsByFurnaceLayer.xml";
			var that = this;
			var data = {};

			if (this.MockData) {
				if (this.DummyData) {
					// ---- Set the Image by the selected Layer
					var iSource = this.ImagePath + this.RunId + "_" + layer + ".jpg";

					if (layer === "1" || layer === "2" || layer === "3") {
						this.byId("idImagePod").setSrc(iSource);
					} else {
						this.byId("idImagePod").setSrc(this.ImagePath + "NotFound.jpg");
					}
				} else {
					// ---- Set the Image by the selected Layer
					var iSource = this.ImagePath + this.RunId + "_" + layer + ".jpg";

					if (layer === "1" || layer === "2" || layer === "3") {
						setTimeout(function () {
							that.byId("idImagePod").setSrc(iSource);
						}, 800);
					} else {
						setTimeout(function () {
							that.byId("idImagePod").setSrc(this.ImagePath + "NotFound.jpg");
						}, 800);
					}
				}
			} else {
				// ---- Set the Image by the selected Layer
				var iPath = "http://gb1isapnw01v.meggitt.net:50000/XMII/CM/Meggitt_Carbon_Refresh_UK/furnace_run/images/";
				var iSource = iPath + this.RunId + "_" + layer + ".jpg";

				if (layer === "1" || layer === "2" || layer === "3") {
					// setTimeout(function () {
						that.byId("idImagePod").setSrc(iSource);
					// }, 800);
				} else {
					// setTimeout(function () {
						that.byId("idImagePod").setSrc(iPath + "NotFound.jpg");
					// }, 800);
				}
			}
		},

		_loadLayerDetailsData: function (oData, layer) {
			var status = this.byId("idInputFurnaceStatus").getValue();
			var mData  = { results: [] };
			var entry  = layer;

			if (oData !== null && oData !== undefined) {
				for (let i = 0; i < oData.length; i++) {
					var item = oData[i];

					if (item.LoadedModuleID === "" || item.LoadedModuleID === "NA") {
						oData[i].LoadedModuleID = "...";
					} else {
						var jigID = tools.splitStringIntoArray(oData[i].LoadedModuleID, ",");

						if (jigID !== null && jigID !== undefined) {
							oData[i].LoadedModuleID = jigID[1];
						}
					}

					if (status === "LOADING") {
						oData[i].LoadShow = true;
						oData[i].LoadEnabled = true;
						oData[i].UnloadShow = true;
						oData[i].UnloadEnabled = false;
					} else if (status === "UNLOAD") {
						oData[i].LoadShow = false;
						oData[i].LoadEnabled = false;
						oData[i].UnloadShow = true;
						oData[i].UnloadEnabled = true;
					} else {
						oData[i].LoadShow = false;
						oData[i].LoadEnabled = false;
						oData[i].UnloadShow = false;
						oData[i].UnloadEnabled = false;
					}

					if (oData[i].LoadedModuleID !== "...") {
						oData[i].LoadShow = true;
						oData[i].LoadEnabled = false;
						oData[i].UnloadShow = true;
						oData[i].UnloadEnabled = true;
					}
					
					mData.results.push(oData[i]);
				}
			}

			// ---- Table binding
			this.LayerDetailsModel.setData(mData.results);

			this.uiTable.setModel(this.LayerDetailsModel);
			this.uiTable.bindRows("/");
		},

		_setStatusData: function (status, sId) {
			var statusModel = this.getOwnerComponent().getModel("statusData");
			var xmlFile     = _dataPath + "GetFurnaceStatusList.xml";
			var inputParam  = "Param.1=1021&Param.2=LOADING";
			var that = this;
			var data = {};

			if (this.MockData) {
				if (this.DummyData) {
					data = statusModel.getData().results;

					// ---- Set Data model for the Furnace
					this._openStatusChangeDialog(data, status, sId);
				} else {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the Furnace
						that._openStatusChangeDialog(data, status, sId);
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Furnace", "SQL_GetFurnaceStatusList", inputParam).then((data) => {
					// ---- Set Data model for the Furnace
					that._openStatusChangeDialog(data, status, sId);
				}).catch((error) => {
					tools.showMessageError(error);
				})
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Special MII Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		_StartSFCByProcessLot: function (pocessLot, layer, pos, action) {
			var inputParam = "Param.1=1021&Param.2=" + this.Resource + "&Param.3=" + pocessLot;
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				this.onPostData("Process_Lots", "XAC_StartSFCByProcessLot", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].SFCStartStatus === 1) {
							that._AssignFurnaceDataToSFC(pocessLot, layer, pos, action);
						} else {
							tools.showMessageError(data[0].StatusMessage);
						}
					}
				}).catch((error) => {
					tools.showMessageError(error);
				})
			}
		},

		_AssignFurnaceDataToSFC: function (pocessLot, layer, pos, action) {
			var inputParam = "Param.1=1021&Param.2=" + pocessLot + "&Param.3=" + this.RunId + "&Param.4=" + layer + "&Param.5=" + pos + "&Param.6=" + action;
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				this.onPostData("Furnace", "XAC_AssignFurnaceDataToSFC", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].OutputStatus === 1) {
							that._setLayerDetailsData(that.Layer);
						} else {
							tools.showMessageError(data[0].OutputMessage);
						}
					}
				}).catch((error) => {
					tools.showMessageError(error);
				})
			}
		},

		_SignOffSFCByProcessLot: function (jigId, layer, pos, action) {
			var inputParam = "Param.1=1021&Param.2=" + this.Resource + "&Param.3=" + jigId;
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				this.onPostData("Process_Lots", "XAC_SignOffSFCByProcessLot", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].SFCCancelStatus === 1) {
							that._AssignFurnaceDataToSFC(jigId, "", pos, action);
						} else {
							tools.showMessageError(data[0].StatusMessage);
						}
					}
				}).catch((error) => {
					tools.showMessageError(error);
				})
			}
		},

		_CompleteSFCByProcessLot: function (pocessLot) {
			var inputParam = "Param.1=1021&Param.2=" + this.Resource + "&Param.3=" + pocessLot;
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				// this.onPostData("Process_Lots", "XAC_CompleteSFCByProcessLot", inputParam).then((data) => {
				// 	// ---- Check Data for Success
				// 	if (data !== null && data !== undefined) {
				// 		if (data[0].SFCCancelStatus === 1) {
				// 			that._AssignFurnaceDataToSFC(pocessLot, layer, pos, action);
				// 		} else {
				// 			tools.showMessageError(data[0].StatusMessage);
				// 		}
				// 	}
				// }).catch((error) => {
				// 	tools.showMessageError(error);
				// })
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Dialog Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		_openStatusChangeDialog: function (data, status, sid) {
			var title  = this.getResourceBundle().getText("FurnaceStatusChange");

			// ---- Create the Status Change dialog
			if (!this._statusChangeDialog) {
				this._statusChangeDialog = sap.ui.xmlfragment(_fragmentPath + "DialogStatus", this);
				this._statusChangeDialog.setModel(this.StatusModel);
				this._statusChangeDialog.setTitle(title);

				// ---- Add the external Input field ID to the Value Help component for later use
				this._statusChangeDialog.DialogInputSId = sid;
	
				// var oInput = this.byId("idInputCurFurnaceStatus");
				// 	oInput.setValue(status);

				this._createInput(status);
				this._createTable(data);

				this.getView().addDependent(this._statusChangeDialog);
			}

			// ---- Open the Status Change dialog
			this._statusChangeDialog.open();
		},

		onSaveStatusDialog: function (oEvent) {
			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				if (this.SelectedStatus !== null && this.SelectedStatus !== undefined) {
					var oInput = this.byId(this._statusChangeDialog.DialogInputSId);
						oInput.setValue(this.SelectedStatus);

					// ---- Reset the Table data
					this._resetTableData();
				} else {
					this._removeTableData();
					this._resetButtons();
				}
	 
				this._statusChangeDialog.close();
			}
		},
	
		onCloseStatusDialog: function () {
			this._statusChangeDialog.close();
		},

		onRowsDataChange: function (oEvent) {
			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				var index = oEvent.getParameter("rowIndex"); 
				var source = oEvent.getSource();
				var oModel = source.getModel();
				
				if (index > -1) {
					var data = oModel.getData().rows[index];

					this.SelectedStatus = data.Status;
				}
			}
		},

		_createInput: function (status) {
			var lbl = this.getResourceBundle().getText("CurFurnaceStatus");
	
			// ---- Create the Label for the Input field
			var oLabel  = new sap.m.Label({	width: "160px" });
				oLabel.addStyleClass("sapUiSmallMarginBegin");
				oLabel.setText(lbl);
				oLabel.placeAt(this._statusChangeDialog);

			// ---- Create the Input field
			var oInput = new sap.m.Input("idInputCurFurnaceStatus", { width: "200px" });
				oInput.addStyleClass("sapUiSmallMarginEnd");
				oInput.setValue(status);
				oInput.placeAt(this._statusChangeDialog);
		},

		_createTable: function (data) {
			var title = this.getResourceBundle().getText("StatusList");
			var columnData = [{columnName: "Status"}];
			var rowData = data;
			var that    = this;
	
			// ---- Create the Table
			var oTable = new sap.ui.table.Table("idTableStatusList", {
				title: title,
				threshold: 100,
				visibleRowCount: 10
			});
	
			oTable.setSelectionMode(sap.ui.table.SelectionMode.Single);
			oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
			oTable.addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd");

			var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					rows: rowData,
					columns: columnData
				});

			oTable.setModel(oModel);
		  
			oTable.bindColumns("/columns", function (sId, oContext) {
				var columnName = oContext.getObject().columnName;

				return new sap.ui.table.Column({
					label: columnName,
					template: columnName,
				});
			});
		  
			oTable.bindRows("/rows");

			oTable.attachRowSelectionChange(function (oEvent) {
				that.onRowsDataChange(oEvent);
			});
		
			oTable.placeAt(this._statusChangeDialog);

			// ---- Add the external Table ID to the Value Help component for later use
			this._statusChangeDialog.DialogTableSId = oTable.getId();
		},

		_resetTableData: function () {
			// ---- Reset the Table data
			var layer = this.byId("idComboBoxLayer").getValue();
			var data = [];

			if (this.uiTable.getModel() !== null && this.uiTable.getModel() !== undefined) {
				data = this.uiTable.getModel().getData();
			}

			if (layer !== "" && data.length > 0) {
				this._loadLayerDetailsData(data, layer);
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
		// ---- Navigation Functions
		// --------------------------------------------------------------------------------------------------------------------

		onNavBack: function () {
			setTimeout(function () {
				window.close();
			}, 800);
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Helper Functions
		// --------------------------------------------------------------------------------------------------------------------

		_resetAll: function () {
			// ---- Reset the Images
			if (this.MockData) {
				this.byId("idImagePod").setSrc(this.ImagePath + "Default.jpg");
			} else {
				var iPath = "http://gb1isapnw01v.meggitt.net:50000/XMII/CM/Meggitt_Carbon_Refresh_UK/furnace_run/images/";
			
				this.byId("idImagePod").setSrc(iPath + "Default.jpg");
			}

			// ---- Reset the Buttons
			this.byId("idButtonStatusChange").setEnabled(false);

			// ---- Reset the Input and Comboboxes
			this.byId("idComboBoxFurnRunId").setSelectedKey(undefined);
			this.byId("idComboBoxResource").setSelectedKey(undefined);
			this.byId("idComboBoxLayer").setSelectedKey(undefined);

			this.byId("idInputFurnaceStatus").setValue("");
			this.byId("idInputStartDateTime").setValue("");
			this.byId("idInputRemainTime").setValue("00:00");
			this.byId("idInputRunTime").setValue("00:00");

			if (this.uiTable.getModel() !== null && this.uiTable.getModel() !== undefined) {
				this.uiTable.getModel().setData([]);
			}
		}


		// --------------------------------------------------------------------------------------------------------------------
		// END
		// --------------------------------------------------------------------------------------------------------------------

	});
});
