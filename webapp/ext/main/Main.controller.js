// const { Fragment } = require("react/jsx-runtime");

sap.ui.define(
    [
        'sap/fe/core/PageController',
        'sap/ui/model/json/JSONModel',
        "sap/ui/core/Fragment",
        "sap/m/MessageBox",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/export/library",
        "sap/ui/export/Spreadsheet",
        'sap/m/p13n/Engine',
        'sap/m/p13n/SelectionController',
        'sap/m/p13n/SortController',
        'sap/m/p13n/GroupController',
        'sap/m/p13n/MetadataHelper',
        "sap/fe/navigation/PresentationVariant"
    ],
    function (
        PageController,
        JSONModel,
        Fragment,
        MessageBox,
        Filter,
        FilterOperator,
        exportLibrary,
        Spreadsheet,
        Engine,
        SelectionController,
        SortController,
        GroupController,
        MetadataHelper,
        PresentationVariant
    ) {
        'use strict';

        const EdmType = exportLibrary.EdmType;

        return PageController.extend('zsbvatr1050.ext.main.Main', {
            /**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf zsbvatr1050.ext.main.Main
             */
            onInit: function () {
                PageController.prototype.onInit.apply(this, arguments); // needs to be called to properly initialize the page controller

                const oTableModel = new JSONModel({
                    mainTable: [],
                    plTable: [],
                    bsTable: [],
                    amountLinkTable: [],
                    hometaxTable: [],
                    creditCardTable: [],
                    incomeStatementTable: []
                });
                this.getView().setModel(oTableModel, "tableModel");

                this.byId("idMainTable").attachRowsUpdated(this.onTableRowsUpdated, this);
            },

            onTableRowsUpdated(oEvent) {
                const oTable = oEvent.getSource();
                if (oTable && typeof oTable.autoResizeColumn === 'function') {
                    const aColumns = oTable.getColumns();
                    aColumns.forEach((oColumn, i) => {
                        oTable.autoResizeColumn(i);
                    });
                }

                if (oTable.getId().includes("idMainTable")) {
                    const aRows = oTable.getRows();
                    const aTargetColumnIndices = [0, 1];
                    aRows.forEach(function (oRow) {
                        const oContext = oRow.getBindingContext("tableModel");
                        if (oContext) {
                            let oRowData = oContext.getObject();
                            let aCells = oRow.getCells();
                            aTargetColumnIndices.forEach(function (iColIndex) {
                                const oCell = oRow.getCells()[iColIndex];
                                if (oCell) {
                                    $(oCell.getDomRef()).closest("td").addClass("coloredColumnCell");
                                }
                            });
                            if (oRowData.isSummary) {
                                aCells.forEach(function (oCell) {
                                    $(oCell.getDomRef()).closest("td").addClass("summaryCell");
                                });
                            } else {
                                aCells.forEach(function (oCell) {
                                    $(oCell.getDomRef()).closest("td").removeClass("summaryCell");
                                });
                            }
                        }
                    });
                }
            },

            onDialogAfterOpen: function (oEvent) {
                const oDialog = oEvent.getSource();
                const oMacroTable = oDialog.findAggregatedObjects(true, (o) => o.isA("sap.fe.macros.Table"))[0];

                if (oMacroTable) {
                    const oInnerTable = oMacroTable.getContent();
                    if (oInnerTable && oInnerTable.isA("sap.ui.table.Table")) {
                        if (!oInnerTable.data("rowsUpdatedAttached")) {
                            oInnerTable.attachRowsUpdated(this.onTableRowsUpdated, this);
                            oInnerTable.data("rowsUpdatedAttached", true);
                        }

                        const oBinding = oInnerTable.getBinding("rows");
                        if (oBinding) {
                            oBinding.attachEventOnce("dataReceived", () => {
                                this.onTableRowsUpdated({ getSource: () => oInnerTable });
                            });
                            if (oBinding.getLength() > 0) {
                                this.onTableRowsUpdated({ getSource: () => oInnerTable });
                            }
                        }
                    }
                }
            },

            onDialogAfterOpen: function (oEvent) {
                const oDialog = oEvent.getSource();
                const oContent = oDialog.getContent()[0]; // Page or VBox
                if (!oContent) return;

                const findTableIn = (container) => {
                    if (!container.getContent) return null;
                    return container.getContent().find(c => c.isA("sap.fe.macros.Table"));
                }

                const oMacroTable = findTableIn(oContent) || findTableIn(oContent.getContent ? oContent.getContent()[0] : null);

                if (oMacroTable) {
                    const oInnerTable = oMacroTable.getContent();
                    if (oInnerTable && oInnerTable.isA("sap.ui.table.Table")) {
                        if (!oInnerTable.data("rowsUpdatedAttached")) {
                            oInnerTable.attachRowsUpdated(this.onTableRowsUpdated, this);
                            oInnerTable.data("rowsUpdatedAttached", true);
                        }
                        this.onTableRowsUpdated({ getSource: () => oInnerTable });
                    }
                }
            },

            /**
             * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
             * (NOT before the first rendering! onInit() is used for that one!).
             * @memberOf zsbvatr1050.ext.main.Main
             */
            onBeforeRendering: function () {

            },

            /**
             * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
             * This hook is the same one that SAPUI5 controls get after being rendered.
             * @memberOf zsbvatr1050.ext.main.Main
             */
            onAfterRendering: function (oEvent) {

                //날짜 검색
                const iCurrentYear = new Date().getFullYear();
                const sCurrentYear = iCurrentYear.toString();
                const sStartDate = iCurrentYear + "0101";
                const sEndDate = iCurrentYear + "1231";
                const aDateRange = [sStartDate, sEndDate]

                //초기화면 필터 기본값 지정
                const oView = this.getView();
                oView.byId("idFilterBar").setFilterValues("CompanyCode", "EQ", "1000");
                oView.byId("idFilterBar").setFilterValues("FiscalYear", "EQ", sCurrentYear);
                oView.byId("idFilterBar").setFilterValues("BusinessPlace", "EQ", "1000");
                oView.byId("idFilterBar").setFilterValues("DocumentDate", "BT", aDateRange);
            },

            /**
             * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
             * @memberOf zsbvatr1050.ext.main.Main
             */
            //  onExit: function() {
            //
            //  }
            /***** Filter Bar Changed & GO *****/
            handlers: {
                onFilterBarSearch(oEvent) {
                    const aFilterBar = oEvent.getSource().getFilters().filters[0].aFilters;
                    const aFilters = [...aFilterBar]; //전개구문 사용(...)

                    //
                    this.getView().byId("idMainTable").setBusy(true);

                    const oDataModel = this.getView().getModel();
                    const oTableModel = this.getView().getModel("tableModel");

                    //Main 테이블
                    const oMainTableListBiding = oDataModel.bindList("/Main", undefined, undefined, aFilters);

                    oMainTableListBiding.requestContexts().then(function (aContexts) {
                        const aMainData = aContexts.map(function (oContext) {
                            return oContext.getObject();
                        });

                        //계층 구조 생성 및 합계 계산
                        let aHierarchicalData = [];
                        let oGrandTotal = { Amount: 0, TaxAmount: 0 };
                        let vatTypeMap = new Map();

                        aMainData.forEach(oRow => {
                            // VatType 그룹 처리
                            if (!vatTypeMap.has(oRow.VatType)) {
                                let newVatTypeGroup = {
                                    VatTypeText: oRow.VatTypeText, // 그룹명
                                    Amount: 0, TaxAmount: 0,   // 소계
                                    children: [],              // 하위 그룹(SumGroup)을 담을 배열
                                    level: 1,                  // UI 표시용 레벨
                                    isHometaxButton: false
                                };
                                vatTypeMap.set(oRow.VatType, newVatTypeGroup);
                                aHierarchicalData.push(newVatTypeGroup);
                            }
                            let currentVatTypeGroup = vatTypeMap.get(oRow.VatType);

                            // SumGroup 그룹 처리
                            let sumGroupMap = new Map(currentVatTypeGroup.children.map(item => [item.SumGroup, item]));
                            if (!sumGroupMap.has(oRow.SumGroup)) {
                                let newSumGroup = {
                                    SumGroup: oRow.SumGroup,   // 그룹명
                                    Amount: 0, TaxAmount: 0, // 소계
                                    children: [],            // 원본 데이터를 담을 배열
                                    level: 2,                // UI 표시용 레벨//Hometax Button 활성화 여부
                                    isHometaxButton: false
                                };
                                sumGroupMap.set(oRow.SumGroup, newSumGroup);
                                currentVatTypeGroup.children.push(newSumGroup);
                            }
                            let currentSumGroup = sumGroupMap.get(oRow.SumGroup);

                            // 원본 데이터 추가 및 합계 계산
                            oRow.level = 3; // UI 표시용 레벨
                            oRow.isHometaxButton = (oRow.IsHometax == 'X');
                            currentSumGroup.children.push(oRow);

                            currentSumGroup.Amount += parseFloat(oRow.Amount || 0);
                            currentVatTypeGroup.Amount += parseFloat(oRow.Amount || 0);
                            oGrandTotal.Amount += parseFloat(oRow.Amount || 0);

                            currentSumGroup.TaxAmount += parseFloat(oRow.TaxAmount || 0);
                            currentVatTypeGroup.TaxAmount += parseFloat(oRow.TaxAmount || 0);
                            oGrandTotal.TaxAmount += parseFloat(oRow.TaxAmount || 0);
                        });

                        // 4. 최상단에 총계 행 추가
                        aHierarchicalData.unshift({
                            VatTypeText: "전체",
                            Amount: oGrandTotal.Amount,
                            TaxAmount: oGrandTotal.TaxAmount,
                            level: 0, // 최상위 레벨
                            isHometaxButton: false
                        });

                        console.log(aHierarchicalData);

                        // oTableModel.setProperty("/mainTable", aMainData);
                        oTableModel.setProperty("/mainTable", aHierarchicalData);
                        this.getView().byId("idMainTable").setBusy(false);

                    }.bind(this)).catch(function (oError) {
                        console.log(oError)
                        this.getView().byId("idMainTable").setBusy(false);
                    }.bind(this)
                    );

                    //PL 테이블
                    const oPLTableListBiding = oDataModel.bindList("/PL", undefined, undefined, aFilters);

                    oPLTableListBiding.requestContexts().then(function (aContexts) {
                        const aPLData = aContexts.map(function (oContext) {
                            return oContext.getObject();
                        });

                        oTableModel.setProperty("/plTable", aPLData);
                        this.getView().byId("idPLTable").setBusy(false);

                    }.bind(this)).catch(function (oError) {
                        console.log(oError)
                        this.getView().byId("idPLTable").setBusy(false);
                    }.bind(this)
                    );

                    //BS 테이블
                    const oBSTableListBiding = oDataModel.bindList("/BS", undefined, undefined, aFilters);

                    oBSTableListBiding.requestContexts().then(function (aContexts) {
                        const aBSData = aContexts.map(function (oContext) {
                            return oContext.getObject();
                        });

                        oTableModel.setProperty("/bsTable", aBSData);
                        this.getView().byId("idBSTable").setBusy(false);

                    }.bind(this)).catch(function (oError) {
                        console.log(oError)
                        this.getView().byId("idBSTable").setBusy(false);
                    }.bind(this)
                    );

                },

                onFiltersChanged() {

                }
            },

            formatter: {
                formatGroupText: function (sText, bIsFirst, iLevel) {
                    if (bIsFirst) {
                        // level에 따라 4칸씩 들여쓰기
                        var sIndent = "".padStart(iLevel * 4, " ");
                        return sIndent + sText;
                    }
                    return ""; // 그룹의 첫 행이 아니면 빈 문자열 반환
                }
            },

            onAmountLinkPress(oEvent) {
                const oMainFilterBar = this.byId("idFilterBar");
                const oSubFilterBar = this.byId("idAmountFilterBar");

                //선택된 라인 데이터 가져오기
                const oContext = oEvent.getSource().getBindingContext("tableModel");

                if (!oContext) {
                    return;
                }

                const oLineData = oContext.getObject();

                // 1. 메인 필터바의 필터 값들을 가져옵니다.
                const aMainFilters = oMainFilterBar.getFilters().filters[0].aFilters;

                // oSubFilterBar.setFilterValues("CompanyCode", "EQ", "1000");
                // 2. forEach 반복문으로 aMainFilters 배열의 모든 필터를 순회합니다.
                aMainFilters.forEach(function (oFilter) {
                    // 3. 각 필터 객체에서 경로, 연산자, 값을 추출합니다.
                    const sPath = oFilter.getPath();
                    const sOperator = oFilter.getOperator();
                    let vValue;

                    // 'BT'(사이) 연산자는 값이 배열([시작일, 종료일])이어야 하므로 별도 처리합니다.
                    if (sOperator === "BT") {
                        vValue = [oFilter.getValue1(), oFilter.getValue2()];
                    } else {
                        vValue = oFilter.getValue1();
                    }

                    // 4. 추출한 정보로 oSubFilterBar에 필터를 설정합니다.
                    oSubFilterBar.setFilterValues(sPath, sOperator, vValue);
                });

                //추가필터 지정
                oSubFilterBar.setFilterValues("VatType", "EQ", oLineData.VatType);
                oSubFilterBar.setFilterValues("VatGubun", "EQ", oLineData.VatGubun);

                oSubFilterBar.triggerSearch();

                // Attach auto-resize handler

                //Dialog를 엽니다.
                this.byId("idAmountLinkDialog").open();

            },

            onHometaxButtonPress(oEvent) {
                const oMainFilterBar = this.byId("idFilterBar");

                //선택된 라인 데이터 가져오기
                const oContext = oEvent.getSource().getBindingContext("tableModel");
                const oLineData = oContext.getObject();

                if (!oContext) {
                    return;
                }

                // 1. 메인 필터바의 필터 값들을 가져옵니다.
                const aMainFilters = oMainFilterBar.getFilters().filters[0].aFilters;


                if (oLineData.VatGubun == '01') { // 전자세금계산서 데이터 호출

                    let oSubFilterBar = this.byId("idHometaxFilterBar");

                    // 2. forEach 반복문으로 aMainFilters 배열의 모든 필터를 순회합니다.
                    aMainFilters.forEach(function (oFilter) {
                        // 3. 각 필터 객체에서 경로, 연산자, 값을 추출합니다.
                        const sPath = oFilter.getPath();
                        const sOperator = oFilter.getOperator();
                        let vValue;

                        // 'BT'(사이) 연산자는 값이 배열([시작일, 종료일])이어야 하므로 별도 처리합니다.
                        if (sOperator === "BT") {
                            vValue = [oFilter.getValue1(), oFilter.getValue2()];
                        } else {
                            vValue = oFilter.getValue1();
                        }

                        switch (oFilter.getPath()) {
                            case "CompanyCode": //CompanyCode, BusinessPlace 는 그대로 사용
                            case "BusinessPlace":
                                oSubFilterBar.setFilterValues(sPath, sOperator, vValue);
                                break;
                            case "DocumentDate": //DocumentDate 는 TaxInvoiceDate 로 변경하여 사용
                                oSubFilterBar.setFilterValues("TaxInvoiceDate", sOperator, vValue);
                                break;

                            default:
                                break;
                        }

                    });

                    oSubFilterBar.triggerSearch();

                    // Attach auto-resize handler

                    //Dialog를 엽니다.
                    this.byId("idHometaxDialog").open();

                }
                else if (oLineData.VatGubun == '02') { //신용카드 데이터 호출

                    let oSubFilterBar = this.byId("idCreditCardFilterBar");

                    // 2. forEach 반복문으로 aMainFilters 배열의 모든 필터를 순회합니다.
                    aMainFilters.forEach(function (oFilter) {
                        // 3. 각 필터 객체에서 경로, 연산자, 값을 추출합니다.
                        const sPath = oFilter.getPath();
                        const sOperator = oFilter.getOperator();
                        let vValue;

                        // 'BT'(사이) 연산자는 값이 배열([시작일, 종료일])이어야 하므로 별도 처리합니다.
                        if (sOperator === "BT") {
                            vValue = [oFilter.getValue1(), oFilter.getValue2()];
                        } else {
                            vValue = oFilter.getValue1();
                        }

                        switch (oFilter.getPath()) {
                            case "CompanyCode": //CompanyCode, BusinessPlace 는 그대로 사용
                            case "BusinessPlace":
                                oSubFilterBar.setFilterValues(sPath, sOperator, vValue);
                                break;
                            case "DocumentDate": //DocumentDate 는 ApprovalDate 로 변경하여 사용
                                oSubFilterBar.setFilterValues("ApprovalDate", sOperator, vValue);
                                break;

                            default:
                                break;
                        }

                    });

                    oSubFilterBar.triggerSearch();

                    // Attach auto-resize handler

                    //Dialog를 엽니다.
                    this.byId("idCreditCardDialog").open();

                }


            },

            onIncomeStatementDialogClose: function () {
                this.byId("incomeStatementMDCDialog").close();
            },

            onBeforeRebindIncomeStatementTable: function (oEvent) {
                // 테이블이 데이터를 요청하기 직전에 호출되는 이벤트입니다.
                const oBindingParams = oEvent.getParameter("bindingParams");
                const oFilterBar = this.byId("idFilterBar");
                const aMainFilters = oFilterBar.getFilters();

                // 여기에 필터 가공 로직을 구현합니다.
                // 예시: DocumentDate 필터의 연도를 2024년으로 변경
                const aProcessedFilters = aMainFilters.map(oFilter => {
                    if (oFilter.getPath() === 'DocumentDate') {
                        // 기존 필터에서 값을 가져와 새로운 필터 생성
                        const sNewStartDate = '20240101';
                        const sNewEndDate = '20241231';
                        return new sap.ui.model.Filter('DocumentDate', 'BT', sNewStartDate, sNewEndDate);
                    }
                    return oFilter;
                });

                // 가공된 필터를 바인딩 파라미터에 추가합니다.
                aProcessedFilters.forEach(oFilter => {
                    oBindingParams.filters.push(oFilter);
                });
            },

            onDialogClose: function (oEvent) {
                // 1. 이벤트를 발생시킨 컨트롤(클릭된 '닫기' 버튼)을 가져옵니다.
                var oButton = oEvent.getSource();
                var oDialog = oButton;

                // 2. 부모 컨트롤을 계속 따라 올라가면서 Dialog 컨트롤을 찾습니다.
                //    oDialog가 sap.m.Dialog 타입이 될 때까지 반복합니다.
                while (oDialog && !(oDialog instanceof sap.m.Dialog)) {
                    oDialog = oDialog.getParent();
                }

                // 3. Dialog를 찾았다면 close() 메서드를 호출하여 닫습니다.
                if (oDialog) {
                    oDialog.close();
                }

                // this.byId("idIncomeStatementDialog").close();
            },

            onPLAmountLinkPress: async function () {
                const oView = this.getView();
                const oMainFilterBar = this.byId("idFilterBar");
                const oSubFilterBar = this.byId("idIncomeStatementFilterBar");
                const oMacroTable = this.byId("idIncomeStatementTable");

                console.log(oMainFilterBar.getFilters());
                console.log(oSubFilterBar);
                console.log(oMacroTable);

                // 1. 메인 필터바의 필터 값들을 가져옵니다.
                const aMainFilters = oMainFilterBar.getFilters().filters[0].aFilters;

                // oSubFilterBar.setFilterValues("CompanyCode", "EQ", "1000");
                // 2. forEach 반복문으로 aMainFilters 배열의 모든 필터를 순회합니다.
                aMainFilters.forEach(function (oFilter) {
                    // 3. 각 필터 객체에서 경로, 연산자, 값을 추출합니다.
                    const sPath = oFilter.getPath();
                    const sOperator = oFilter.getOperator();
                    let vValue;

                    // 'BT'(사이) 연산자는 값이 배열([시작일, 종료일])이어야 하므로 별도 처리합니다.
                    if (sOperator === "BT") {
                        vValue = [oFilter.getValue1(), oFilter.getValue2()];
                    } else {
                        vValue = oFilter.getValue1();
                    }

                    // 4. 추출한 정보로 oSubFilterBar에 필터를 설정합니다.
                    oSubFilterBar.setFilterValues(sPath, sOperator, vValue);
                });

                oSubFilterBar.triggerSearch();

                // Attach auto-resize handler

                //Dialog를 엽니다.
                this.byId("idIncomeStatementDialog").open();
            },

            onMainTableExcelExport() {
                const oTable = this.byId("idMainTable");
                const oBinding = oTable.getBinding("rows");
                const aCols = this.createColumnConfig();
                const oSettings = {
                    workbook: { columns: aCols },
                    dataSource: oBinding
                };
                const oSheet = new Spreadsheet(oSettings);

                oSheet.build()
                    .then(function () {
                        MessageToast.show("Spreadsheet export has finished");
                    }).finally(function () {
                        oSheet.destroy();
                    });
            },

            openPersoDialog: function (oEvt) {
                const oTable = this.byId("idMainTable");

                Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oEvt.getSource()
                });
            }
        });
    }

);