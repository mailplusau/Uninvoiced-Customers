/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-12-24T09:19:53+11:00
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-06-08T08:29:02+10:00
 */


define(['N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log',
  'N/error', 'N/url', 'N/format', 'N/currentRecord'
],
  function (email, runtime, search, record, http, log, error, url, format,
    currentRecord) {
    var zee = 0;
    var userId = 0;
    var role = 0;

    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
      baseURL = 'https://1048144-sb3.app.netsuite.com';
    }

    role = runtime.getCurrentUser().role;
    var userName = runtime.getCurrentUser().name;
    var userId = runtime.getCurrentUser().id;
    var currRec = currentRecord.get();
    var myRecord = currentRecord.get();

    var tollUploadSet = [];

    function pageLoad() {
      $('.loading_section').removeClass('hide');
    }

    function afterSubmit() {
      $(".se-pre-con").fadeOut("slow");

      // if (!isNullorEmpty($('#result_zee_leads_list').val())) {
      //   $('#zee_leads_list_preview').removeClass('hide');
      //   $('#zee_leads_list_preview').show();
      // }

      // $('#result_zee_leads_list').on('change', function () {
      //   $('#zee_leads_list_preview').removeClass('hide');
      //   $('#zee_leads_list_preview').show();
      // });

      // $('#zee_leads_list_preview').removeClass('hide');
      // $('#zee_leads_list_preview').show();
    }

    function pageInit() {

      $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
      $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
      $("#body").css("background-color", "#CFE0CE");

      threeMonthsUninvoicedCustomersDataSet = [];
      threeMonthsUninvoicedCustomersSet = [];
      sixMonthsUninvoicedCustomersDataSet = [];
      sixMonthsUninvoicedCustomersSet = [];



      console.log('inside pageInit() function')

      submitSearch();

      $(".lostCustomer").click(function () {
        var customerInternalID = $(this).attr("data-id");

        var cancelCustomerUrl = 'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=796&deploy=1&compid=1048144&custid=' + customerInternalID;
        console.log(cancelCustomerUrl);

        window.location.href = cancelCustomerUrl;

      });

      $(document).on('click', '.create_note', function (event) {

        var customerInternalID = $(this).attr("data-id");

        var params2 = {
          custid: customerInternalID,
          sales_record_id: null,
          reason: null,
          id: 'customscript_sl2_uninvoiced_customer_lis',
          deploy: 'customdeploy1',
          type: 'create',
          cancel: 'false'
        };
        params2 = JSON.stringify(params2);
        var par = {
          params: params2
        }
        var output = url.resolveScript({
          scriptId: 'customscript_sl_create_user_note',
          deploymentId: 'customdeploy_sl_create_user_note',
          returnExternalUrl: false,
          params: par
        });

        var upload_url = baseURL + output;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
      });

      afterSubmit();
    }

    //Initialise the DataTable with headers.
    function submitSearch() {

      dataTable = $('#3_months_list').DataTable({
        destroy: true,
        data: threeMonthsUninvoicedCustomersDataSet,
        pageLength: 1000,
        order: [],
        columns: [{
          title: 'LINK'
        }, {
          title: 'ID'
        }, {
          title: 'Customer Name'
        }, {
          title: 'Franchisee'
        }, {
          title: 'Status'
        }, {
          title: 'Last Invocie Date'
        }],
        columnDefs: [{
          targets: [1, 2, 5],
          className: 'bolded'
        }, {
          className: "text-center",
          targets: [0, 1, 2, 3, 4, 5]
        }],
        rowCallback: function (row, data, index) { }
      });

      // dataTable2 = $('#6_months_list').DataTable({
      //   destroy: true,
      //   data: sixMonthsUninvoicedCustomersDataSet,
      //   pageLength: 1000,
      //   order: [],
      //   columns: [{
      //     title: 'LINK'
      //   }, {
      //     title: 'ID'
      //   }, {
      //     title: 'Customer Name'
      //   }, {
      //     title: 'Franchisee'
      //   }, {
      //     title: 'Status'
      //   }, {
      //     title: 'Last Invocie Date'
      //   }],
      //   columnDefs: [{
      //     targets: [1, 2],
      //     className: 'bolded'
      //   }, {
      //     className: "text-center",
      //     targets: [0, 1, 2, 3, 4]
      //   }],
      //   rowCallback: function (row, data, index) { }
      // });

      loadZeeSalesLeadSearch();

      console.log('Loaded Results');
      afterSubmit()

    }

    function loadZeeSalesLeadSearch() {

      //NetSuite Search: AUDIT - Customers - No Invoices last 3 Months
      var searchCustomerList3Months = search.load({
        id: 'customsearch_no_inv_last_3_months',
        type: 'customer'
      });


      searchCustomerList3Months.run().each(function (
        customerList3MonthsResultSet) {

        var internalID = customerList3MonthsResultSet.getValue({
          name: 'internalid',
          summary: "GROUP"
        });

        var entityID = customerList3MonthsResultSet.getValue({
          name: "entityid",
          summary: "GROUP",
          label: "ID"
        });

        var companyName = customerList3MonthsResultSet.getValue({
          name: "companyname",
          summary: "GROUP",
          sort: search.Sort.ASC,
          label: "Company Name"
        });

        var franchiseeID = customerList3MonthsResultSet.getValue({
          name: "partner",
          summary: "GROUP",
          sort: search.Sort.ASC,
          label: "Franchisee"
        });

        var franchiseeName = customerList3MonthsResultSet.getText({
          name: "partner",
          summary: "GROUP",
          sort: search.Sort.ASC,
          label: "Franchisee"
        });

        var customerStatus = customerList3MonthsResultSet.getValue({
          name: "entitystatus",
          summary: "GROUP",
          label: "Status"
        });

        var customerStatusText = customerList3MonthsResultSet.getText({
          name: "entitystatus",
          summary: "GROUP",
          label: "Status"
        });

        var invoiceDate = customerList3MonthsResultSet.getValue({
          name: "trandate",
          join: "transaction",
          summary: "MAX",
          label: "Date"
        });

        threeMonthsUninvoicedCustomersSet.push({
          internalID: internalID,
          entityID: entityID,
          companyName: companyName,
          franchiseeID: franchiseeID,
          franchiseeName: franchiseeName,
          customerStatus: customerStatus,
          customerStatusText: customerStatusText,
          invoiceDate: invoiceDate
        });

        return true;
      });

      //NetSuite Search: AUDIT - Customers - No Invoices last 6 Months
      // var searchCustomerList6Months = search.load({
      //   id: 'customsearch_no_inv_last_6_months',
      //   type: 'customer'
      // });

      // searchCustomerList6Months.run().each(function (
      //   customerList6MonthsResultSet) {

      //   var internalID = customerList6MonthsResultSet.getValue({
      //     name: 'internalid',
      //     summary: "GROUP"
      //   });

      //   var entityID = customerList6MonthsResultSet.getValue({
      //     name: "entityid",
      //     summary: "GROUP",
      //     label: "ID"
      //   });

      //   var companyName = customerList6MonthsResultSet.getValue({
      //     name: "companyname",
      //     summary: "GROUP",
      //     sort: search.Sort.ASC,
      //     label: "Company Name"
      //   });

      //   var franchiseeID = customerList6MonthsResultSet.getValue({
      //     name: "partner",
      //     summary: "GROUP",
      //     sort: search.Sort.ASC,
      //     label: "Franchisee"
      //   });

      //   var franchiseeName = customerList6MonthsResultSet.getText({
      //     name: "partner",
      //     summary: "GROUP",
      //     sort: search.Sort.ASC,
      //     label: "Franchisee"
      //   });

      //   var customerStatus = customerList6MonthsResultSet.getValue({
      //     name: "entitystatus",
      //     summary: "GROUP",
      //     label: "Status"
      //   });

      //   var customerStatusText = customerList6MonthsResultSet.getText({
      //     name: "entitystatus",
      //     summary: "GROUP",
      //     label: "Status"
      //   });

      //   var invoiceDate = customerList6MonthsResultSet.getValue({
      //     name: "trandate",
      //     join: "transaction",
      //     summary: "MAX",
      //     label: "Date"
      //   });

      //   sixMonthsUninvoicedCustomersSet.push({
      //     internalID: internalID,
      //     entityID: entityID,
      //     companyName: companyName,
      //     franchiseeID: franchiseeID,
      //     franchiseeName: franchiseeName,
      //     customerStatus: customerStatus,
      //     customerStatusText: customerStatusText,
      //     invoiceDate: invoiceDate
      //   });
      //   return true;
      // });

      console.log('Inside SubmitSearcvh Function. threeMonthsUninvoicedCustomersSet: ' + threeMonthsUninvoicedCustomersSet);
      console.log('Inside SubmitSearcvh Function. sixMonthsUninvoicedCustomersSet: ' + sixMonthsUninvoicedCustomersSet);

      loadDatatable(threeMonthsUninvoicedCustomersSet, sixMonthsUninvoicedCustomersSet);
      threeMonthsUninvoicedCustomersSet = [];
      sixMonthsUninvoicedCustomersSet = [];

    }

    function loadDatatable(threeMonthsUninvoicedCustomers_rows, sixMonthsUninvoicedCustomers_rows) {

      threeMonthsUninvoicedCustomersDataSet = [];
      sixMonthsUninvoicedCustomersDataSet = [];
      threeMonthsUninvoicedCustomersCsvSet = [];
      sixMonthsUninvoicedCustomersCsvSet = [];

      if (!isNullorEmpty(threeMonthsUninvoicedCustomers_rows)) {
        threeMonthsUninvoicedCustomers_rows.forEach(function (threeMonthsUninvoicedCustomers_row, index) {

          var linkURL =
            '<button class="form-control btn btn-xs btn-primary" style="cursor: not-allowed !important;width: fit-content;"><a data-id="' +
            threeMonthsUninvoicedCustomers_row.internalID +
            '" class="viewCustomerLead" style="cursor: pointer !important;color: white;">VIEW</a></button> <button class="form-control btn btn-xs btn-info" style="cursor: not-allowed !important;width: fit-content;"><a data-id="' +
            threeMonthsUninvoicedCustomers_row.internalID +
            '" class="create_note" style="cursor: pointer !important;color: white;">USER NOTE</a></button> <button class="form-control btn btn-xs btn-danger" style="cursor: not-allowed !important;width: fit-content;"><a data-id="' +
            threeMonthsUninvoicedCustomers_row.internalID +
            '" class="lostCustomer" style="cursor: pointer !important;color: white;">CANCEL</a></button>';

          threeMonthsUninvoicedCustomersDataSet.push([linkURL, threeMonthsUninvoicedCustomers_row.entityID,
            threeMonthsUninvoicedCustomers_row.companyName,
            threeMonthsUninvoicedCustomers_row.franchiseeName, threeMonthsUninvoicedCustomers_row.customerStatusText,
            threeMonthsUninvoicedCustomers_row.invoiceDate
          ]);
          threeMonthsUninvoicedCustomersCsvSet.push([threeMonthsUninvoicedCustomers_row.internalID, threeMonthsUninvoicedCustomers_row.entityID,
          threeMonthsUninvoicedCustomers_row.companyName,
          threeMonthsUninvoicedCustomers_row.franchiseeName, threeMonthsUninvoicedCustomers_row.customerStatusText,
          threeMonthsUninvoicedCustomers_row.invoiceDate
          ]);
        });
      }
      var datatable = $('#3_months_list').DataTable();
      datatable.clear();
      datatable.rows.add(threeMonthsUninvoicedCustomersDataSet);
      datatable.draw();

      saveCsvPreview(threeMonthsUninvoicedCustomersCsvSet);

      // if (!isNullorEmpty(sixMonthsUninvoicedCustomers_rows)) {
      //   sixMonthsUninvoicedCustomers_rows.forEach(function (sixMonthsUninvoicedCustomers_row, index) {

      //     var linkURL =
      //       '<button class="form-control btn btn-xs btn-primary" style="cursor: not-allowed !important;width: fit-content;"><a data-id="' +
      //       sixMonthsUninvoicedCustomers_row.internalID +
      //       '" class="viewCustomerLead" style="cursor: pointer !important;color: white;">VIEW</a></button> <button class="form-control btn btn-xs btn-danger" style="cursor: not-allowed !important;width: fit-content;"><a data-id="' +
      //       sixMonthsUninvoicedCustomers_row.internalID +
      //       '" class="lostCustomer" style="cursor: pointer !important;color: white;">CANCEL</a></button>';

      //     sixMonthsUninvoicedCustomersDataSet.push([linkURL, sixMonthsUninvoicedCustomers_row.entityID,
      //       sixMonthsUninvoicedCustomers_row.companyName,
      //       sixMonthsUninvoicedCustomers_row.franchiseeName, sixMonthsUninvoicedCustomers_row.customerStatusText,
      //       sixMonthsUninvoicedCustomers_row.invoiceDate
      //     ]);
      //   });
      // }
      // var datatable2 = $('#6_months_list').DataTable();
      // datatable2.clear();
      // datatable2.rows.add(sixMonthsUninvoicedCustomersDataSet);
      // datatable2.draw();


      return true;
    }

    /**
 * Create the CSV and store it in the hidden field
 * 'custpage_table_csv' as a string.
 *
 * @param {Array}
 *            ordersDataSet The `billsDataSet` created in
 *            `loadDatatable()`.
 */
    function saveCsvPreview(customerList) {
      var sep = "sep=;";
      var headers = ["Customer Internal ID", "Customer ID", "Customer Name",
        "Franchisee", "Customer Status", "Last Invoice Date"
      ]
      headers = headers.join(';'); // .join(', ')

      var csv = sep + "\n" + headers + "\n";

      customerList.forEach(function (row) {
        row = row.join(';');
        csv += row;
        csv += "\n";
      });

      var val1 = currentRecord.get();

      val1.setValue({
        fieldId: 'custpage_table_csv',
        value: csv
      });

      return true;
    }

    function downloadCsv() {
      var today = new Date();
      today = formatDate(today);
      var val1 = currentRecord.get();
      var csv = val1.getValue({
        fieldId: 'custpage_table_csv',
      });
      today = replaceAll(today);
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      var content_type = 'text/csv';
      var csvFile = new Blob([csv], {
        type: content_type
      });
      var url = window.URL.createObjectURL(csvFile);
      var filename = 'Uninvoiced Customers - Last 3 Months_' + today + '.csv';
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

    }

    function saveRecord() { }

    function getDateToday() {
      var date = new Date();
      log.debug({
        title: 'date',
        details: date
      })
      format.format({
        value: date,
        type: format.Type.DATE,
        timezone: format.Timezone.AUSTRALIA_SYDNEY
      })

      return date;
    }

    function formatDate(testDate) {
      console.log('testDate: ' + testDate);
      var responseDate = format.format({
        value: testDate,
        type: format.Type.DATE
      });
      console.log('responseDate: ' + responseDate);
      return responseDate;
    }

    function replaceAll(string) {
      return string.split("/").join("-");
    }

    function isNullorEmpty(val) {
      if (val == '' || val == null) {
        return true;
      } else {
        return false;
      }
    }
    return {
      pageInit: pageInit,
      saveRecord: saveRecord,
      downloadCsv: downloadCsv
    }
  });
