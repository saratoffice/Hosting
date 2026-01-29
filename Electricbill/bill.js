function generateURL() {
        var param1 = document.getElementById('param1').value;
        var param2 = document.getElementById('param2').value;
        var param3 = document.getElementById('param3').value;

        if (param3.length !== 12) {
            alert('Consumer Number must have exactly 12 characters.');
            return;
        }
      // Check if the Consumer A/c No. is numeric
        if (isNaN(param3)) {
            alert('Consumer Number must be a numeric value.');
            return;
        }

        var baseURL = 'https://tpwodlwss.tpodisha.com/fgweb/web/json/plugin/com.flg.jcu.plugin.DynamicReportGenerator/service?name=billPrint';
        var fullURL = baseURL + '&month=' + param1 + '&year=' + param2 + '&scno=' + param3 + '&discom=WESCO&contractLoad=95.00 KW&loadType=T';

        window.location.href = fullURL;
    }
