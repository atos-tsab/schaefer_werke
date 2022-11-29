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
    "processlot/utils/eams",
    "processlot/utils/qhelp",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (BaseController, formatter, eams, qhelp, JSONModel, Filter) {
 
    "use strict";

	// ---- The app namespace is to be define here!
	var _fragmentPath = "processlot.view.fragments.";
	var APP = "processlot";


    return BaseController.extend("processlot.controller.Main", {
		// ---- Implementation of formatter functions
		formatter: formatter,

		// ---- Implementation of an utility toolset for generic use
        eams : eams,
        qhelp: qhelp,


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

			this.CarrierType  = "";
			this.SelectedSFC  = "";
			this.NewCarrierId = "";

			// ---- Define the Owner Component for the Tools Util
			eams.onInit(this.getOwnerComponent());
			qhelp.onInit(this.getOwnerComponent());

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
			this.CarrierIdModel   = new JSONModel();
			this.SFCTableModel    = new JSONModel();
			this.SFCModel         = new JSONModel();
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

			if (ctype) {
				this._setCarrierTypeData(ctype);
			} else {
				this._setCarrierTypeData("");
			}
			
			this._resetAll();			
			this._setSFCNumberData();
			this._createTableData();

			// qhelp.onGetIntervalData("", APP, "XAC_GetRoboOrdrStatus", {}, 50000);
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Button Event Handlers
		// --------------------------------------------------------------------------------------------------------------------

		onCompleteAll: function (oEvent) {
			qhelp.alertMe("Complete All button clicked!");
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
								item.SFCNumber  = sValue;
								item.Selection  = true;
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
			// qhelp.alertMe("Removed selected entry [" + pos + "] = [" + sfcNumber + "]!");

			if (oEvent !== null && oEvent !== undefined) {
				if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
					var sValue = sfcNumber;
			
					if (sValue !== null && sValue !== undefined && sValue !== "") {
						var data = this.SFCTableModel.getData().SFCCollection;

						// ---- Remove the selected Position from top to down
						for (let j = 0; j < data.length; j++) {
							let item = data[j];

							if (item.Position === pos) {
								item.SFCNumber  = "";
								item.Selection  = false;
								item.VisibleSel = false;
							} else if (item.Position === (pos - 1)) {
								item.Selection  = true;
							}
						}

						this.SFCTableModel.setData({ SFCCollection: data });
						this.mTable.setModel(this.SFCTableModel);
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
						this._setCarrierIdDataJig();
						this._resetByCarrierType();
						this.CarrierType = sValue;
					} else if (sValue === "Stack") {
						this._setCarrierIdDataStack();
						this._resetByCarrierType();
						this.CarrierType = sValue;
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
				this.byId("idButtonCreateTable").setEnabled(true);

				qhelp.alertMe("New Carrier ID created!");

				// ---- Disable the Create button after creation process
				setTimeout(function () {
					that.byId("idButtonCreateTable").setEnabled(false);
					that.byId("idInputCarrierId").setValue("");
					that._createTableData();
				}.bind(this), 4000);
			} else {
				qhelp.alertMe("Add one or more SFC numbers!");
			}
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
							var data = { CarrierId: sValue };

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
			var id = this.byId("idComboBoxCarrierType");
			var that = this;
			var entry = "";

			if (ctype === "JIG") { 
				entry = "Jig";
			} else if (ctype === "STACK") {
				entry = "Stack";
			}

			this.CarrierType = entry;
			this._setCarrierIdData();

			// ---- Set Data model for the Carrier Type
			var mData = {
				results:[
					{ "CarrierTypeKey": "CTK001", "CarrierTypeTxt": "Jig"   },
					{ "CarrierTypeKey": "CTK002", "CarrierTypeTxt": "Stack" }
				]
			};

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxDataWithSelection: (Jason Model, ComboBox ID, mData, Collection,          Key,              Name,             Additional Text,  Sort Parameter,   Param,            Entry, show Additional Text)
			eams.onSetComboBoxDataWithSelection(this.CarrierTypeModel, id, mData, "CarrierTypeCollection", "CarrierTypeKey", "CarrierTypeTxt", "CarrierTypeKey", "CarrierTypeTxt", "CarrierTypeTxt", entry, true);
		},

		_setCarrierIdDataJig: function () {
			var id = this.byId("idComboBoxCarrierId");

			// ---- Set Data model for the Carrier Type Jig
			var mData = {
				results:[
					{CarrierId:"J000123466"},
					{CarrierId:"J000123468"},
					{CarrierId:"J000123469"},
					{CarrierId:"J000123470"},
					{CarrierId:"J000123471"},
					{CarrierId:"J000123474"},
					{CarrierId:"J000123475"}
				]
			};

			this.mData = mData;

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection, Key, Name, Additional Text, Sort Parameter, show Additional Text)
			eams.onSetComboBoxData(this.CarrierIdModel, id, mData, "Collection", "", "CarrierId", "", "CarrierId",false);
		},

		_setCarrierIdDataStack: function () {
			var id = this.byId("idComboBoxCarrierId");

			// ---- Set Data model for the Carrier Type Stack
			var mData = {
				results:[
					{CarrierId:"S000513488"},
					{CarrierId:"S000513489"},
					{CarrierId:"S000513491"},
					{CarrierId:"S000513492"},
					{CarrierId:"S000513494"}
				]
			};

			this.mData = mData;

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection, Key, Name, Additional Text, Sort Parameter, show Additional Text)
			eams.onSetComboBoxData(this.CarrierIdModel, id, mData, "Collection", "", "CarrierId", "", "CarrierId",false);
		},

		_setCarrierIdData: function () {
			var cidModel = this.getOwnerComponent().getModel("cidData");
			var id = this.byId("idComboBoxCarrierId");
			var that = this;

			// ---- Set Data model for the selected Carrier Type
			if (cidModel !== null && cidModel !== undefined) {
				var cData = cidModel.getData().results;
				var mData = { results:[] };

				for (let i = 0; i < cData.length; i++) {
					var item = cData[i];
					
					if (item.CarrierType === that.CarrierType) {
						var xData = {CarrierId: item.CarrierId};

						mData.results.push(xData);
					}
				}
			}
			
			this.mData = mData;

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection, Key, Name, Additional Text, Sort Parameter, show Additional Text)
			eams.onSetComboBoxData(this.CarrierIdModel, id, mData, "Collection", "", "CarrierId", "", "CarrierId",false);
		},

		_setSFCNumberData: function () {
			var sfcModel = this.getOwnerComponent().getModel("sfcData");
			var id = this.byId("idComboBoxSFC");
			var mData = sfcModel.getData();

			// ---- Create a ComboBox binding
			// ---- onSetComboBoxData: (Jason Model, ComboBox ID, mData, Collection, Key, Name, Additional Text, Sort Parameter, show Additional Text)
			eams.onSetComboBoxData(this.SFCModel, id, mData, "SFCCollection", "SFCNumber", "SFCNumber", "SFCNumber", "SFCNumber", false);
		},

		_fillCarrierIdList: function (carrierId) {
			var cidModel = this.getOwnerComponent().getModel("cidData");
			var that = this;

			// ---- Set Data model for the selected Carrier Type
			if (cidModel !== null && cidModel !== undefined) {
				var cData = cidModel.getData().results;
				var mData = { results:[] };

				for (let i = 0; i < cData.length; i++) {
					var item = cData[i];
					
					if (item.CarrierType === that.CarrierType) {
						if (item.CarrierId === carrierId) {
							if (item.CarrierType === "Jig") {
								mData.results = item.toJigSFC;
							} else if (item.CarrierType === "Stack") {
								mData.results = item.toStackSFC;
							}						
						}
					}
				}

				// ---- Add data to SFC Table
				this._autoFillSFCList(mData.results);
			}			
		},

		_autoFillSFCList: function (mData) {
			var that = this;

			// ---- Reset Table
			this._removeTableData();

			// ---- Add data to SFC Table
			for (let i = 0; i < mData.length; i++) {
				var sValue = mData[i].SFCNumber;
				
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
							item.SFCNumber  = sValue;
							item.Selection  = true;
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
					this._valueHelpDialog = sap.ui.xmlfragment( _fragmentPath + "DialogCarrierId", this );
	
					this._valueHelpDialog.setModel(this.CarrierIdModel);
					this._valueHelpDialog.setTitle(title);
	
					this.getView().addDependent(this._valueHelpDialog);
				}
	
				// ---- Open Value help dialog
				this._valueHelpDialog.open();
			}
		},

		_handleValueHelpSearch : function (oEvent, param) {
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

		_handleValueHelpClose : function (oEvent) {
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
			var that= this;
			var data = [];
			
			for (let index = maxPositions; index > 0; index--) {
				var item = {
					Position:   index,
					SFCNumber:  "",
					Selection:  false,
					VisibleSel: false
				};
				
				data.push(item);
			}

			this.SFCTableModel.setData({
				"SFCCollection": data
			});

			this.mTable.setModel(this.SFCTableModel);

			setTimeout(function() {
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
			if (sap.ushell !== null && sap.ushell !== undefined) {
				if (sap.ushell.Container !== null && sap.ushell.Container !== undefined) {
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

					oCrossAppNavigator.toExternal({
						target: {
							shellHash: "#Shell-home"
						}
					});
				}
			} else {
                eams.alertMe("Navigate back or close the browser window!");

				setTimeout(function() {
					window.close()
				}, 3000);				
            }
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Helper Functions
		// --------------------------------------------------------------------------------------------------------------------

		_checkCarrierId: function (oData, sValue) {
			var check = false;

			// ---- Check the new Carrier ID against the model
			if (oData !== null && oData !== undefined) {
				for (var i = 0; i < oData.length; i++) {
					var id = oData[i].CarrierId;
					
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

				if (item.SFCNumber !== "") {
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
			this.CarrierTypeModel.setData([]);
			this.CarrierIdModel.setData([]);
			this.SFCTableModel.setData([]);
			this.SFCModel.setData([]);

			// ---- Reset the Buttons
			this._resetButtons();
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
