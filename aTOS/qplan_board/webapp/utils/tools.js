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
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {

	"use strict";

	// ---- The app namespace is to be define here!
	var _fragmentPath = "zatos.qplanboard.utils.fragments.";

	return {

		// --------------------------------------------------------------------------------------------------------------------
		// ---- Event driven Functions - Table row selection and Auto Resize of Table columns
		// --------------------------------------------------------------------------------------------------------------------

		onInit: function (ownerComponent) {
			this.OwnerComponent = ownerComponent;
		},

		initRowCount: function (ownerComponent, oTable, oStepInput, oStepInputLable) {
			// ---- Get the Min and Visible Row count from thr ressource file.
			var minRowCount = parseInt(this.getResourceBundle(ownerComponent).getText("MinRowCount"), 10);
			var visRowCount = parseInt(this.getResourceBundle(ownerComponent).getText("VisRowCount"), 10);
			var stepCount = parseInt(this.getResourceBundle(ownerComponent).getText("StepCount"), 10);

			// ---- Set the default Row Count Mode of the Update table
			oTable.setVisibleRowCountMode("Auto");
			oTable.setMinAutoRowCount(minRowCount);

			// ---- Hide the Step Input controle
			this.hideStepControle(oStepInput, oStepInputLable);

			// ---- Set the default parametres for the Step Input controle
			oStepInput.setStep(stepCount);
			oStepInput.setMin(minRowCount);
			oStepInput.setValue(visRowCount);
			oStepInput.setMax(visRowCount + stepCount);
		},

		modeSelectionRowCount: function (oEvent, ownerComponent, oTable, oStepInput, oStepInputLable) {
			var minRowCount = parseInt(this.getResourceBundle(ownerComponent).getText("MinRowCount"), 10);
			var sKey = oEvent ? oEvent.getParameter("item").getProperty("key") : "Auto";
			var actCount = oStepInput.getProperty("value");

			if (sKey === "Fixed") {
				oTable.setVisibleRowCountMode("Fixed");
				oTable.setVisibleRowCount(actCount);

				// ---- Show the Step Input controle
				this.showStepControle(oStepInput, oStepInputLable);
			} else if (sKey === "Interactive") {
				oTable.setVisibleRowCountMode("Interactive");
				oTable.setMinAutoRowCount(minRowCount + 1);

				// ---- Hide the Step Input controle
				this.hideStepControle(oStepInput, oStepInputLable);
			} else {
				oTable.setVisibleRowCountMode("Auto");
				oTable.setMinAutoRowCount(minRowCount);

				// ---- Hide the Step Input controle
				this.hideStepControle(oStepInput, oStepInputLable);
			}
		},

		stepChangeRowCount: function (oEvent, oTable) {
			// ---- Set the new visible Row Count
			var count = oEvent.getParameters().value;

			oTable.setVisibleRowCount(count);
		},

		hideStepControle: function (oStepInput, oStepInputLable) {
			if (oStepInput !== null && oStepInput !== undefined) {
				oStepInputLable.setVisible(false);
				oStepInput.setVisible(false);
			}
		},

		showStepControle: function (oStepInput, oStepInputLable) {
			if (oStepInput !== null && oStepInput !== undefined) {
				oStepInputLable.setVisible(true);
				oStepInput.setVisible(true);
			}
		},

		// --------------------------------------------------------------------------------------------------------------------

		autoResizeColumns: function (oTable) {
			var tcols = oTable.getColumns();

			// ---- Auto resize all automatic rendered columns from a UI Table
			for (var index in tcols) {
				if (tcols.hasOwnProperty(index)) {
					oTable.autoResizeColumn(index);
				}
			}

			// ---- Auto resize the first columns from a UI Table
			oTable.autoResizeColumn(0);
		},

		validateControl: function (oEvt) {
			var item = oEvt.getSource();
			var valid = true;

			if (item instanceof sap.m.Input) {
				if (item.getValue() === "" && item.getRequired()) {
					item.setValueState("Error");
					item.setValueStateText(item.getModel("i18n").getResourceBundle().getText("EmptyRequired"));
					valid = false;
				} else {
					item.setValueState();
					item.setValueStateText("");
				}
			} else if (item instanceof sap.m.Select) {
				if (item.hasStyleClass("_classRequired") && item.getSelectedKey().length === 0) {
					item.setValueState("Error");
					item.setValueStateText(item.getModel("i18n").getResourceBundle().getText("EmptyRequired"));
					valid = false;
				} else {
					item.setValueState();
					item.setValueStateText("");
				}
			} else if (item instanceof sap.m.DatePicker) {
				if (item.hasStyleClass("_classRequired") && item.getValue() === "") {
					item.setValueState("Error");
					item.setValueStateText(item.getModel("i18n").getResourceBundle().getText("EmptyRequired"));
					valid = false;
				} else {
					item.setValueState();
					item.setValueStateText("");
				}
			}

			return valid;
		},

		validatePanel: function (control) {
			var arr = control.getContent();
			var valid = true;

			for (var i in arr) {
				if (arr[i] instanceof sap.m.Input) {
					if (arr[i].getValue() === "" && arr[i].getRequired()) {
						arr[i].setValueState("Error");
						arr[i].setValueStateText(control.getModel("i18n").getResourceBundle().getText("EmptyRequired"));
						valid = false;
					} else {
						arr[i].setValueState();
						arr[i].setValueStateText("");
					}
				} else if (arr[i] instanceof sap.m.Select) {
					if (arr[i].hasStyleClass("_classRequired") && arr[i].getSelectedKey().length === 0) {
						arr[i].setValueState("Error");
						arr[i].setValueStateText(control.getModel("i18n").getResourceBundle().getText("EmptyRequired"));

						valid = false;
					} else {
						arr[i].setValueState();
						arr[i].setValueStateText("");
					}
				} else if (arr[i] instanceof sap.m.DatePicker) {
					if (arr[i].hasStyleClass("_classRequired") && arr[i].getValue() === "") {
						arr[i].setValueState("Error");
						arr[i].setValueStateText(control.getModel("i18n").getResourceBundle().getText("EmptyRequired"));

						valid = false;
					} else {
						arr[i].setValueState();
						arr[i].setValueStateText("");
					}
				}
			}

			return valid;
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Event driven Functions - Generic Button Events
		// --------------------------------------------------------------------------------------------------------------------

		hideButton: function (buttonID) {
			if (buttonID !== null && buttonID !== undefined) {
				buttonID.setVisible(false);
			}
		},

		showButton: function (buttonID) {
			if (buttonID !== null && buttonID !== undefined) {
				buttonID.setVisible(true);
			}
		},

		disableButton: function (buttonID) {
			if (buttonID !== null && buttonID !== undefined) {
				buttonID.setEnabled(false);
			}
		},

		enableButton: function (buttonID) {
			if (buttonID !== null && buttonID !== undefined) {
				buttonID.setEnabled(true);
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Hotkey Function
		// --------------------------------------------------------------------------------------------------------------------

		setKeyboardShortcuts: function (oView, id) {
			_oView = oView;

			$(document).keydown($.proxy(function (evt) {
				switch (evt.keyCode) {
					case 13: // ---- Enter key
						// ---- If enter key is pressed on checkbox control in ui5, default selection occurs, we need to undo this
						var control = sap.ui.getCore().byId(evt.target.getAttribute("id"));

						if (control && control.getMetadata().getName() === "sap.m.CheckBox" && control.getEnabled() && control.getEditable()) {
							// ---- Check if control is checkbox
							//evt.preventDefault();
							evt.stopImmediatePropagation();

							// ---- Checkbox SELECT event
							control.setSelected(!control.getSelected());
							control.fireSelect(new sap.ui.base.Event("customClick", control, {}));
						}

						break;

					case 112: //F1 key
						evt.preventDefault();

						// ---- Now call the actual event/method for the keyboard keypress
						this.onStartF1ValueHelpDialog(oView);

						break;

					case 118: //F7 key
						//   var controlF7 = this.byId(id);

						//      if (controlF7 && controlF7.getEnabled() && controlF7.getEditable()) {
						//      	// ---- Button PRESS event
						// controlF7.firePress();
						//   }

						// ---- Now call the actual event/method for the keyboard keypress
						// this.anyMethodThatShouldbeCalledUponEnterKeyHit();
						// this.alertMe("F7 key pressed!");

						break;

					// ---- For other SHORTCUT cases: refer link - https://css-tricks.com/snippets/javascript/javascript-keycodes/   
					default:
						break;
				}
			}, this));
		},

		onStartF1ValueHelpDialog: function (oView) {
			var that = this;

			// ---- Check for open dialog
			if (!oView._activateDialog) {
				// ---- Open the Dialog Fragment
				sap.ui.core.Fragment.load({
					id: oView.getId(),
					name: _fragmentPath + "ValueHelpDialog",
					controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oView._valueHelpDialog = oDialog;

					oView._valueHelpDialog.addStyleClass(that.getContentDensityClass());
					oView._valueHelpDialog.open();
				});
			} else {
				oView._valueHelpDialog.open();
			}
		},

		onCloseF1ValueHelpDialog: function (oEvent) {
			_oView._valueHelpDialog.close();
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Auth Functions
		// --------------------------------------------------------------------------------------------------------------------

		getAuth: function (oViewModel, authList) {
			var that = this;

			oViewModel.read("/AuthCheckSet", {
				success: function (oData) {
					var counter = 0;
					var obj = {};
					var data;

					// ---- In case of Auth data result all Auth parameters will be checked and set
					if (oData !== null && oData !== undefined) {
						if (oData.results.length > -1) {
							data = oData.results[0];
							counter = 1;
							obj = data;

							// ---- ToDo: Remove Part1, if the app is finallized and reativate Part2 (original coding)!
							// ---- Start: Part1 ----------------------------------------------------------------------
							// for (var prop in obj) {
							// 	if (obj.hasOwnProperty(prop)) {
							// 		if (prop !== "Bname" && prop !== "__metadata") {
							// 			if (jQuery.sap.getUriParameters() !== null && jQuery.sap.getUriParameters() !== undefined && 
							// 				jQuery.sap.getUriParameters().mParams !== null && jQuery.sap.getUriParameters().mParams !== undefined) {

							// 				var param = jQuery.sap.getUriParameters().mParams;

							// 				// ---- Set Auth Flags over Url parameter
							// 				if (param[prop] !== null && param[prop] !== undefined && param[prop].length > 0) {
							// 					if (param[prop][0] === "true") {
							// 						obj[prop] = true;
							// 					} else {
							// 						obj[prop] = false;
							// 					}
							// 				}									
							// 			}
							// 		}
							// 	}
							// }
						}
					}

					// ---- In case of no data result set all Auth parameters to false
					if (counter === 0) {
						obj = data;

						for (var property in obj) {
							if (obj.hasOwnProperty(property)) {
								if (property !== "Bname" && property !== "__metadata") {
									obj[property] = false;
								}
							}
						}
					}

					// ---- Set data to Auth Model
					var oModel = new JSONModel();

					sap.ui.getCore().setModel(oModel, "AuthSet");
					sap.ui.getCore().getModel("AuthSet").setData({
						"AuthCheck": obj
					});

					// ---- Set visibility of all Auth controlled buttons and functions
					that._setAuthParam(obj, authList);
				}
			});
		},

		_setAuthParam: function (obj, authList) {
			// ---- Set visibility of all Auth parameters (buttons / functions)
			if (authList !== null && authList !== undefined) {
				for (var i = 0; i < authList.length; i++) {
					var type = authList[i].type;
					var param = authList[i].param;
					var pKey = authList[i].key;
					var idA = authList[i].idA;
					var idB = authList[i].idB;

					if (type === "button") {
						if (param !== "") {
							if (idA !== null && idA !== undefined) {
								idA.setVisible(obj[param]);
							}

							if (idB !== null && idB !== undefined) {
								idB.setVisible(obj[param]);
							}
						}
					}

					if (type === "filter") {
						if (param !== "") {
							if (idA !== null && idA !== undefined) {
								var smartContConfig = idA.getControlConfiguration();

								for (var j = 0; j < smartContConfig.length; j++) {
									var value = smartContConfig[j];
									var key = value.getKey();

									if (key === pKey) {
										value.setVisible(obj[param]);
									}
								}
							}
						}
					}
				}
			}
		},

		checkAuthParam: function (authParam) {
			let authModel = this.OwnerComponent.getModel("AuthSet");
			let authData = authModel.getObject("/d/results/0");

			// ---- Check Special License flag
			if (authData !== null && authData !== undefined) {
				return authData[authParam];
			} else {
				return false;
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- File Functions
		// --------------------------------------------------------------------------------------------------------------------

		checkFileExistence: function (oModel, urlParameters) {
			return new Promise(function (resolve, reject) {
				oModel.callFunction("/CheckFileExistence", {
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.ResultFlag);
					},
					error: function (oError, resp) {
						reject(oError, resp);
					}
				});
			});
		},

		b64toBlob: function (b64Data, contentType = "", sliceSize = 512) {
			const byteCharacters = atob(b64Data);
			const byteArrays = [];

			for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				const slice = byteCharacters.slice(offset, offset + sliceSize);

				const byteNumbers = new Array(slice.length);
				for (let i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}

				const byteArray = new Uint8Array(byteNumbers);
				byteArrays.push(byteArray);
			}

			const blob = new Blob(byteArrays, { type: contentType });
			return blob;
		},

		saveBlobAs: function (blob, fileName) {
			if (typeof navigator.msSaveBlob === "function") {
				return navigator.msSaveBlob(blob, fileName);
			}

			var saver = document.createElement("a");
			var blobURL = saver.href = URL.createObjectURL(blob),
				body = document.body;

			saver.download = fileName;

			body.appendChild(saver);
			saver.dispatchEvent(new MouseEvent("click"));
			body.removeChild(saver);
			URL.revokeObjectURL(blobURL);

			return true;
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Binding Functions
		// --------------------------------------------------------------------------------------------------------------------

		addBindingListener: function (oBindingInfo, sEventName, fHandler) {
			oBindingInfo.events = oBindingInfo.events || {};

			if (!oBindingInfo.events[sEventName]) {
				oBindingInfo.events[sEventName] = fHandler;
			} else {
				var fOriginalHandler = oBindingInfo.events[sEventName];

				oBindingInfo.events[sEventName] = function () {
					fHandler.apply(this, arguments);
					fOriginalHandler.apply(this, arguments);
				};
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Table Haeder Functions
		// --------------------------------------------------------------------------------------------------------------------

		// ---- Check for MDM Status and handling of the result headline
		setResultHeaderCount: function (title, oEvent, smartFilterbar, smartTable, systemTable) {
			var headerCount = title;

			if (oEvent.getParameters().data !== null && oEvent.getParameters().data !== undefined) {
				var count = oEvent.getParameters().data.__count;
				count = parseInt(count, 10);
				var thresHold = systemTable.getThreshold();

				if (count > 0) {
					var results = oEvent.getParameters().data.results;
					var checkMdmStatus = this.checkFilterData(smartFilterbar);

					if (checkMdmStatus) {
						if (count < thresHold) {
							headerCount = headerCount + " (" + results.length + ")";
						} else {
							headerCount = headerCount + " (-)";
						}
					} else {
						headerCount = headerCount + " (" + count + ")";
					}
				} else {
					headerCount = headerCount + " (0)";
				}
			}

			smartTable.setHeader(headerCount);
		},

		// ---- Handling of the result headline
		setResultHeaderCountOpt: function (title, oData, smartTable) {
			var headerCount = title;

			if (oData !== null && oData !== undefined) {
				var count = oData.__count;
				count = parseInt(count, 10);

				if (count > 0) {
					headerCount = headerCount + " (" + count + ")";
				} else {
					headerCount = headerCount + " (0)";
				}
			}

			smartTable.setHeader(headerCount);
		},

		// ---- Handling of the result headline
		setResultHeaderCountSpec: function (title, oData, smartTable) {
			var headerCount = title;

			if (oData !== null && oData !== undefined) {
				var count = oData.length;

				if (count > 0) {
					headerCount = headerCount + " (" + count + ")";
				} else {
					headerCount = headerCount + " (0)";
				}
			}

			smartTable.setHeader(headerCount);
		},

		checkFilterData: function (smartFilterbar) {
			var filterData = smartFilterbar.getFilterData();
			var checkMDM = false;

			if (filterData !== null && filterData !== undefined) {
				for (var selFilter in filterData) {
					if (filterData.hasOwnProperty(selFilter)) {
						if (selFilter === "MdmStatus") {
							checkMDM = true;
						}
					}
				}
			}

			return checkMDM;
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Filter Functions
		// --------------------------------------------------------------------------------------------------------------------

		_handleFilterData: function (FilterData) {
			for (var filter in FilterData) {
				if (FilterData.hasOwnProperty(filter)) {
					if (FilterData[filter].items.length > 0) {
						for (var i = 0; i < FilterData[filter].items.length; i++) {
							var item = FilterData[filter].items[i];
							item.key = decodeURIComponent(item.key);
							item.key = decodeURIComponent(item.key);
							item.text = decodeURIComponent(item.text);
							item.text = decodeURIComponent(item.text);
						}

						if (FilterData[filter].value !== "null" && FilterData[filter].value !== null &&
							FilterData[filter].value !== "undefined" && FilterData[filter].value !== undefined &&
							FilterData[filter].value !== "") {
							FilterData[filter].value = decodeURIComponent(FilterData[filter].value);
							FilterData[filter].value = decodeURIComponent(FilterData[filter].value);
						} else {
							FilterData[filter].value = "";
						}
					} else if (FilterData[filter].ranges.length > 0) {
						for (var j = 0; j < FilterData[filter].ranges.length; j++) {
							var range = FilterData[filter].ranges[j];
							range.value1 = decodeURIComponent(range.value1);
							range.value1 = decodeURIComponent(range.value1);
							range.tokenText = decodeURIComponent(range.tokenText);
							range.tokenText = decodeURIComponent(range.tokenText);
						}

						if (FilterData[filter].value !== "null" && FilterData[filter].value !== null &&
							FilterData[filter].value !== "undefined" && FilterData[filter].value !== undefined &&
							FilterData[filter].value !== "") {
							FilterData[filter].value = decodeURIComponent(FilterData[filter].value);
							FilterData[filter].value = decodeURIComponent(FilterData[filter].value);
						} else {
							FilterData[filter].value = "";
						}
					} else {
						if (FilterData[filter].value !== "null" && FilterData[filter].value !== null &&
							FilterData[filter].value !== "undefined" && FilterData[filter].value !== undefined &&
							FilterData[filter].value !== "") {
							FilterData[filter].value = decodeURIComponent(FilterData[filter].value);
							FilterData[filter].value = decodeURIComponent(FilterData[filter].value);
						} else {
							FilterData[filter].value = "";
						}
					}
				}
			}

			return FilterData;
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- oData Functions
		// --------------------------------------------------------------------------------------------------------------------

		loadEntitySetData: function (entitySet, entityName, oModel, oView, customModel) {
			if (entitySet !== null && entitySet !== undefined) {
				oModel.setUseBatch(true);
				oModel.read(entitySet, {
					success: function (data, response) { 								// eslint-disable-line
						oModel.setUseBatch(false);
						customModel.setData(data);
						oView.setModel(customModel, entityName);
					},
					error: function (oError) { 								// eslint-disable-line
						/* do something */
						oModel.setUseBatch(false);
					}
				});
			}
		},

		loadDeepEntitySetData: function (entitySet, deepEntity, entityName, oModel, oView, customModel) {
			if (entitySet !== null && entitySet !== undefined) {
				oModel.setUseBatch(true);
				oModel.read(entitySet + "/" + deepEntity, {
					success: function (data, response) { 								// eslint-disable-line
						oModel.setUseBatch(false);
						customModel.setData(data);
						oView.setModel(customModel, entityName);
					},
					error: function (oError) { 								// eslint-disable-line
						/* do something */
						oModel.setUseBatch(false);
					}
				});
			}
		},

		loadDeepEntitySetDataSK: function (entitySet, deepEntity, entityName, oModel, oView) {
			if (entitySet !== null && entitySet !== undefined) {
				oModel.setUseBatch(true);
				oModel.read(entitySet + "/" + deepEntity, {
					success: function (data, response) { 								// eslint-disable-line
						oModel.setUseBatch(false);
						oView.getModel(entityName).setData(data);
					},
					error: function (oError) { 								// eslint-disable-line
						/* do something */
						oModel.setUseBatch(false);
					}
				});
			}
		},

		loadDeepEntitySetDataBusy: function (entitySet, deepEntity, entityName, oModel, oView, customModel, busyIndicator) {
			if (entitySet !== null && entitySet !== undefined) {
				busyIndicator.setBusy(true);

				oModel.setUseBatch(true);
				oModel.read(entitySet + "/" + deepEntity, {
					success: function (data, response) { 								// eslint-disable-line
						oModel.setUseBatch(false);
						customModel.setData(data);
						oView.setModel(customModel, entityName);
						busyIndicator.setBusy(false);
					},
					error: function (oError) { 								// eslint-disable-line
						/* do something */
						oModel.setUseBatch(false);
						busyIndicator.setBusy(false);
					}
				});
			}
		},

		loadDeepEntitySetDataBusySK: function (entitySet, deepEntity, entityName, oModel, oView, busyIndicator) {
			if (entitySet !== null && entitySet !== undefined) {
				busyIndicator.setBusy(true);

				oModel.setUseBatch(true);
				oModel.read(entitySet + "/" + deepEntity, {
					success: function (data, response) { 									// eslint-disable-line
						oModel.setUseBatch(false);
						oView.getModel(entityName).setData(data);
						busyIndicator.setBusy(false);
					},
					error: function (oError) { 								// eslint-disable-line
						/* do something */
						oModel.setUseBatch(false);
						busyIndicator.setBusy(false);
					}
				});
			}
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Error Functions
		// --------------------------------------------------------------------------------------------------------------------

		handleODataRequestFailed: function (oError, resp, showDetails) {								// eslint-disable-line
			var errTitle = this.getI18nBundle().getText("Error");
			var errCheck = false;
			var detailText = "";

			if (!this.OwnerComponent._oErrorHandler._bMessageOpen) {
				return;
			}

			this.OwnerComponent._oErrorHandler._bMessageOpen = true;

			// ---- Check for Error informations  
			if (oError !== null && oError !== undefined) {
				// ---- Try to parse as a JSON response body string
				if (oError.response !== null && oError.response !== undefined) {
					if (oError.response.body !== null && oError.response.body !== undefined) {
						errCheck = this._handleResponseBodyErrors(oError);
					}
				}

				// ---- Try to parse as a JSON response text string  
				if (oError.responseText !== null && oError.responseText !== undefined) {
					errCheck = this._handleResponseTextErrors(oError);
				}
			}

			if (!errCheck) {
				if (showDetails) {
					detailText = oError;
				}

				sap.m.MessageBox.error(
					errTitle, {
					id: "serviceErrorMessageBox",
					details: detailText,
					styleClass: this.OwnerComponent.getContentDensityClass(),
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function () {
						this._bMessageOpen = false;
					}.bind(this)
				}
				);
			}
		},

		// --------------------------------------------------------------------------------------------------------------------

		_handleResponseBodyErrors: function (oError, showDetails) {
			// ---- Handling of the response body errors 
			var errTitle = this.getI18nBundle().getText("Error");
			var htm = this._checkForHtml(oError.response.body);
			var xml = this._checkForXml(oError.response.body);
			var errResponse = "";
			var errDetail = "";														// eslint-disable-line
			var errMsg = "";

			// ---- Check for XML error messages
			if (htm) {
				errResponse = jQuery.parseHTML(oError.response.body);
			} else if (xml) {
				errResponse = jQuery.parseXML(oError.response.body);
			} else {
				errResponse = JSON.parse(oError.response.body);
			}

			if (errResponse !== null && errResponse !== undefined) {
				// ---- Check for XML error messages
				if (htm) {
					errMsg = errResponse[1].textContent;
				} else if (xml) {
					errMsg = errResponse.all[2].textContent;

					if (showDetails) {
						errDetail = this._getXmlErrorDetails(errResponse);
					}
				} else {
					errMsg = errResponse.error.message.value;

					if (showDetails) {
						errDetail = this._getErrorDetails(errResponse.error);
					}
				}

				sap.m.MessageBox.show(
					errMsg, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: errTitle,
					details: errDetail,
					styleClass: this.OwnerComponent.getContentDensityClass(),
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (oAction) {
						this._bMessageOpen = false;
					}.bind(this)
				}
				);

				return true;
			} else {
				return false;
			}
		},

		_handleResponseTextErrors: function (oError, showDetails) {
			// ---- Handling of the response text errors 
			var errTitle = this.getI18nBundle().getText("Error");
			var htm = this._checkForHtml(oError.responseText);
			var xml = this._checkForXml(oError.responseText);
			var errResponse = "";
			var errDetail = "";														// eslint-disable-line
			var errMsg = "";

			// ---- Check for XML error messages
			if (htm) {
				errResponse = jQuery.parseHTML(oError.responseText);
			} else if (xml) {
				errResponse = jQuery.parseXML(oError.responseText);
			} else {
				errResponse = JSON.parse(oError.responseText);
			}

			if (errResponse !== null && errResponse !== undefined) {
				// ---- Check for XML error messages
				if (htm) {
					errMsg = errResponse[1].textContent;
				} else if (xml) {
					errMsg = errResponse.all[2].textContent;

					if (showDetails) {
						errDetail = this._getXmlErrorDetails(errResponse);
					}
				} else {
					errMsg = errResponse.error.message.value;

					if (showDetails) {
						errDetail = this._getErrorDetails(errResponse.error);
					}
				}

				sap.m.MessageBox.show(
					errMsg, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: errTitle,
					details: errDetail,
					styleClass: this.OwnerComponent.getContentDensityClass(),
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (oAction) {
						this._bMessageOpen = false;
					}.bind(this)
				}
				);

				return true;
			} else {
				return false;
			}
		},

		// --------------------------------------------------------------------------------------------------------------------

		_checkForHtml: function (htm) {
			if (htm !== null && htm !== undefined && htm !== "") {
				var htmDoc = htm.startsWith("<html>");

				if (htmDoc) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		_checkForXml: function (xml) {
			if (xml !== null && xml !== undefined && xml !== "") {
				var xmlDoc = xml.startsWith("<?xml");

				if (xmlDoc) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		// --------------------------------------------------------------------------------------------------------------------

		_getErrorDetails: function (errDetail) {
			var application = errDetail.innererror.application;
			var codeError = "Error code: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + errDetail.code;
			var transactionid = "Transaction ID: " + errDetail.innererror.transactionid;
			var stampDate = this._getErrorTimestamp(errDetail.innererror.timestamp);
			var timestamp = "Timestamp: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + stampDate;
			var service = "OData Service: &nbsp;";
			var serviceVersion = "Service Version: ";
			var dummy = "<br>---------------------------------------------------------------------------<br>";

			if (application !== null && application !== undefined) {
				service = service + application.service_namespace + application.service_id;
				serviceVersion = serviceVersion + application.service_version;
			}

			var details = codeError + "<br>" + service + "<br>" + serviceVersion + dummy + transactionid + "<br>" + timestamp;

			return details;
		},

		_getXmlErrorDetails: function (errDetail) {
			var codeError = "Error code: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + errDetail.all[1].textContent;
			var errText = "Error message: " + errDetail.all[2].textContent;
			var timestamp = "Timestamp: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + errDetail.lastModified;
			var dummy = "<br>---------------------------------------------------------------------------<br>";

			var details = timestamp + "<br>" + codeError + dummy + "<br>" + errText;

			return details;
		},

		_getErrorTimestamp: function (timestamp) {
			var stamp = "";

			var year = timestamp.substring(0, 4);
			var mon = timestamp.substring(4, 6);
			var day = timestamp.substring(6, 8);
			var hour = timestamp.substring(8, 10);
			var min = timestamp.substring(10, 12);
			var sec = timestamp.substring(12, 14);

			if (year !== "" && mon !== "" && day !== "") {
				stamp = day + "." + mon + "." + year + " / " + hour + ":" + min + ":" + sec;
			}

			return stamp;
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Helper Functions
		// --------------------------------------------------------------------------------------------------------------------

		toBinary: function (string) {
			const codeUnits = new Uint16Array(string.length);

			for (let i = 0; i < codeUnits.length; i++) {
				codeUnits[i] = string.charCodeAt(i);
			}

			let aFullUnits = [...new Uint8Array(codeUnits.buffer)];
			let sResult = "";

			while (aFullUnits.length) {
				sResult = sResult + String.fromCharCode(...aFullUnits.splice(0, 65535));
			}

			return sResult;
		},

		fromBinary: function (binary) {
			const bytes = new Uint8Array(binary.length);

			for (let i = 0; i < bytes.length; i++) {
				bytes[i] = binary.charCodeAt(i);
			}

			let aFullUnits = [...new Uint16Array(bytes.buffer)];
			let sResult = "";

			while (aFullUnits.length) {
				sResult = sResult + String.fromCharCode(...aFullUnits.splice(0, 65535));
			}

			return sResult;
		},

		addDays: function (n) {
			var today = new Date();
			today.setDate(today.getDate() + n);

			var day = today.getDate();
			var month = today.getMonth() + 1;
			var year = today.getFullYear();

			if (day < 10) { day = "0" + day; }
			if (month < 10) { month = "0" + month; }

			// ---- Set the new Date
			var date = month + "/" + day + "/" + year;

			return new Date(date);
		},

		LastDayOfMonth: function (Year, Month) {
			return new Date((new Date(Year, Month, 1)) - 1);
		},

		handleDates: function (offSetDay, offSetMonth, offSetYear) {
			var today = new Date();
			var day = today.getDate() + offSetDay;
			var month = today.getMonth() + (1 + offSetMonth);
			var year = today.getFullYear() + offSetYear;

			if (day < 10) { day = "0" + day; }
			if (month < 10) { month = "0" + month; }

			// ---- Set the new Date
			today = month + "/" + day + "/" + year;

			return new Date(today);
		},

		parseBool: function (str) {
			if (typeof str === "string" && str.toLowerCase() === "true") {
				return true;
			} else {
				return false;
			}
		},

		splitStringIntoArray: function (seperatorText, seperator) {
			var ResultArray = null;

			if (seperatorText !== null) {
				var SplitChars = seperator;

				if (seperatorText.indexOf(SplitChars) >= 0) {
					ResultArray = seperatorText.split(SplitChars);
				}
			}

			return ResultArray;
		},

		objectEquals: function (v1, v2) {
			if (typeof (v1) !== typeof (v2)) {
				return false;
			}

			if (typeof (v1) === "function") {
				return v1.toString() === v2.toString();
			}

			if (v1 instanceof Object && v2 instanceof Object) {
				if (this.countProps(v1) !== this.countProps(v2)) {
					return false;
				}

				var r = true;

				for (var k in v1) {
					r = this.objectEquals(v1[k], v2[k]);

					if (!r) {
						return false;
					}
				}

				return true;
			} else {
				return v1 === v2;
			}
		},

		countProperties: function (obj) {
			var count = 0;

			for (var k in obj) {
				if (obj.hasOwnProperty(k)) {
					count++;
				}
			}

			return count;
		},

		deCodeValue: function (value) {
			return decodeURIComponent(value);
		},

		enCodeValue: function (value) {
			return encodeURIComponent(value);
		},

		replaceSlashes: function (value) {
			var text = value;

			if (typeof value === "string") {
				text = encodeURIComponent(value);
			}

			return text;
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Basic Functions
		// --------------------------------------------------------------------------------------------------------------------

		getI18nBundle: function () {
			return this.OwnerComponent.getModel("i18n").getResourceBundle();
		},

		getResourceBundle: function (ownerComponent) {
			return ownerComponent.getModel("i18n").getResourceBundle();
		},

		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// ---- Check whether FLP has already set the content density class; do nothing in this case
				// ---- Eslint-disable-next-line sap-no-proprietary-browser-api
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) {
					// ---- Apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// ---- "Cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}

			return this._sContentDensityClass;
		},

		showMessageInfo: function (oInfo, oDetails) {
			sap.m.MessageBox.information(oInfo, {
				details: oDetails,
				actions: [sap.m.MessageBox.Action.OK],
				onClose: function () {
					this._bMessageOpen = false;
				}.bind(this)
			}
			);
		},

		showMessageWarning: function (oWarning, oDetails) {
			sap.m.MessageBox.warning(oWarning, {
				details: oDetails,
				actions: [sap.m.MessageBox.Action.OK],
				onClose: function () {
					this._bMessageOpen = false;
				}.bind(this)
			}
			);
		},

		showMessageSuccess: function (oSuccess, oDetails) {
			sap.m.MessageBox.success(oSuccess, {
				details: oDetails,
				actions: [sap.m.MessageBox.Action.OK],
				onClose: function () {
					this._bMessageOpen = false;
				}.bind(this)
			}
			);
		},

		showMessageError: function (oError, oDetails) {
			sap.m.MessageBox.error(oError, {
				details: oDetails,
				actions: [sap.m.MessageBox.Action.CLOSE],
				onClose: function () {
					this._bMessageOpen = false;
				}.bind(this)
			}
			);
		},

		alertMe: function (msg) {
			sap.m.MessageToast.show(msg, {
				duration: 3000,
				my: sap.ui.core.Popup.Dock.CenterCenter,
				at: sap.ui.core.Popup.Dock.CenterCenter,
				width: "20em",
				autoClose: true
			});
		},

		alertMeWidth: function (msg, boxw) {
			sap.m.MessageToast.show(msg, {
				duration: 3000,
				my: sap.ui.core.Popup.Dock.CenterCenter,
				at: sap.ui.core.Popup.Dock.CenterCenter,
				width: boxw,
				autoClose: true
			});
		},


		// --------------------------------------------------------------------------------------------------------------------
		// ---- Value help Functions
		// --------------------------------------------------------------------------------------------------------------------

		handleLanguageValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var fragment = _fragmentPath + "LanguageHelper";

			this.inputId = oEvent.getSource().getId();
			this.keyField = oEvent.getSource().getBinding("selectedKey").getPath();
			this.valueField = oEvent.getSource().getBinding("value").getPath();

			if (!this._valueLanguageHelpDialog) {
				this._valueLanguageHelpDialog = sap.ui.xmlfragment(fragment, this);

				this.getView().addDependent(this._valueLanguageHelpDialog);
			}

			this._valueLanguageHelpDialog.open(sInputValue);
		},

		handleLanguageValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Sptxt", sap.ui.model.FilterOperator.Contains, sValue);

			if (sValue) {
				evt.getSource().getBinding("items").filter(oFilter);
			} else {
				evt.getSource().getBinding("items").filter();
			}
		},

		handleLanguageValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");

			if (oSelectedItem) {
				var oInput = sap.ui.getCore().byId(this.inputId);

				this.getModel().setProperty(oInput.getBindingContext().getPath() + "/" + this.keyField, oSelectedItem.getInfo());
				this.getModel().setProperty(oInput.getBindingContext().getPath() + "/" + this.valueField, oSelectedItem.getTitle());
			}

			evt.getSource().getBinding("items").filter();
		},

		// --------------------------------------------------------------------------------------------------------------------

		handleCountryValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var fragment = _fragmentPath + "CountryHelper";

			this.inputId = oEvent.getSource().getId();
			this.keyField = oEvent.getSource().getBinding("selectedKey").getPath();
			this.valueField = oEvent.getSource().getBinding("value").getPath();

			if (!this._valueCountryHelpDialog) {
				this._valueCountryHelpDialog = sap.ui.xmlfragment(fragment, this);

				this.getView().addDependent(this._valueCountryHelpDialog);
			}

			this._valueCountryHelpDialog.open(sInputValue);
		},

		handleCountryValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = [];

			if (sValue !== null && sValue !== "undefined") {
				if (sValue !== "") {
					var check = sValue.indexOf(sValue.toUpperCase()) !== -1;

					if (check) {
						oFilter = new sap.ui.model.Filter("Land1", sap.ui.model.FilterOperator.StartsWith, sValue.toUpperCase());
					} else {
						oFilter = new sap.ui.model.Filter("Landx", sap.ui.model.FilterOperator.Contains, sValue);
					}

					evt.getSource().getBinding("items").filter(oFilter);
				}
			} else {
				evt.getSource().getBinding("items").filter();
			}
		},

		handleCountryValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");

			if (oSelectedItem) {
				var oInput = sap.ui.getCore().byId(this.inputId);

				this.getModel().setProperty(oInput.getBindingContext().getPath() + "/" + this.keyField, oSelectedItem.getInfo());
				this.getModel().setProperty(oInput.getBindingContext().getPath() + "/" + this.valueField, oSelectedItem.getTitle());
			}

			evt.getSource().getBinding("items").filter();
		},

		// --------------------------------------------------------------------------------------------------------------------

		handleServicePartnerValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var fragment = _fragmentPath + "ServicePartnerHelper";

			this.inputId = oEvent.getSource().getId();
			this.keyField = oEvent.getSource().getBinding("selectedKey").getPath();
			this.valueField = oEvent.getSource().getBinding("value").getPath();

			if (!this._valueCountryHelpDialog) {
				this._valueCountryHelpDialog = sap.ui.xmlfragment(fragment, this);

				this.getView().addDependent(this._valueCountryHelpDialog);
			}

			this._valueCountryHelpDialog.open(sInputValue);
		},

		handleServicePartnerValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue);

			if (sValue) {
				evt.getSource().getBinding("items").filter(oFilter);
			} else {
				evt.getSource().getBinding("items").filter();
			}
		},

		handleServicePartnerValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");

			if (oSelectedItem) {
				var oInput = sap.ui.getCore().byId(this.inputId);
				var oValueModel = oInput.getBinding("value").getModel();
				var oKeyModel = oInput.getBinding("selectedKey").getModel();

				oKeyModel.setProperty("/" + oInput.getBinding("selectedKey").getPath(), oSelectedItem.getInfo());
				oValueModel.setProperty("/" + oInput.getBinding("value").getPath(), oSelectedItem.getTitle());
			}

			evt.getSource().getBinding("items").filter();
		}

	};
});