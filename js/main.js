var onDemand = new OnDemandClient();

onDemand.setAPIKey('5e79ce1f973947fbec691fabf25386c0');
onDemand.setJsonP(true);
onDemand.setBaseUrl ('https://marketdata.websol.barchart.com')
var symbols = 'G,DVN'
var fields = 'bid,ask,volume,previousClose,avgVolume'

YUI({combine: true, timeout: 10000, filter:"debug", logInclude: {example:true}}).use('node','io','json', 'dataschema-json',
	function(Y){
		var tickerApp = {
			tryCount : 0,
			delayTable: {
				'NYSE': '15min',
				'BATS': '15min',
				'CME': '10min',
				'NYQ': '15min',
				'NMS': '15min',
				'NYM': '30min',
				'CBT': '10min',
				'ASE': '15min',
				'CMS': '30min',
				'NYB': '30min',
				'CMX': '30min',
				'OB': '20min',
				'PK': '15min',
				'WCB': '---'
			},

			init : function() {
				var source = parse_url('source');
				var _self = this;
				this.strURL = 'php/ticker.php';
				this.loadSymbols();
				Y.one('.supportDataWrapper a').on('click', function(e) {
					Y.one('.supportDataWrapper').toggleClass('hidden');
					e.preventDefault();
				})
				Y.one('.btnReset').on('click', function(e) {
					Y.one('#tickerContainer').set('innerHTML', '');
					setTimeout(function() {
						Y.one('#tickerContainer').set('innerHTML', '');
						Y.one('#radioOn').set('checked', 'checked');
						_self.loadTickerData()
					}, 500)
				})
			},
			loadSymbols : function() { // Get a default list if no quick list is provided
				var context = this,
					strURL = 'data/symbols.txt',
					callback = {
						on: {
							success : function(x, o) {
								context.symbols = context.createSymbolParamList(o.responseText);
								context.loadTickerData();
								context.scrollTicker();
							}
						}
					};
				Y.io(strURL, callback);
			},
			createSymbolParamList : function(oString) { // format the default list
				var oList = oString.split('\n');
				oList.forEach(function(el, idx, arr) {
					arr[idx] = el.toUpperCase()
				})
				return oList.join(',');
			},
			loadTickerData : function() {
				var context = this,
					initString = '',
					quick = Y.one('#quickList').get('value'),
					posNeg = '',
					index = -1;
				if (quick.length > 0) {
					quick = quick.split(',');
					quick.forEach(function(el, idx, arr) {
						arr[idx] = el.toUpperCase();
					})
					quick = quick.join(',').replace(/ /g, '');
					initString = '';
				} else {
					quick = '';
					initString = this.symbols
				}
				onDemand.getQuote({symbols: initString + quick, fields: fields}, function (err, data) {
					if (err) {
						tickerApp.tryCount++;
						if(tickerApp.tryCount > 5) {
							alert('Async call failed!');
						} else {
							tickerApp.loadTickerData();
						}
					} else {
						tickerApp.tryCount = 0;
						tickerApp.buildTicker(data.results);						
					}
				});
			},
			buildTicker : function(oData){
				tickerLine = '';
				var stockCnt = oData && oData.length || 0;
				var numBid, numAsk, spread, spreadClass, stock;
				for (var i = 0; i < stockCnt; i++) {
					console.log(oData[i])
					stock = oData[i];

					if (stock.bid === 0 || stock.bid === null || stock.ask === 0 || stock.ask === 0) {
						spread = '--'
					} else {
						numBid = stock.bid * 1;
						numAsk = stock.ask * 1;
						spread = (Math.round((Math.abs(numBid - numAsk)) * 1000))/1000
					}

					if (!isNaN(spread) && spread <= .03) {
						spreadClass = 'spreadBold';
					} else if (isNaN(spread)) {
						spreadClass = 'spreadGold';
					} else {
						spreadClass = 'spreadDim'
					}
					tickerLine += '<span class=' + spreadClass + '>'

					if (document.getElementById('cbxName').checked) {
						tickerLine += stock.name + ' (';
					}
					tickerLine += stock.symbol;
					if (document.getElementById('cbxName').checked) {
						tickerLine += ')';
					}
					tickerLine += ' ';

					if (document.getElementById('cbxPrice').checked) {
						tickerLine += stock.lastPrice + ' ';
					}
					if (document.getElementById('cbxOpen').checked) {
						tickerLine += 'Open: ' + stock.open + '&nbsp;&nbsp;&nbsp;'
					}

					if (document.getElementById('cbxChange').checked) {
						if ((stock.netChange + '').indexOf('-') > -1) {
							tickerLine += '<img src="img/spacer.png" alt="" class="dirArrow down" />';
							posNeg = 'negative';
						} else if (stock.netChange * 1 === 0) {
							tickerLine += '<img src="img/spacer.png" alt="" class="dirArrow" />';
							posNeg = '';
						} else {
							tickerLine += '<img src="img/spacer.png" alt="" class="dirArrow up" />';
							posNeg = 'positive';
						}
						tickerLine += '<span class="' + posNeg + '">' + (stock.netChange + '').replace(/\-|\+/,"") + '</span> ';
					}

					if (document.getElementById('cbxBid').checked) {
						tickerLine += 'Bid: ' + stock.bid + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxAsk').checked) {
						tickerLine += 'Ask: ' + stock.ask + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxSpread').checked) {
						tickerLine += 'Spread: ' + spread + '&nbsp;&nbsp;&nbsp;'
					}

					if (document.getElementById('cbxVol').checked) {
						tickerLine += 'Avg Dly Vol: ' + (stock.avgVolume + '').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxPrevClose').checked) {
						tickerLine += 'Prev Close: ' + stock.previousClose + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxDelay').checked) {
						tickerLine += 'DLY: ' + (this.delayTable[stock.exchange] || 'UNKN') + '&nbsp;&nbsp;&nbsp;'
					}
/*
					if (document.getElementById('cbxBook').checked) {
						tickerLine += 'BkV: ' + stocks[i]['BkV'] + '&nbsp;&nbsp;&nbsp;';
						if ((stocks[i]['chg'] + '').indexOf('-') > -1) {
							posNeg = 'negative';
						} else {
							posNeg = 'positive';
						}
						tickerLine += '(&#916;50 day: <span class="' + posNeg + '">' + stocks[i]['chg'] + '</span>)&nbsp;&nbsp;&nbsp;';
					}
 */
					tickerLine += '</span>'

				}
				tickerLine += ' ...  ...  ';
				
				var tickerLineLen = tickerLine.length;
				var ticker = Y.one('#tickerContainer');
				var region = ticker.get('region');
				scrollStart = parseInt(region.right)-parseInt(region.left);
				var tickerText = '<div class="tickerLine" style="left: ' + scrollStart + 'px;">' + tickerLine + '</div>';
				ticker.set('innerHTML',ticker.get('innerHTML')+tickerText);
				
			},
			scrollTicker : function() {
				// have to check for the checked input element since IE does not support the :checked construct
				var checks = Y.all('#controls input[type="radio"]');
				var checkVal = '';
				checks.each(function(oItem){
					if(oItem.get('checked')) {
						checkVal = oItem.get('value');
					}
				});
				var speed = Y.one('#delayTimer').get('value');
				if (speed.length === 0 || isNaN(speed)) {
					speed = 50;
				} else {
					if (speed > 500) {
						alert('Maximum delay value is 500.\nSetting delay to 50.');
						speed = 50;
						Y.one('#delayTimer').set('value', '50');
					}
				}
				if (checkVal == 'off') {
					setTimeout(tickerApp.scrollTicker, 5000);
				} else {
					var ticker = Y.one('#tickerContainer'),
						region = ticker.get('region'),
						containerLeft = parseInt(region.left),
						containerRight = parseInt(region.right),
						scrollDivRight,
						scrollDivLeft,
						itemRegion,
						tickerList = Y.all('#tickerContainer .tickerLine'),
						listLen = tickerList.size(),
						current = 0;
					tickerList.each(function(oItem){
						current++;
						itemRegion = oItem.get('region');
						scrollDivLeft = itemRegion.left;
						scrollDivRight = itemRegion.right;
						scrollDivLeft = scrollDivLeft - 10;
						oItem.setStyle('left', scrollDivLeft - containerLeft+'px');
						if (current == listLen && scrollDivRight < containerRight) {
							if (!oItem.hasClass('showing')) {
								oItem.addClass('showing');
								tickerApp.loadTickerData();
							}
				 	 	}
						if (current == 1 && scrollDivRight < containerLeft) {
							oItem.remove();
						}
					});
					setTimeout(tickerApp.scrollTicker,speed);
				}
			}
		};
		
		//assign 'contentready' handler:
    	Y.on("contentready", tickerApp.init());
	}
);
	
function parse_url( name ) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexStr = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexStr );
	var results = regex.exec(window.location.href);
	if( results == null )
		return "";
	else {
		return results[1];
	}
}
