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

			this.Override   = false;
			this.DummyData  = false;
			this.MockData   = true;
			this.IntervalOn = false;

			this.Site               = "";
			this.Layer              = "";
			this.LayerType		    = "";
			this.Position           = "";
			this.RunAction          = "";
			this.ProcessLot         = "";
			this.SelectedLayer      = "";
			this.SelectedStatus     = "";
			this.SelectedResource   = "";
			this.SelectedJigComment = "";
			this.CommentType        = "";
			this.FurnaceLoadFlag    = 0;

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
			this.viewModel           = new JSONModel();
			this.oColModel           = new JSONModel();
			this.ImageModel          = new JSONModel();
			this.StatusModel         = new JSONModel();
			this.LayerModel          = new JSONModel();
			this.LayerDetailsModel   = new JSONModel();
			this.ResourceModel       = new JSONModel();
			this.FurnaceRunIdModel   = new JSONModel();
			this.CommentDetailsModel = new JSONModel();
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
			// ---- Get the Site parameter vai Url
			this.Site = tools.getUriParameterCType("SITE");

			if (this.Site) {
				var viewData = {
					"Site": this.Site
				};

				this.viewModel.setData(viewData);
				this.getView().setModel(this.viewModel, "viewModel");
			}

			// ---- Reset all relevant buttons and combo boxes
			this._resetAll(false);
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
			var data = this.uiTable.getModel().getData();

			this._open_CommentDialog(data);
		},

		onPressLogNC: function () {
			// tools.alertMe("Button Log NC pressed!");
		},

		onLoadJig: function (event, layer, pos, mtype) {
			var title = this.getResourceBundle().getText("EnterProcessLot");
			
			this.Layer        = layer;
			this.Position     = pos;
			this.RunAction    = "LOAD";
			this.ProcessLot   = "";
			this.MaterialType = mtype;
			
			// ---- Create the Status Change dialog
			if (!this._loadJigDialog) {
				this._loadJigDialog = sap.ui.xmlfragment(_fragmentPath + "DialogProcessLot", this);
				this._loadJigDialog.setTitle(title);
				this._loadJigDialog.setContentHeight("100px");
	
				this.getView().addDependent(this._loadJigDialog);

				// ---- Reset Dialog components
				this.Override = false;
			} else {
				sap.ui.getCore().byId("idTextAreaComment").setValue("");

				if (this.Override) {
					var stackId = sap.ui.getCore().byId("idInputProcessLot").getValue();

					this._checkOverride(stackId);
				} else {
					sap.ui.getCore().byId("idInputProcessLot").setValue("");
				}
			}

			// ---- Open the Status Change dialog
			this._loadJigDialog.open();
		},

		_checkOverride: function (pocessLot) {
			var titleOL = this.getResourceBundle().getText("OverrideLoaded");
			var title   = this.getResourceBundle().getText("EnterProcessLot");

			sap.ui.getCore().byId("idInputProcessLot").setValue(pocessLot);

			// ---- Change Title and show additional components in chase of overriding
			if (this.Override) {
				this._loadJigDialog.setTitle(titleOL);
				this._loadJigDialog.setContentHeight("230px");

				sap.ui.getCore().byId("idLabelErrorStackId").addStyleClass("atosStackError");
				sap.ui.getCore().byId("idLabelErrorQuestion").addStyleClass("atosStackError");

				sap.ui.getCore().byId("idButtonOverrideStackId").setVisible(true);
				sap.ui.getCore().byId("idButtonSaveStackId").setVisible(false);
				sap.ui.getCore().byId("idVBoxStackIdError").setVisible(true);
			} else {
				this._loadJigDialog.setTitle(title);
				this._loadJigDialog.setContentHeight("100px");

				sap.ui.getCore().byId("idButtonOverrideStackId").setVisible(false);
				sap.ui.getCore().byId("idButtonSaveStackId").setVisible(true);
				sap.ui.getCore().byId("idVBoxStackIdError").setVisible(false);
			}
		},
			
		_checkStackId: function (layer, pos, stackId) {
			// ---- Check the entered StackId with the selction in the POD Worklist table
			if (layer !== null && layer !== undefined && layer !=="" &&
				pos !== null && pos !== undefined && pos !=="") {
				
				var modData = this.uiTable.getModel().getData();
				var count   = 0;

				for (var i = 0; i < modData.length; i++) {
					var item = modData[i];
					
					if (parseInt(item.Layer, 10) === parseInt(layer, 10) && parseInt(item.Position, 10) === parseInt(pos, 10)  && item.Module.toUpperCase() === stackId) {
						count = count + 1;

						this._StartSFCByProcessLot(this.ProcessLot.toUpperCase(), this.Layer, this.Position, this.RunAction, this.LayerType, "");
					}
				}

				if (count === 0) {
					this.Override    = true;
					this.CommentType = "FurnaceLoadOverride";

					this._checkOverride(stackId);
				} else {
					this._loadJigDialog.close();
				}			
			}
		},
			
		onProcessLotPress: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getParameter("value") !== null && oEvent.getParameter("value") !== undefined) {
					this.ProcessLot = oEvent.getParameter("value").toUpperCase();					
				}
			}
		},
			
		onSaveLoadJigDialog: function (oEvent) {
			var msg = this.getResourceBundle().getText("EnterProcessLot");

			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				if (this.ProcessLot !== null && this.ProcessLot !== undefined && this.ProcessLot !== "") {
					if (this.LayerType === "Bond") {
						this._CheckProcessLotMaterialType(this.ProcessLot.toUpperCase(), this.MaterialType);
					} else {
						this._checkStackId(this.Layer, this.Position, this.ProcessLot.toUpperCase());
					}
				} else {
					sap.ui.getCore().byId("idInputProcessLot").focus();

					tools.showMessageWarning(msg, "");
				}
			}
		},
	
		onOverrideJigDialog: function (oEvent) {
			var comment = sap.ui.getCore().byId("idTextAreaComment").getValue();
			var msg = this.getResourceBundle().getText("CommentMessage");

			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				if (this.ProcessLot !== null && this.ProcessLot !== undefined) {
					if (comment !== null && comment !== undefined && comment !== "") {
						this._StartSFCByProcessLot(this.ProcessLot.toUpperCase(), this.Layer, this.Position, this.RunAction, this.LayerType, comment);

						this._loadJigDialog.close();
					} else {
						tools.showMessageWarning(msg, "");
					}
				}
			}
		},
	
		onCloseLoadJigDialog: function (event) {
			this.Layer        = "";
			this.Position     = "";
			this.RunAction    = "";
			this.ProcessLot   = "";
			this.MaterialType = "";

			this.Override = false;

			this._checkOverride(this.ProcessLot.toUpperCase());
			this._loadJigDialog.close();
		},

		onUnLoadJig: function (event, layer, pos, jigId) {
			this.Layer      = layer;
			this.Position   = "";
			this.RunAction  = "UNLOAD";
			this.JigID      = jigId;

			if (this.FurnaceLoadFlag === 1) {
				this._SignOffSFCByProcessLot(this.JigID, this.Layer, this.Position, this.RunAction, this.LayerType);
			} else {
				this._CompleteSFCByProcessLot(this.JigID, this.Layer, this.Position, this.RunAction, this.LayerType);
			}
		},

		onPressAvatar: function (oEvent) {
			// tools.alertMe("Avatar button clicked!");
		},

		onImageError: function (oEvent) {
			var that = this;

			if (this.MockData) {
				setTimeout(function () {
					that.byId("idImagePod").setSrc(that.ImagePath + "NotFound.jpg");
				}, 800);
			} else {
				// ---- Set the Image by the selected Layer
				var iPath = "http://gb1isapnw01v.meggitt.net:50000/XMII/CM/Meggitt_Carbon_Refresh_UK/furnace_run/images/";

				setTimeout(function () {
					that.byId("idImagePod").setSrc(iPath + "NotFound.jpg");
				}, 800);
			}
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
						// ---- Reset all relevant Components
						this._resetAll(true);
			
						// ---- Start with Resource selection
						this.SelectedResource = sValue;

						var modData = source.getModel().getData().ResourceCollection;

						for (var i = 0; i < modData.length; i++) {
							var item = modData[i];
							
							if (item.RESOURCE === sValue) {
								this._setFurnaceRunIdData(item.HANDLE, sValue, "");
							}
						}
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
					var sValue = source.getSelectedKey();

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						// ---- Reset all relevant Components by changing Furnace Run ID mProperties.value
						this._resetByRunID();
						this.byId("idComboBoxFurnRunId").setSelectedKey(sValue);

						var modData = source.getModel().getData().RunIdCollection;

						for (var i = 0; i < modData.length; i++) {
							var item = modData[i];
							
							if (item.FurnaceRunID === sValue && item.enabled === true) {
								this._setFurnaceRunIdData(this.Handle, this.Resource, sValue);
								this._setLayerByRunIdData(sValue);

								break;
							}
						}
					} else {
						this.byId("idInputStartDateTime").setValue("");

						source.setSelectedKey(undefined);
					}
				}
			}
		},

		onSelectionChangeLayer: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var source = oEvent.getSource();
					// var sValue = parseInt(source.getValue(), 10);
					var sValue = parseInt(source.getSelectedKey(), 10);

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						var modData = source.getModel().getData().LayerCollection;

						for (var i = 0; i < modData.length; i++) {
							var item = modData[i];
							
							if (parseInt(item.Layer, 10) === sValue) {
								this.LayerType = item.LayerType;
							}
						}

						this.SelectedLayer = sValue;						
						this._setLayerDetailsImage(sValue);
						this._setLayerDetailsData(sValue, this.LayerType, true);
					} else {
						source.setSelectedKey(undefined);
					}
				}
			}
		},
		
		onSelectionChangeComments: function (oEvent) {
			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var source = oEvent.getSource();
					var sValue = source.getValue();

					if (sValue !== null && sValue !== undefined && sValue !== "") {
						this.SelectedStackId = sValue;

						this._setCommentDetailsData(this.SelectedStackId);
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
			var inputParam = "Param.1=" + this.Site + "&Param.2=RT_FURNACE";
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
					tools.showMessageError(error.message);
				})
			}
		},

		_loadResourceData: function (oData) {
			var id = this.byId("idComboBoxResource");
			var mData = { results: [] };

			if (oData !== null && oData !== undefined) {
				for (let i = 0; i < oData.length; i++) {
					var item = oData[i];

					var xData = {
						"HANDLE":        item.HANDLE,
						"RESOURCE":      item.RESOURCE,
						"RESOURCE_TYPE": item.RESOURCE_TYPE
					};

					mData.results.push(xData);
				}
			}

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection,     Key,             Name,       Additional Text, Sort Parameter, show Additional Text)
			tools.onSetComboBoxData(this.ResourceModel, id, mData, "ResourceCollection", "RESOURCE_TYPE", "RESOURCE", "RESOURCE_TYPE", "RESOURCE", true);
		},

		_setFurnaceRunIdData: function (handle, resource, runId) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + handle;
			var friModel   = this.getOwnerComponent().getModel("friData");
			var xmlFile1   = _dataPath + "GetFurnaceRunIDByResource.xml";
			var xmlFile2   = _dataPath + "GetFurnaceRunDetailsByResource.xml";
			var that = this;
			var data = {};

			this.Handle   = handle;
			this.Resource = resource;

			// ---- Start the Reload Interval for Status / Time informations
			this._startInterval();

			if (this.MockData) {
				if (this.DummyData) {
					data = friModel.getData().results;

					// ---- Set Data model for the Furnace
					this._loadFurnaceRunIdData(data, resource);

					var mdata = {
						"FurnaceRunID": "",
						"FURNACE_RUN_STATUS": "LOADING",
						"FURNACE_RUN_START_DATE": "NA",
						"FURNACE_RUN_END_DATE": "NA",
						"RunTime": 0,
						"RemainingTime": 0,
						"FurnaceLoadFlag": 0
					}

					that._loadStatusDetailData(mdata);
				} else {
					this._onLoadXmlData(xmlFile2).then((data) => {
						// ---- Set Data model for the Furnace
						if (data !== null && data !== undefined) {
							that._loadStatusDetailData(data);

							var isEmpty = Object.entries(data.FurnaceRunID).length === 0;
							var activeRunId = "";
							var activeRun   = -1;

							if (isEmpty){
								activeRunId = runId;
								activeRun   = 0;
							} else {
								activeRunId = data.FurnaceRunID;
								activeRun   = 1;
							}

							that.FurnaceLoadFlag = parseInt(data.FurnaceLoadFlag, 10);
							that._onLoadXmlData(xmlFile1).then((data) => {
								// ---- Set Data model for the Furnace
								that._loadFurnaceRunIdData(data, resource, activeRun, activeRunId);

								if (activeRun === 1) {
									that._setLayerByRunIdData(activeRunId);
								} else {
									if (runId !== "") {
										that._setLayerByRunIdData(runId);
									}
								}
							}).catch((error) => {
								tools.showMessageError(error);
							})
						}
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Furnace", "SQL_GetFurnaceRunDetailsByResource", inputParam).then((data) => {
					that._loadStatusDetailData(data);

					if (data[0].FurnaceRunID !== null && data[0].FurnaceRunID !== undefined) {
						var isEmpty = Object.entries(data[0].FurnaceRunID).length === 0;
						var activeRunId = "";
						var activeRun   = -1;
	
						if (isEmpty){
							activeRunId = runId;
							activeRun   = 0;
						} else {
							activeRunId = data[0].FurnaceRunID;
							activeRun   = 1;
						}
	
						that.FurnaceLoadFlag = parseInt(data[0].FurnaceLoadFlag, 10);
	
						that.onGetData("Furnace", "SQL_GetFurnaceRunIDByResource", inputParam).then((data) => {
							// ---- Set Data model for the Furnace
							that._loadFurnaceRunIdData(data, resource, activeRun, activeRunId);
	
							if (activeRun === 1) {
								that._setLayerByRunIdData(activeRunId);
							} else {
								if (runId !== "") {
									that._setLayerByRunIdData(runId);
								}
							}
						}).catch((error) => {
							tools.showMessageError(error.message);
						})
					}
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_loadFurnaceRunIdData: function (oData, resource, activeRun, activeRunId) {
			var id = this.byId("idComboBoxFurnRunId");
			var mData = { results: [] };
			var entry = activeRunId;

			if (oData !== null && oData !== undefined) {
				for (let i = 0; i < oData.length; i++) {
					var item = oData[i];
					var res  = item.FurnaceRunID.substring(0, resource.length);

					if (res === resource) {
						var xData = {};

						if (activeRun === 1) {
							xData = {
								"FurnaceRunID":   item.FurnaceRunID,
								"PlannedRunDate": item.PlannedRunDate,
								"enabled":        false
							};

							if (xData.FurnaceRunID === activeRunId) {
								xData.enabled = true;
							}

							this.byId("idButtonStatusChange").setEnabled(true);
						} else {
							xData = {
								"FurnaceRunID":   item.FurnaceRunID,
								"PlannedRunDate": item.PlannedRunDate,
								"enabled":        true
							};

							if (activeRunId !== "") {
								this.byId("idButtonStatusChange").setEnabled(true);
							} else {
								this.byId("idButtonStatusChange").setEnabled(false);
							}
						}

						mData.results.push(xData);
					}
				}
			} else {
				this.byId("idButtonStatusChange").setEnabled(false);
			}

			// ---- Create a ComboBox binding
			// ---- onSetSelectBoxDataWithSelection: (Jason Model, ComboBox ID, mData, Collection,      Key,            Name,           Additional Text,  Sort Parameter, Param,          Entry, show Additional Text)
			tools.onSetSelectBoxDataWithSelection(this.FurnaceRunIdModel, id, mData, "RunIdCollection", "FurnaceRunID", "FurnaceRunID", "PlannedRunDate", "FurnaceRunID", "FurnaceRunID", entry, true);
		},

		_setIntervalStatusData: function (handle) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + handle;
			var friModel   = this.getOwnerComponent().getModel("friData");
			var xmlFile1   = _dataPath + "GetFurnaceRunDetailsByResource.xml";
			var that = this;
			var data = {};

			if (this.MockData) {
				if (this.DummyData) {
					data = friModel.getData().results;

					var mdata = {
						"FurnaceRunID": "",
						"FURNACE_RUN_STATUS": "LOADING",
						"FURNACE_RUN_START_DATE": "NA",
						"FURNACE_RUN_END_DATE": "NA",
						"RunTime": 0,
						"RemainingTime": 0,
						"FurnaceLoadFlag": 0
					}

					that._loadStatusDetailData(mdata);
				} else {
					this._onLoadXmlData(xmlFile1).then((data) => {
						// ---- Set Data model for the Furnace
						if (data !== null && data !== undefined) {
							that._loadStatusDetailData(data);
						}
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Furnace", "SQL_GetFurnaceRunDetailsByResource", inputParam).then((data) => {
					that._loadStatusDetailData(data);
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_loadStatusDetailData: function (oData) {
			var sep = this.getResourceBundle().getText("SeperatorTime");
			var remainingTime = "";
			var runTime = "";

			if (oData !== null && oData !== undefined) {
				if (this.MockData) {
					if (oData.FURNACE_RUN_START_DATE === "NA") { oData.FURNACE_RUN_START_DATE = ""; }
					if (oData.RemainingTime === "NA" || oData.RemainingTime === "0" || oData.RemainingTime === 0) { oData.RemainingTime = 0; }
					if (oData.RunTime === "NA" || oData.RunTime === "0" || oData.RunTime === 0) { oData.RunTime = 0; }

					this.byId("idInputFurnaceStatus").setValue(oData.FURNACE_RUN_STATUS);
					this.byId("idInputStartDateTime").setValue(oData.FURNACE_RUN_START_DATE);

					remainingTime = tools.parseSecoundsToSpecialFormat(oData.RemainingTime, sep);
					runTime       = tools.parseSecoundsToSpecialFormat(oData.RunTime, sep);
		
					this.byId("idInputRemainTime").setValue(remainingTime);
					this.byId("idInputRunTime").setValue(runTime);

					this.SelectedStatus  = oData.FURNACE_RUN_STATUS;
					this.FurnaceLoadFlag = parseInt(oData.FurnaceLoadFlag, 10);
				} else {
					if (oData[0].FURNACE_RUN_START_DATE === "NA") { oData[0].FURNACE_RUN_START_DATE = ""; }
					if (oData[0].RemainingTime === "NA" || oData[0].RemainingTime === "0" || oData[0].RemainingTime === 0) { oData[0].RemainingTime = 0; }
					if (oData[0].RunTime === "NA" || oData[0].RunTime === "0" || oData[0].RunTime === 0) { oData[0].RunTime = 0; }

					this.byId("idInputFurnaceStatus").setValue(oData[0].FURNACE_RUN_STATUS);
					this.byId("idInputStartDateTime").setValue(oData[0].FURNACE_RUN_START_DATE);

					remainingTime = tools.parseSecoundsToSpecialFormat(oData[0].RemainingTime, sep);
					runTime       = tools.parseSecoundsToSpecialFormat(oData[0].RunTime, sep);
		
					this.byId("idInputRemainTime").setValue(remainingTime);
					this.byId("idInputRunTime").setValue(runTime);

					this.SelectedStatus  = oData[0].FURNACE_RUN_STATUS;
					this.FurnaceLoadFlag = parseInt(oData[0].FurnaceLoadFlag, 10);
				}
			}
		},

		_setLayerByRunIdData: function (runId) {
			var layModel = this.getOwnerComponent().getModel("layData");
			var xmlFile  = _dataPath + "GetLayersByFurnaceRunID.xml";
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + runId;
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
					tools.showMessageError(error.message);
				})
			}
		},

		_loadLayerByRunIdData: function (oData, runId) {
			var id = this.byId("idComboBoxLayer");
			var mData = { results: [] };

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
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection, Key,   Name,    Additional Text, Sort Parameter, show Additional Text)
			tools.onSetComboBoxData(this.LayerModel, id, mData, "LayerCollection", "Layer", "Layer", "LayerType", "Layer", true);
		},

		_setLayerDetailsData: function (layer, type, trigger) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + this.RunId + "&Param.3=" + layer;
			var detModel = this.getOwnerComponent().getModel("layDetailsData");
			var xmlFile  = _dataPath + "GetLayerDetailsByFurnaceLayer.xml";
			var that = this;
			var data = {};

			if (this.MockData) {
				if (this.DummyData) {
					data = detModel.getData().results;

					// ---- Set Data model for the Furnace
					this._loadLayerDetailsData(data, layer, type, trigger);
				} else {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the Furnace
						that._loadLayerDetailsData(data, layer, type, trigger);
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Furnace", "SQL_GetLayerDetailsByFurnaceLayer", inputParam).then((data) => {
					// ---- Set Data model for the Furnace
					that._loadLayerDetailsData(data, layer, type, trigger);
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_setLayerDetailsImage: function (layer) {
			var layerNum = parseInt(layer, 10);
			var that = this;

			if (this.MockData) {
				if (this.DummyData) {
					// ---- Set the Image by the selected Layer
					var iSource = this.ImagePath + this.RunId + "_" + layer + ".jpg";

					if (layerNum > 0) {
						setTimeout(function () {
							that.byId("idImagePod").setSrc(iSource);
						}, 800);
					} else {
						setTimeout(function () {
							that.byId("idImagePod").setSrc(this.ImagePath + "NotFound.jpg");
						}, 800);
					}
				} else {
					// ---- Set the Image by the selected Layer
					var iSource = this.ImagePath + this.RunId + "_" + layer + ".jpg";

					if (layerNum > 0) {
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

				if (layerNum > 0) {
					setTimeout(function () {
						that.byId("idImagePod").setSrc(iSource);
					}, 800);
				} else {
					setTimeout(function () {
						that.byId("idImagePod").setSrc(iPath + "NotFound.jpg");
					}, 800);
				}
			}
		},

		_loadLayerDetailsData: function (oData, layer, type, trigger) {
			// var status = this.byId("idInputFurnaceStatus").getValue();
			var mData  = { results: [] };

			if (oData !== null && oData !== undefined) {
				for (let i = 0; i < oData.length; i++) {
					var item = oData[i];

					if (item.LoadedModuleID === "" || item.LoadedModuleID === "NA") {
						oData[i].ProcessLot = "";
						oData[i].LoadedModuleID = "...";
					} else {
						var jigID = tools.splitStringIntoArray(oData[i].LoadedModuleID, ",");
						
						oData[i].ProcessLot = item.LoadedModuleID;

						if (jigID !== null && jigID !== undefined) {
							oData[i].LoadedModuleID = jigID[1];
						}
					}

					// ---- Check for Overriding of a Jig/Stack ID
					var loadCheck = parseInt(oData[i].LoadCheck, 10);

					oData[i].LoadCheck = loadCheck;

					if (loadCheck > 0) {
						oData[i].LoadInverted = true;
						oData[i].LoadState    = "Error";
					} else {
						oData[i].LoadInverted = false;
						oData[i].LoadState    = "None";
					}

					// if (status === "LOADING") {
					if (this.FurnaceLoadFlag === 1) {
						oData[i].LoadShow = true;
						oData[i].LoadEnabled = true;
						oData[i].UnloadShow = true;
						oData[i].UnloadEnabled = false;

						if (oData[i].LoadedModuleID !== "...") {
							oData[i].LoadShow = true;
							oData[i].LoadEnabled = false;
							oData[i].UnloadShow = true;
							oData[i].UnloadEnabled = true;
						}
					// } else if (status === "UNLOAD") {
					} else if (this.FurnaceLoadFlag === 2) {
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
					
					mData.results.push(oData[i]);

					if (oData.length > 0) {
						this.byId("idButtonComment").setEnabled(true);
					} else {
						this.byId("idButtonComment").setEnabled(false);
					}
				}
			} else {
				this.byId("idButtonComment").setEnabled(false);
			}

			// ---- Reset POD Worklist table
			if (this.uiTable.getModel() !== null && this.uiTable.getModel() !== undefined) {
				this.uiTable.getModel().setData([]);
				this.uiTable.bindRows("/");
			}

			// ---- Table binding
			this.LayerDetailsModel.setData(mData.results);
			this.uiTable.setModel(this.LayerDetailsModel);
			this.uiTable.bindRows("/");

			// ---- Reset the table Columns
			this._resetTableColumns(this.uiTable, type);

			// ---- Reset the selected Layer Combo Box
			if (trigger) {
				if (this.SelectedLayer > 0) {
					this.byId("idComboBoxLayer").setSelectedKey(this.SelectedLayer);
				}
			}
		},

		_setStatusData: function (status, sId) {
			var statusModel = this.getOwnerComponent().getModel("statusData");
			var inputParam  = "Param.1=" + this.Site + "&Param.2=" + status;
			var xmlFile     = _dataPath + "GetFurnaceStatusList.xml";
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
					tools.showMessageError(error.message);
				})
			}
		},

		_setCommentDetailsData: function (processlot) {
			var statusModel = this.getOwnerComponent().getModel("statusData");
			var inputParam  = "Param.1=" + this.Site + "&Param.2=" + processlot;
			var xmlFile     = _dataPath + "GetSFCCommentsByProcessLot.xml";
			var that = this;
			var data = {};

			if (this.MockData) {
				if (this.DummyData) {
					data = statusModel.getData().results;

					// ---- Set Data model for the Furnace
					this._loadCommentDetailsData(data);
				} else {
					this._onLoadXmlData(xmlFile).then((data) => {
						// ---- Set Data model for the Furnace
						that._loadCommentDetailsData(data);
					}).catch((error) => {
						tools.showMessageError(error);
					})
				}
			} else {
				this.onGetData("Process_Lots", "SQL_GetSFCCommentsByProcessLot", inputParam).then((data) => {
					// ---- Set Data model for the Furnace
					that._loadCommentDetailsData(data);
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_loadCommentDetailsData: function (oData) {
			var oTable = sap.ui.getCore().byId("idTableCommentList");
			var mData  = { results: [] };

			if (oData !== null && oData !== undefined) {
				for (let i = 0; i < oData.length; i++) {
					var item = oData[i];

					mData.results.push(oData[i]);
				}
			}

			// ---- RReset Table binding
			if (oTable.getModel() !== null && oTable.getModel() !== undefined) {
				oTable.getModel().setData([]);
				oTable.bindRows("/");
			}

			// ---- Table binding
			this.CommentDetailsModel.setData(mData.results);

			oTable.setModel(this.CommentDetailsModel);
			oTable.bindRows("/");
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Special MII Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		_CheckProcessLotMaterialType: function (pocessLot, materialType) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + pocessLot.toUpperCase() + "&Param.3=" + materialType;
			var msg  = this.getResourceBundle().getText("ErrorJigId");
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				// this.Override = true;
				// this._checkOverride();
			} else {
				this.onPostData("Process_Lots", "SQL_CheckProcessLotMaterialType", inputParam).then((data) => {
					that.CommentType = "FurnaceLoadOverride";

					// ---- Check Data for Success
					if (data !== null && data !== undefined) {						
						if (data[0].Checkval === -1) { 			// ---- Invalid Jig: Message: Invalid Jig ID
							that.Override = false;

							that._loadJigDialog.close();

							tools.showMessageWarning(msg, "");
						} else if (data[0].Checkval === 0) { 	// ---- Correct Jig: Save Jig
							that.Override = false;

							that._loadJigDialog.close();
							that._StartSFCByProcessLot(pocessLot.toUpperCase(), that.Layer, that.Position, that.RunAction, that.LayerType, "");
						} else if (data[0].Checkval > 0) { 		// ---- Jig ID does not match material type: Override
							that.Override = true;

							that._checkOverride(pocessLot.toUpperCase());
						} else {
							that.Override = false;

							that._loadJigDialog.close();
						}
					}
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_StartSFCByProcessLot: function (pocessLot, layer, pos, action, layertype, comment) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + this.Resource + "&Param.3=" + pocessLot.toUpperCase();
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				// tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				this.onPostData("Process_Lots", "XAC_StartSFCByProcessLot", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].TransactionStatus === 1) {
							that._AssignFurnaceDataToSFC(pocessLot.toUpperCase(), layer, pos, action, layertype, comment);
						} else {
							tools.showMessageError(data[0].StatusMessage);
						}
					}
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_AssignFurnaceDataToSFC: function (pocessLot, layer, pos, action, layertype, comment) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + pocessLot.toUpperCase() + "&Param.3=" + this.RunId + "&Param.4=" + layer + "&Param.5=" + pos + "&Param.6=" + action;
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				// tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				this.onPostData("Furnace", "XAC_AssignFurnaceDataToSFC", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].OutputStatus === 1) {
							that.Override = false;

							that._setLayerDetailsImage(that.Layer);
							that._setLayerDetailsData(that.Layer, layertype, true);

							if (comment !== null && comment !== undefined && comment !== "") {
								that._SaveSFCCommentsByProcessLot(pocessLot.toUpperCase(), comment, that.CommentType, false);
							}

							if (layer > 0) {
								that.byId("idComboBoxLayer").setSelectedKey(layer);
							}
						} else {
							that.Override = true;

							tools.showMessageError(data[0].OutputMessage);
						}
					}

					if (that.RunAction !== null && that.RunAction !== undefined && that.RunAction === "LOAD") {
						that._checkOverride(pocessLot.toUpperCase());
					}
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_SignOffSFCByProcessLot: function (jigId, layer, pos, action, layertype) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + this.Resource + "&Param.3=" + jigId.toUpperCase();
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				// tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				this.onPostData("Process_Lots", "XAC_SignOffSFCByProcessLot", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].TransactionStatus  === 1) {
							that._AssignFurnaceDataToSFC(jigId.toUpperCase(), "", pos, action, layertype, "");
						} else {
							tools.showMessageError(data[0].StatusMessage);
						}
					}
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_CompleteSFCByProcessLot: function (jigId, layer, pos, action, layertype) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + this.Resource + "&Param.3=" + jigId.toUpperCase();
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				// tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				this.onPostData("Process_Lots", "XAC_CompleteSFCByProcessLot", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].TransactionStatus  === 1) {
							that._AssignFurnaceDataToSFC(jigId.toUpperCase(), "", pos, action, layertype, "");
						} else {
							tools.showMessageError(data[0].StatusMessage);
						}
					}
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_UpdateResourceCustomStatusAndData: function (meStatus) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + this.Resource + "&Param.3=" + this.SelectedStatus + "&Param.4=" + this.RunId;
			var that = this;

			if (this.MockData) {
				// ---- Do nothing
				// tools.alertMe(inputParam + "\n\nLayer: " + layer + "\nPos: " + pos + "\nAction: " + action);
			} else {
				this.onPostData("Resource", "XAC_UpdateResourceCustomStatusAndData", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].Status === 1) {
							if (that.SelectedStatus === "IDLE") {
								that._resetAll(false);
								that.byId("idComboBoxResource").setSelectedKey(that.Resource);
								that._setFurnaceRunIdData(that.Handle, that.Resource, "");
							} else {
								that._setFurnaceRunIdData(that.Handle, that.Resource, that.RunId);
								that._setLayerDetailsImage(that.SelectedLayer);
								that._setLayerDetailsData(that.SelectedLayer, that.LayerType, true);
							}
						} else {
							tools.showMessageError(data[0].StatusMessage);
						}
					}
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},

		_SaveSFCCommentsByProcessLot: function (stackId, comment, commentType, trigger) {
			var inputParam = "Param.1=" + this.Site + "&Param.2=" + stackId.toUpperCase() + "&Param.3=" + comment + "&Param.4=" + commentType;
			var that = this;
			var data = {};

			if (this.MockData) {
				// ---- Do nothing
				// tools.alertMe(inputParam + "\n\nProcessLot: " + pocessLot);
			} else {
				this.onPostData("Process_Lots", "XAC_LogSFCCommentsByProcessLot", inputParam).then((data) => {
					// ---- Check Data for Success
					if (data !== null && data !== undefined) {
						if (data[0].TransactionStatus === 1) {
							if (trigger) {
								that._setCommentDetailsData(stackId.toUpperCase());
							}
						} else {
							tools.showMessageError(data[0].StatusMessage);
						}
					}
				}).catch((error) => {
					tools.showMessageError(error.message);
				})
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Dialog Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		_openStatusChangeDialog: function (data, status, sid) {
			var title   = this.getResourceBundle().getText("FurnaceStatusChange");
			var newData = this._filterStatusData(data);

			this.StatusModel.setData({ "rows": newData} );

			// ---- Create the Status Change dialog
			if (!this._statusChangeDialog) {
				this._statusChangeDialog = sap.ui.xmlfragment(_fragmentPath + "DialogStatus", this);
				this._statusChangeDialog.setTitle(title);

				// ---- Add the external Input field ID to the Value Help component for later use
				this._statusChangeDialog.DialogInputSId = sid;
	
				this._createInput(status);
				this._createTable(newData);

				this.getView().addDependent(this._statusChangeDialog);
			} else {
				var columnData = [{columnName: "Status"}];

				var oTable = sap.ui.getCore().byId("idTableStatusList");
					oTable.getModel().setData({
						rows: newData,
						columns: columnData
					});
	
					oTable.bindRows("/rows");
			}

			// ---- Open the Status Change dialog
			this._statusChangeDialog.open();
		},

		onSaveStatusDialog: function (oEvent) {
			var that = this;

			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				if (this.SelectedStatus !== null && this.SelectedStatus !== undefined) {
					var oInput = this.byId(this._statusChangeDialog.DialogInputSId);
						oInput.setValue(this.SelectedStatus);

					// ---- Reload Status data oModels.undefined.oData.rows[1].MEStatus
					sap.ui.getCore().byId("idInputCurFurnaceStatus").setValue(this.SelectedStatus);

					var oTable  = sap.ui.getCore().byId("idTableStatusList");
					var modData = oTable.getModel().getData().rows;

					for (var i = 0; i < modData.length; i++) {
						var item = modData[i];
						
						if (item.Status === this.SelectedStatus) {
							if (this.MockData) {
								this._setLayerDetailsImage(this.SelectedLayer);
								this._setLayerDetailsData(this.SelectedLayer, this.LayerType, true);
							} else {
								this._UpdateResourceCustomStatusAndData(item.MEStatus);
							}
						}
					}

					// ---- Reset the Table data
					this._resetTableData();
				} else {
					this._resetButtons();
				}
	 
				this._statusChangeDialog.close();
			}
		},
	
		onCloseStatusDialog: function () {
			this._statusChangeDialog.close();
		},

		// --------------------------------------------------------------------------------------------------------------------

		_filterStatusData: function (data) {
			var newData = [];
	
			// ---- Check the input Data for AllowedNextSatus flag
			for (var i = 0; i < data.length; i++) {
				var item = data[i];

				if (parseInt(item.AllowedNextSatus, 10) === 1) {
					newData.push(item);
				}				
			}

			return newData;
		},

		onRowsDataChange: function (oEvent) {
			if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
				var index = oEvent.getParameter("rowIndex"); 
				var source = oEvent.getSource();
				var oModel = source.getModel();
				
				if (index > -1) {
					var data = oModel.getData().rows[index];

					this.SelectedStatus  = data.Status;
					this.FurnaceLoadFlag = parseInt(data.FurnaceLoadFlag, 10);
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

		_resetTableColumns: function (oTable, type) {
			// ---- Reset the Table columns
			var jigId         = this.getResourceBundle().getText("JigType");
			var jigIdLoaded   = this.getResourceBundle().getText("JigLoaded");
			var stackId       = this.getResourceBundle().getText("StackId");
			var stackIdLoaded = this.getResourceBundle().getText("StackLoaded");
			var colLabel1 = "";
			var colLabel2 = "";
			
			if (type === "Bond") {
				colLabel1 = jigId;
				colLabel2 = jigIdLoaded;
			} else {
				colLabel1 = stackId;
				colLabel2 = stackIdLoaded;
			}
					
			var cols = oTable.getColumns();

			for (var i = 0; i < cols.length; i++) {
				var colLabel = cols[i].getAggregation("multiLabels")[0];

				if (i === 2) {
					colLabel.setProperty("text", colLabel1);
				} else if (i === 3) {
					colLabel.setProperty("text", colLabel2);
				}
			}
		},

		_resetTableData: function () {
			// ---- Reset the Table data
			// var layer = this.byId("idComboBoxLayer").getValue();
			var layer = this.byId("idComboBoxLayer").getSelectedKey();
			var data = [];

			if (this.uiTable.getModel() !== null && this.uiTable.getModel() !== undefined) {
				data = this.uiTable.getModel().getData();
			}

			if (layer !== "" && data.length > 0) {
				this._loadLayerDetailsData(data, layer, this.LayerType);
			}
		},

		// --------------------------------------------------------------------------------------------------------------------

		_open_CommentDialog: function (data) {
			var title  = this.getResourceBundle().getText("Comments");

			// ---- Create the Status Change dialog
			if (!this._commentDialog) {
				this._commentDialog = sap.ui.xmlfragment(_fragmentPath + "DialogComment", this);
				this._commentDialog.setTitle(title);

				// ---- Add the Combo Box for the selection of Jig/Stack Id's
				this._createDropDown(data);

				this.getView().addDependent(this._commentDialog);
			} else {
				// ---- Reset Dialog selections
				this._resetCommentSelections(data);
			}

			// ---- Open the Comment dialog
			this._commentDialog.open();
		},

		onAddComment: function (oEvent) {
			var mes   = this.getResourceBundle().getText("CommentMessage");
			var oText = sap.ui.getCore().byId("idTextAreaTextArea");
			var that  = this;

			if (oText !== null && oText !== undefined) {
				var item = oText.getValue();
 
				if (item !== null && item !== undefined && item !== "") {
					if (this.MockData) {
						this._SaveSFCCommentsByProcessLot(this.SelectedStackId, item, this.CommentType, true);
					} else {
						this._SaveSFCCommentsByProcessLot(this.SelectedStackId, item, this.CommentType, true);
					}
	
					oText.setValue("");
				} else {
					tools.showMessageWarning(mes, "");

					oText.focus();
				}
			}
		},
	
		onCloseCommentDialog: function () {
			this._commentDialog.close();
		},

		// --------------------------------------------------------------------------------------------------------------------

		_createDropDown: function (data) {
			var id = sap.ui.getCore().byId("idComboBoxJigStackIds");

			this.CommentModel = new JSONModel();
	
			// ---- Create the Combo Box
			if (data !== null && data !== undefined) {
				var mData  = { results: [] };

				for (var i = 0; i < data.length; i++) {
					var items = data[i];

					// if (items.LoadEnabled === false && items.LoadShow === true && items.LoadedModuleID !== "" && items.LoadedModuleID !== "...") {
					if (items.LoadedModuleID !== "" && items.LoadedModuleID !== "...") {
						var xData = {
							"LoadedModuleID": items.LoadedModuleID
						};
	
						mData.results.push(xData);
					}
				}
			}

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection,   Key,              Name,             Additional Text, Sort Parameter, show Additional Text)
			tools.onSetComboBoxData(this.CommentModel, id, mData, "CommentCollection", "LoadedModuleID", "LoadedModuleID", "", "LoadedModuleID", false);
		},

		_resetCommentSelections: function (data) {
			var oCombo = sap.ui.getCore().byId("idComboBoxJigStackIds");
			var oTable = sap.ui.getCore().byId("idTableCommentList");
			var oText  = sap.ui.getCore().byId("idTextAreaTextArea");

			// ---- Reset Dialog selections
			oCombo.setSelectedKey(undefined);
			oCombo.setValue("");
			oText.setValue("");

			// ---- Reset Table binding
			this.CommentDetailsModel.setData([]);

			oTable.setModel(this.CommentDetailsModel);
			oTable.bindRows("/");

			// ---- Create the Combo Box
			if (data !== null && data !== undefined) {
				var mData  = { results: [] };

				for (var i = 0; i < data.length; i++) {
					var items = data[i];

					// if (items.LoadEnabled === false && items.LoadShow === true && items.LoadedModuleID !== "" && items.LoadedModuleID !== "...") {
					if (items.LoadedModuleID !== "" && items.LoadedModuleID !== "...") {
						var xData = {
							"LoadedModuleID": items.LoadedModuleID
						};
	
						mData.results.push(xData);
					}
				}
			}

			// ---- Reset the ComboBox binding data
			this.CommentModel.setData({
				"CommentCollection" : mData.results
			});
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
								var data = [];

								if (oData.Rowsets.Rowset[0].Row !== null && oData.Rowsets.Rowset[0].Row !== undefined) {
									data = oData.Rowsets.Rowset[0].Row;
								}

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
								var data = [];

								if (oData.Rowsets.Rowset[0].Row !== null && oData.Rowsets.Rowset[0].Row !== undefined) {
									data = oData.Rowsets.Rowset[0].Row;
								}

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
									var data = [];

									if (mData.Rowsets.Rowset.Row !== null && mData.Rowsets.Rowset.Row !== undefined) {
										if (mData.Rowsets.Rowset.Row.length !== undefined && mData.Rowsets.Rowset.Row.length > 0) {
											data = mData.Rowsets.Rowset.Row;
										} else {
											data = mData.Rowsets.Rowset.Row;
										}
									}	

									resolve(data);
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
		
		_startInterval: function () {
			// ---- Start the Reload of the Status data per interval
			var myInterval = parseInt(this.getResourceBundle().getText("FurnaceRunInterval"), 10);

			if (this.IntervalOn) {
				setInterval(this._runInterval, myInterval, this, this.Handle);
			}
		},

		_runInterval: function (that, handle) {
			that._setIntervalStatusData(handle);
		},

		_resetByRunID: function () {
			if (this.MockData) {
				this.byId("idImagePod").setSrc(this.ImagePath + "Default.jpg");
			} else {
				var iPath = "http://gb1isapnw01v.meggitt.net:50000/XMII/CM/Meggitt_Carbon_Refresh_UK/furnace_run/images/";
			
				this.byId("idImagePod").setSrc(iPath + "Default.jpg");
			}

			// ---- Reset the Layer Combobox values
			this.LayerModel.setData({
				"LayerCollection": []
			});

			this.byId("idComboBoxLayer").removeAllItems();
			this.byId("idComboBoxLayer").setModel(this.LayerModel);

			// ---- Reset the Status and Time data
			this._resetTimes();

			// ---- Reset POD Worklist table
			if (this.uiTable.getModel() !== null && this.uiTable.getModel() !== undefined) {
				this.uiTable.getModel().setData([]);
				this.uiTable.bindRows("/");
			}
		},

		_resetTimes: function () {
			// ---- Reset the Input and Comboboxes
			this.byId("idInputStartDateTime").setValue("");
			this.byId("idInputRemainTime").setValue("00:00:00");
			this.byId("idInputRunTime").setValue("00:00:00");
		},

		_resetAll: function (trigger) {
			if (this.MockData) {
				this.byId("idImagePod").setSrc(this.ImagePath + "Default.jpg");
			} else {
				var iPath = "http://gb1isapnw01v.meggitt.net:50000/XMII/CM/Meggitt_Carbon_Refresh_UK/furnace_run/images/";
			
				this.byId("idImagePod").setSrc(iPath + "Default.jpg");
			}

			// ---- Reset the Buttons
			this.byId("idButtonStatusChange").setEnabled(false);

			// ---- Reset the Furnace Combobox
			this.byId("idComboBoxResource").setSelectedKey(undefined);

			// ---- Reset the Furnace Run ID Combobox
			this.FurnaceRunIdModel.setData({
				"RunIdCollection": []
			});

			this.byId("idComboBoxFurnRunId").removeAllItems();
			this.byId("idComboBoxFurnRunId").setModel(this.FurnaceRunIdModel);

			// ---- Reset the Layer Combobox
			if (!trigger) {
				this.byId("idComboBoxLayer").setSelectedKey(undefined);
			} else {
				this.LayerModel.setData({
					"LayerCollection": []
				});

				this.byId("idComboBoxLayer").removeAllItems();
				this.byId("idComboBoxLayer").setModel(this.LayerModel);
			}

			// ---- Reset the Status and Time data
			this.byId("idInputFurnaceStatus").setValue("");
			this.byId("idInputStartDateTime").setValue("");
			this.byId("idInputRemainTime").setValue("00:00:00");
			this.byId("idInputRunTime").setValue("00:00:00");

			// ---- Disable the Comment button
			this.byId("idButtonComment").setEnabled(false);

			// ---- Reset POD Worklist table
			if (this.uiTable.getModel() !== null && this.uiTable.getModel() !== undefined) {
				this.uiTable.getModel().setData([]);
				this.uiTable.bindRows("/");
			}
		}


		// --------------------------------------------------------------------------------------------------------------------
		// END
		// --------------------------------------------------------------------------------------------------------------------

	});
});
