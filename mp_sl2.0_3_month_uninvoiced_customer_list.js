/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-12-24T08:26:00+11:00
 * @Description: List of customers that have not been invoiced for the last 3 months. Ability for the user to cancel or exclude the customer from the cancellation process.
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-06-07T12:55:05+10:00
 */


define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record',
  'N/http', 'N/log', 'N/redirect', 'N/format'
],
  function (ui, email, runtime, search, record, http, log, redirect, format) {

    var color_array = ['blue', 'red', 'green', 'orange', 'black'];

    function onRequest(context) {
      var baseURL = 'https://system.na2.netsuite.com';
      if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://system.sandbox.netsuite.com';
      }
      userId = runtime.getCurrentUser().id;
      role = runtime.getCurrentUser().role;

      var dateFrom = null;

      if (context.request.method === 'GET') {

        zee = context.request.parameters.zee;
        dateFrom = context.request.parameters.date_from;

        var form = ui.createForm({
          title: 'Uninvoiced Customers - Last 3 Months'
        });

        //INITIALIZATION OF JQUERY AND BOOTSTRAP
        var inlineHtml =
          '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://system.na2.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://cdn.datatables.net/searchpanes/1.2.1/js/dataTables.searchPanes.min.js"><script src="https://cdn.datatables.net/select/1.3.3/js/dataTables.select.min.js"></script><style>.mandatory{color:red;} .body{background-color: #CFE0CE !important;} @-webkit-keyframes animatetop {from {top:-300px; opacity:0} to {top:0; opacity:1}}@keyframes animatetop {from {top:-300px; opacity:0}to {top:0; opacity:1}}</style>';

        //HIDDEN FIELDS
        form.addField({
          id: 'custpage_table_csv',
          type: ui.FieldType.TEXT,
          label: 'Table CSV'
        }).updateDisplayType({
          displayType: ui.FieldDisplayType.HIDDEN
        })

        //Loading Section that gets displayed when the page is being loaded
        inlineHtml +=
          '<div class="se-pre-con"></div><div ng-app="myApp" ng-controller="myCtrl">';

        inlineHtml += '<div id="container"></div>'
        inlineHtml += spacing()
        inlineHtml += tabsSection();
        inlineHtml += line();
        inlineHtml += '</div>';

        form.addField({
          id: 'preview_table',
          label: 'inlinehtml',
          type: 'inlinehtml'
        }).updateLayoutType({
          layoutType: ui.FieldLayoutType.STARTROW
        }).defaultValue = inlineHtml;

        form.clientScriptFileId = 5784698
        context.response.writePage(form);

      } else {

      }
    }

    /*
     * PURPOSE : ADDS SPACING
     *  PARAMS :
     * RETURNS : INLINEHTML
     *   NOTES :
     */
    function spacing() {
      var inlineHtml =
        '<div class="form-group spacing_section">';
      inlineHtml += '<div class="row">';
      inlineHtml += '</div>';
      inlineHtml += '</div>';

      return inlineHtml;
    }


    /*
     * PURPOSE : ADDS HORIZONTAL LINE TO DIVIDE SECTIONS
     *  PARAMS :
     * RETURNS : INLINEHTML
     *   NOTES :
     */
    function line() {
      var inlineHtml =
        '<hr style="height:5px; width:100%; border-width:0; color:red; background-color:#fff">'

      return inlineHtml
    }

    /*
     * PURPOSE : BUTTONS SECTION AT THE END OF THE PAGE.
     *  PARAMS : USER ROLE
     * RETURNS : INLINEHTML
     *   NOTES :
     */
    function mainButtons(role) {

      var inlineHtml = ''
      inlineHtml +=
        '<div class="form-group container zee_available_buttons_section">';
      inlineHtml += '<div class="row">';
      inlineHtml +=
        '<div class="col-xs-6"><input type="button" value="REPORTING PAGE" class="form-control btn btn-primary" id="reportingPage" /></div>'
      inlineHtml +=
        '<div class="col-xs-6 createLead"><input type="button" value="CREATE NEW LEAD" class="form-control btn btn-primary" id="updateDetails" /></div>'
      inlineHtml += '</div>';
      inlineHtml += '</div>';

      return inlineHtml
    }

    /*
    * PURPOSE : TABS SECTION TO CREATE 2 TABS - INVESTOR OR OWNER & SEEKING EMPLOYMENT
    *  PARAMS :
    * RETURNS : INLINEHTML
    *   NOTES :
    */
    function tabsSection() {
      var inlineHtml = '<div >';

      // Tabs headers
      inlineHtml +=
        '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
      inlineHtml +=
        '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
      inlineHtml += '</style>';

      inlineHtml +=
        '<div style="width: 95%; margin:auto; margin-bottom: 30px"><ul class="nav nav-pills nav-justified main-tabs-sections " style="margin:0%; ">';

      inlineHtml +=
        '<li role="presentation" class="active"><a data-toggle="tab" href="#3_months_list_tab"><b>LAST 3 MONTHS</b></a></li>';
      // inlineHtml +=
      //   '<li role="presentation" class=""><a data-toggle="tab" href="#6_months_list_tab"><b>LAST 6 MONTHS</b></a></li>';

      inlineHtml += '</ul></div>';

      // Tabs content
      inlineHtml += '<div class="tab-content">';
      inlineHtml +=
        '<div role="tabpanel" class="tab-pane active" id="3_months_list_tab">';
      inlineHtml += '<br></br>';
      inlineHtml += dataTable('3_months_list');
      inlineHtml += '</div>';

      inlineHtml +=
        '<div role="tabpanel" class="tab-pane" id="6_months_list_tab">';
      inlineHtml += '<br></br>';
      inlineHtml += dataTable('6_months_list');
      inlineHtml += '</div>';

      inlineHtml += '</div></div>';

      return inlineHtml;
    }

    /*
     * PURPOSE : Table of the list of Franchisee Sales Leads
     *  PARAMS :
     * RETURNS :  @return  {String}    inlineHtml
     *   NOTES :
     */
    function dataTable(name) {
      var inlineHtml = '<style>table#' +
        name +
        ' {color: #103D39 !important; font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#' +
        name +
        ' th{text-align: center;} .bolded{font-weight: bold;}</style>';
      inlineHtml += '<table id="' +
        name +
        '" class="table table-responsive table-striped customer tablesorter" style="width: 100%;">';
      inlineHtml += '<thead style="color: white;background-color: #379E8F;">';
      inlineHtml += '<tr class="text-center">';

      inlineHtml += '</tr>';
      inlineHtml += '</thead>';

      inlineHtml += '<tbody id="result_usage_' + name + '" ></tbody>';

      inlineHtml += '</table>';
      return inlineHtml;
    }

    /*
     * PURPOSE : CHECK IF PARAM IS NULL OR EMPTY BASED ON BELOW CRITERIAS
     *  PARAMS :  -
     * RETURNS :  BOOL
     *   NOTES :
     */

    function isNullorEmpty(strVal) {
      return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
        undefined || strVal == 'undefined' || strVal == '- None -' ||
        strVal ==
        '0');
    }

    /**
     * The header showing that the results are loading.
     * @returns {String} `inlineQty`
     */
    function loadingSection() {
      var inlineHtml =
        '<div id="loading_section" class="form-group container loading_section " style="text-align:center">';
      inlineHtml += '<div class="row">';
      inlineHtml += '<div class="col-xs-12 loading_div">';
      inlineHtml += '<h1>Loading...</h1>';
      inlineHtml += '</div></div></div>';

      return inlineHtml;
    }

    /*
     * PURPOSE : GET TODAYS DATE
     *  PARAMS :  -
     * RETURNS :  -
     *   NOTES :
     */

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


    function getDate(inputDate) {
      var date = new Date(inputDate);
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

    function getDay() {
      var date = new Date();
      if (date.getHours() > 6) {
        date.setDate(date.getDate() + 1);
      }
      var day = date.getDay();

      return day;
    }


    /**
     * Used to pass the values of `date_from` and `date_to` between the scripts and to Netsuite for the records and the search.
     * @param   {String} date_iso       "2020-06-01"
     * @returns {String} date_netsuite  "1/6/2020"
     */
    function dateISOToNetsuite(date_iso) {
      var date_netsuite = '';
      if (!isNullorEmpty(date_iso)) {
        var date_utc = new Date(date_iso);
        // var date_netsuite = nlapiDateToString(date_utc);
        var date_netsuite = format.format({
          value: date_utc,
          type: format.Type.DATE
        });
      }
      return date_netsuite;
    }

    return {
      onRequest: onRequest
    };
  });
