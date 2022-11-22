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
	"sap/ui/core/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/type/String",
	"sap/m/SearchField",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (CoreLibrary, Controller, JSONModel, typeString, SearchField, Filter, FilterOperator) {

 "use strict";

 var ValueState = CoreLibrary.ValueState;

 return {

    // --------------------------------------------------------------------------------------------------------------------
    // ---- Init
    // --------------------------------------------------------------------------------------------------------------------

    onInit: function (ownerComponent) {
        this.OwnerComponent = ownerComponent;
    },


    // --------------------------------------------------------------------------------------------------------------------
    // ---- Generic Functions
    // --------------------------------------------------------------------------------------------------------------------

    onSetInputBoxData: function (oModel, component, mData, collection, key, txt, atxt, asorter, showAddText) {
        // ---- Set data to the Models
        // oModel.setData({
        //     [collection]: mData.results
        // });

        // ---- Create a Input Box binding
        var oItemTemplate = new sap.ui.core.ListItem();
            oItemTemplate.bindProperty("key", key);
            oItemTemplate.bindProperty("text", txt);

        if (showAddText) {
            oItemTemplate.bindProperty("additionalText", atxt);
        }
 
        var oInputBox = component;

        if (oInputBox !== null && oInputBox !== undefined) {
            oInputBox.setModel(oModel);

            oInputBox.bindObject({ 
                path: "/" + collection, 
                template: oItemTemplate, 
                sorter: { path: asorter },
                descending: false
            });
            
            // oInputBox.setSelectedKey(undefined); 		<StandardListItem title="{Kunnr}" info="{Name1}" />

        }
    },


    // --------------------------------------------------------------------------------------------------------------------
    // ---- Value Help Functions
    // --------------------------------------------------------------------------------------------------------------------

    _onValueHelpOpenSingle: function(thisIn, oModel, cModel, fragFile, sid, collection, title, key, txt, msel) {
        var aCols  = cModel.getData().cols;
        var oView  = thisIn.getView();
        var that = this;

        sap.ui.core.Fragment.load({
            id: oView.getId(),
            name: fragFile,
            controller: thisIn
        }).then(function name(oFragment) {
            that._oValueHelpDialog = oFragment;
            oView.addDependent(that._oValueHelpDialog);

            that._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(oModel);
                oTable.setModel(cModel, "columns");

                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/" + collection);
                }

                if (oTable.bindItems) {
                    oTable.bindAggregation("items", "/" + collection, function () {
                        return new ColumnListItem({
                            cells: aCols.map(function (column) {
                                return new Label({ text: "{" + column.template + "}" });
                            })
                        });
                    });
                }

                that._oValueHelpDialog.update();
            }.bind(that));

            // ---- Add the external Input field ID to the Value Help component for later use
            that._oValueHelpDialog.DialogInputSId = sid;

            // ---- Set the key and descriptionKey for the Value Help Dialog
            that._oValueHelpDialog.setSupportMultiselect(msel);
            that._oValueHelpDialog.setDescriptionKey(txt);
            that._oValueHelpDialog.setKey(key);
    
            // ---- Set the Property Model to the Value Help Dialog
            that._oValueHelpDialog.setModel(oView.getModel());
            
            // ---- Open the Value help Dialog
            that._oValueHelpDialog.setTitle(title);
            that._oValueHelpDialog.open();
        }.bind(that));
    },

    _onValueHelpOpenSingleWithSelection: function(thisIn, oModel, cModel, fragFile, sid, collection, title, key, txt, msel, entry) {
        var aCols  = cModel.getData().cols;
        var oView  = thisIn.getView();
        var that = this;

        sap.ui.core.Fragment.load({
            id: oView.getId(),
            name: fragFile,
            controller: thisIn
        }).then(function name(oFragment) {
            that._oValueHelpDialog = oFragment;
            oView.addDependent(that._oValueHelpDialog);

            that._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(oModel);
                oTable.setModel(cModel, "columns");

                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/" + collection);
                }

                if (oTable.bindItems) {
                    oTable.bindAggregation("items", "/" + collection, function () {
                        return new ColumnListItem({
                            cells: aCols.map(function (column) {
                                return new Label({ text: "{" + column.template + "}" });
                            })
                        });
                    });
                }

                if (entry !== null && entry !== undefined && entry !== "") {
                    var binding = oTable.getBinding("rows");

                    if (binding.oList !== null && binding.oList !== undefined) {
                        var list = binding.oList;

                        for (var i = 0; i < list.length; i++) {
                            var lEntry = list[i];
                            
                            if (lEntry.CodeDescription === entry) {
                                oTable.setSelectedIndex(i);
                            }
                        }
                    }
                }

                that._oValueHelpDialog.update();
            }.bind(that));

            // ---- Add the external Input field ID to the Value Help component for later use
            that._oValueHelpDialog.DialogInputSId = sid;

            // ---- Set the key and descriptionKey for the Value Help Dialog
            that._oValueHelpDialog.setSupportMultiselect(msel);
            that._oValueHelpDialog.setDescriptionKey(txt);
            that._oValueHelpDialog.setKey(key);
    
            // ---- Set the Property Model to the Value Help Dialog
            that._oValueHelpDialog.setModel(oView.getModel());
            
            // ---- Open the Value help Dialog
            that._oValueHelpDialog.setTitle(title);
            that._oValueHelpDialog.open();
        }.bind(that));
    },

    _onValueHelpOpenComplex: function(thisIn, oModel, cModel, fragFile, sid, collection, title, key, txt, msel) {
        var aCols = cModel.getData().cols;
        var oView = thisIn.getView();
        this.In = thisIn;
 
        this._oBasicSearchFieldWithSuggestions = new SearchField();

        sap.ui.core.Fragment.load({
            id: oView.getId(),
            name: fragFile,
            controller: thisIn
        }).then(function name(oFragment) {
            this._oValueHelpDialogWithSuggestions = oFragment;
            oView.addDependent(this._oValueHelpDialogWithSuggestions);

            // ---- Setup of the Range Key Fields in the complpex Value Help scenario
            this._setupRangeKeyFields(this._oValueHelpDialogWithSuggestions, key, aCols);

            // ---- Setup of the Filterbar in the complpex Value Help scenario
            this._setupNewComplexFilterbar(this._oValueHelpDialogWithSuggestions, collection, aCols, key, txt);

            // ---- Setup of the Result Table in the complpex Value Help scenario
            this._setupDialogTable(this._oValueHelpDialogWithSuggestions, oModel, cModel, collection, aCols);

            // ---- Add the external Input field ID to the Value Help component for later use
            this._oValueHelpDialogWithSuggestions.DialogInputSId = sid;

            // ---- Set the key and descriptionKey for the Value Help Dialog
            this._oValueHelpDialogWithSuggestions.setSupportMultiselect(msel);
            this._oValueHelpDialogWithSuggestions.setSupportRanges(true);
            this._oValueHelpDialogWithSuggestions.setDescriptionKey(txt);
            this._oValueHelpDialogWithSuggestions.setKey(key);
    
            // ---- Set the Property Model to the Value Help Dialog
            this._oValueHelpDialogWithSuggestions.setModel(oView.getModel());
            
            // ---- Open the Value help Dialog
            this._oValueHelpDialogWithSuggestions.setTitle(title);
            this._oValueHelpDialogWithSuggestions.open();
        }.bind(this));
    },

    _onValueHelpOpenComplexWithSelection: function(thisIn, oModel, cModel, fragFile, sid, collection, title, key, txt, msel, entry) {
        var aCols = cModel.getData().cols;
        var oView = thisIn.getView();
        this.In = thisIn;
 
        this._oBasicSearchFieldWithSuggestions = new SearchField();

        sap.ui.core.Fragment.load({
            id: oView.getId(),
            name: fragFile,
            controller: thisIn
        }).then(function name(oFragment) {
            this._oValueHelpDialogWithSuggestions = oFragment;
            oView.addDependent(this._oValueHelpDialogWithSuggestions);

            // ---- Setup of the Range Key Fields in the complpex Value Help scenario
            this._setupRangeKeyFields(this._oValueHelpDialogWithSuggestions, key, aCols);

            // ---- Setup of the Filterbar in the complpex Value Help scenario
            this._setupNewComplexFilterbar(this._oValueHelpDialogWithSuggestions, collection, aCols, key, txt);

            // ---- Setup of the Result Table in the complpex Value Help scenario
            this._setupDialogTable(this._oValueHelpDialogWithSuggestions, oModel, cModel, collection, aCols);

            // ---- Add the external Input field ID to the Value Help component for later use
            this._oValueHelpDialogWithSuggestions.DialogInputSId = sid;

            // ---- Set the key and descriptionKey for the Value Help Dialog
            this._oValueHelpDialogWithSuggestions.setSupportMultiselect(msel);
            this._oValueHelpDialogWithSuggestions.setSupportRanges(true);
            this._oValueHelpDialogWithSuggestions.setDescriptionKey(txt);
            this._oValueHelpDialogWithSuggestions.setKey(key);

            // ---- Set the Property Model to the Value Help Dialog
            this._oValueHelpDialogWithSuggestions.setModel(oView.getModel());
            
            // ---- Open the Value help Dialog
            this._oValueHelpDialogWithSuggestions.setTitle(title);
            this._oValueHelpDialogWithSuggestions.open();
        }.bind(this));
    },

    _onValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");

        if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
            var source = oEvent.getSource();

            if (aTokens !== null && aTokens !== undefined) {
                source.getModel("ParameterList").setProperty("/keyValue", aTokens[0].getKey());
                source.getModel("ParameterList").setProperty("/txtValue", aTokens[0].getText());

                var oInput = this.byId(source.DialogInputSId); // mProperties.value
                    oInput.setSelectedKey(aTokens[0].getKey());
                    oInput.setValue(aTokens[0].getText());

                    oInput.fireChange({
                        "key":  aTokens[0].getKey(),
                        "text": aTokens[0].getText()
                    });
            }
 
            source.close();
        }
    },

    _onValueHelpCancelPress: function (oEvent) {
        if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
            var source = oEvent.getSource();
                source.close();
        }
    },

    _onValueHelpAfterClose: function (oEvent) {
        if (oEvent.getSource() !== null && oEvent.getSource() !== undefined) {
            var source = oEvent.getSource();
                source.destroy();
        }
    },

    onFilterBarWithSuggestionsSearch: function (oEvent) {
        var source = oEvent.getSource();
        var aSelectionSet = oEvent.getParameter("selectionSet");
        var sSearchQuery = source._oBasicSearchFieldWithSuggestions.getValue();

        var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
            if (oControl.getValue()) {
                aResult.push(new Filter({
                    path: oControl.getName(),
                    operator: FilterOperator.Contains,
                    value1: oControl.getValue()
                }));
            }

            return aResult;
        }, []);

        aFilters.push(new Filter({
            filters: [
                new Filter({ path: source._ParamKey, operator: FilterOperator.Contains, value1: sSearchQuery }),
                new Filter({ path: source._ParamTxt, operator: FilterOperator.Contains, value1: sSearchQuery })
            ],
            and: false
        }));

        this._filterTableWithSuggestions(new Filter({
            filters: aFilters,
            and: true
        }));
    },

    _filterTableWithSuggestions: function (oFilter) {
        var oValueHelpDialog = this._oValueHelpDialogWithSuggestions;

        oValueHelpDialog.getTableAsync().then(function (oTable) {
            if (oTable.bindRows) {
                oTable.getBinding("rows").filter(oFilter);
            }

            if (oTable.bindItems) {
                oTable.getBinding("items").filter(oFilter);
            }

            oValueHelpDialog.update();
        });
    },


    // --------------------------------------------------------------------------------------------------------------------
    // ---- Basic Functions
    // --------------------------------------------------------------------------------------------------------------------

    _setupRangeKeyFields: function (dialog, key, aCols) {
        var rangeLabel = "";

        for (let i = 0; i < aCols.length; i++) {
            let col = aCols[i];

            if (i === 0) {
                rangeLabel = col.label;
            }
        }

        dialog.setRangeKeyFields([{
            label: rangeLabel,
            key:   key,
            type: "string",
            typeInstance: new typeString({}, {
                maxLength: 36
            })
        }]);
    },

    _setupNewComplexFilterbar: function (dialog, collection, aCols, key, txt) {
        var that = this;

        var oFilterBar = new sap.ui.comp.filterbar.FilterBar("idFilterBarValueHelp", {
            "advancedMode":               true,
            "filterBarExpanded":          false,
            "isRunningInValueHelpDialog": true
        });

        oFilterBar.attachSearch(function(oEvent){
            that.onFilterBarWithSuggestionsSearch(oEvent);
        }); 

        // ---- Add Properties to the Filterbar object
        oFilterBar._oDialogId = dialog.sId;
        oFilterBar._oBasicSearchFieldWithSuggestions = new SearchField("idSearchDialog", {});
        oFilterBar.setBasicSearch(oFilterBar._oBasicSearchFieldWithSuggestions);

        // ---- Create the Filter Group Items
        for (let i = 0; i < aCols.length; i++) {
            let col = aCols[i];

            // ---- Create a new Input component
            let sItem = "/" + collection;
            let oItemTemplate = new sap.ui.core.Item();
                oItemTemplate.bindProperty("key", col.template);
                oItemTemplate.bindProperty("text", col.template);

            let oInput = new sap.m.Input("", {
                "value": "",
                "name" : col.template,
                "showSuggestion" : true,
                "showValueHelp"  : false
            });
            
            oInput.addSuggestionItem(oItemTemplate);

            // ---- Create a new Filter group Item
            let oFilterGroupItem = new sap.ui.comp.filterbar.FilterGroupItem("", {
                "visibleInFilterBar": col.visible,
                "groupName":          "__$INTERNAL$",
                "name":               col.template,
                "label":              col.label,
                "labelTooltip":       col.label
            });

            // ---- Add the new Input Controle to the Filter group Item
            oFilterGroupItem.setControl(oInput);

            // ---- Add the new Filter group Item to the Fillterbar
            oFilterBar.addFilterGroupItem(oFilterGroupItem);
            oFilterBar._ParamKey = key;
            oFilterBar._ParamTxt = txt;
        }

        // ---- Add the new Filterbar to the Dialog
        dialog.setFilterBar(oFilterBar);
    },

    _setupComplexFilterbar: function (dialog, aCols) {
        var oFilterBar = dialog.getFilterBar();

            // ---- Define the behavior of the Filterbar
            oFilterBar.setIsRunningInValueHelpDialog(true);
            oFilterBar.setFilterBarExpanded(false);
            oFilterBar.setAdvancedMode(true);
            
            // ---- Add Properties to the Filterbar object
            oFilterBar._oDialogId = dialog.sId;
            oFilterBar._oBasicSearchFieldWithSuggestions = new SearchField();
            oFilterBar.setBasicSearch(oFilterBar._oBasicSearchFieldWithSuggestions);

        // ---- Set Filter Group Items // groupName="__$INTERNAL$" name="CriminalCode" label="Paragraph" visibleInFilterBar="true"
        let groupItems = oFilterBar.getFilterGroupItems();

        for (let i = 0; i < aCols.length; i++) {
            let gitem = groupItems[i];
            let col = aCols[i];

            gitem.setGroupName("__$INTERNAL$");
            gitem.setName(col.template);
            gitem.setLabel(col.label);
            gitem.setLabelTooltip(col.label);
        }
    },

    _setupDialogTable: function (dialog, oModel, cModel, collection, aCols) {
        dialog.getTableAsync().then(function (oTable) {
            oTable.setModel(oModel);
            oTable.setModel(cModel, "columns");

            if (oTable.bindRows) {
                oTable.bindAggregation("rows", "/" + collection);
            }

            if (oTable.bindItems) {
                oTable.bindAggregation("items", "/" + collection, function () {
                    return new ColumnListItem({
                        cells: aCols.map(function (column) {
                            return new Label({ text: "{" + column.template + "}" });
                        })
                    });
                });
            }

            dialog.update();
        }.bind(this));
    },

    _setToken: function (dialog, key, txt) {
        var oToken = new sap.m.Token();
        	oToken.setKey(key);
        	oToken.setText(txt);

        dialog.setTokens([oToken]);
    },

    _onMultiInputValidate: function(oArgs) {
        if (oArgs.suggestionObject) {
            var oObject = oArgs.suggestionObject.getBindingContext().getObject();
            var oToken  = new sap.m.Token();

            oToken.setKey(oObject.CriminalCode);
            oToken.setText(oObject.CriminalName + " (" + oObject.CriminalCode + ")");

            return oToken;
        }

        return null;
    },

    _handleSuggest: function(oEvent) {
        var oInput = oEvent.getSource();

        if (!oInput.getSuggestionItems().length) {
            oInput.bindAggregation("suggestionItems", {
                path: "/results",
                template: new sap.ui.core.Item({
                    key:  "{key}",
                    text: "{text}"
                })
            });
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