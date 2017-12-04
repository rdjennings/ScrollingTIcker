var onDemand = new OnDemandClient();

onDemand.setAPIKey('5e79ce1f973947fbec691fabf25386c0');
onDemand.setJsonP(true);
onDemand.setBaseUrl ('https://marketdata.websol.barchart.com')
var symbols = 'G,DVN'
var fields = 'bid,ask,volume,previousClose'

/* get a quote for AAPL and GOOG */
onDemand.getQuote({symbols: symbols, fields: fields}, function (err, data) {
        var quotes = data.results;
        for (x in quotes) {
            console.log("getQuote: " + quotes[x].symbol + " [" + quotes[x].name + "] = " + JSON.stringify(quotes[x]));
        }
});