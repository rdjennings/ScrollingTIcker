YUI({combine: true, timeout: 10000, filter:"debug", logInclude: {example:true}}).use('node','io','json', 'dataschema-json',
	function(Y){
		var tickerApp = {
			tryCount : 0,
			rExp: /<b>|<\/b>/g,
			schema : {
				metaFields: {source:"source"},
				resultListLocator: "records",
//				resultFields: [{key:"symbol"}, {key:"name"}, {key:"price"}, {key:"change"}] // Or simply: ["symbol", "name", "price", "change"]
				resultFields: ["symbol", "name", "price", "change", "chg", "BkV", "bid", "ask", "adv", "prvClose", "exchange", "open"] // Or [{key:"symbol"}, {key:"name"}, {key:"price"}, {key:"change"}]
			},
			delayTable: {
				'CME': '10min',
				'NYQ': '15mim',
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
				if (source.toUpperCase() === 'YAHOO') {
					this.strURL = 'php/ticker.php';
				} else {
					this.strURL = 'stubs/ticker_data.json';
				}
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
			loadSymbols : function() {
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
			createSymbolParamList : function(oString) {
				var oList = oString.split('\n');
				oList.forEach(function(el, idx, arr) {
					arr[idx] = el.toUpperCase()
				})
				return oList.join('+');
			},
			loadTickerData : function() {
				var context = this,
					initString = '',
					callback = {
						timeout: 3000,
						on : {
							success : function(x, o){
								tickerApp.tryCount = 0;
								tickerApp.buildTicker(o.responseText);
							},
							failure : function(x, o){
								tickerApp.tryCount++;
								if(tickerApp.tryCount > 5) {
									alert('Async call failed!');
								} else {
									tickerApp.loadTickerData();
								}
							}
						}
					},
					quick = Y.one('#quickList').get('value'),
					posNeg = '',
					index = -1;
				if (quick.length > 0) {
					quick = quick.split(',');
					quick.forEach(function(el, idx, arr) {
						arr[idx] = el.toUpperCase();
					})
//					quick = '+' + quick.join('+');
					initString = '';
				} else {
					quick = '';
					initString = this.symbols
				}
				Y.io(encodeURI(this.strURL + '?symbols=' + initString + quick), callback);
			},
			buildTicker : function(oData){
				var data = Y.JSON.parse(oData.replace(this.rExp, ''));
				var stocks = Y.DataSchema.JSON.apply(this.schema, data).results;
				tickerLine = '';
				var stockCnt = stocks.length;
				var numBid, numAsk, spread, spreadClass;
				for (var i = 0; i < stockCnt; i++) {
					// YAHOO is sending back a blank/empty line from time to time
					if (stocks[i]['symbol'] == '') {
						continue;
					}

					if (stocks[i]['bid'] ==='N/A' || stocks[i]['ask'] === 'N/A') {
						spread = '--'
					} else {
						numBid = stocks[i]['bid'] * 1;
						numAsk = stocks[i]['ask'] * 1;
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
						tickerLine += stocks[i]['name'] + ' (';
					}
					tickerLine += stocks[i]["symbol"];
					if (document.getElementById('cbxName').checked) {
						tickerLine += ')';
					}
					tickerLine += ' ';
					if (document.getElementById('cbxPrice').checked) {
						tickerLine += stocks[i]['price'] + ' ';
					}
					if (document.getElementById('cbxOpen').checked) {
						tickerLine += 'Open: ' + stocks[i]['open'] + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxChange').checked) {
						if ((stocks[i]['change'] + '').indexOf('-') > -1) {
							tickerLine += '<img src="img/spacer.png" alt="" class="dirArrow down" />';
							posNeg = 'negative';
						} else if (stocks[i]['change'] * 1 === 0) {
							tickerLine += '<img src="img/spacer.png" alt="" class="dirArrow" />';
							posNeg = '';
						} else {
							tickerLine += '<img src="img/spacer.png" alt="" class="dirArrow up" />';
							posNeg = 'positive';
						}
						tickerLine += '<span class="' + posNeg + '">' + (stocks[i]['change'] + '').replace(/\-|\+/,"") + '</span> ';
					}
					if (document.getElementById('cbxBook').checked) {
						tickerLine += 'BkV: ' + stocks[i]['BkV'] + '&nbsp;&nbsp;&nbsp;';
						if ((stocks[i]['chg'] + '').indexOf('-') > -1) {
							posNeg = 'negative';
						} else {
							posNeg = 'positive';
						}
						tickerLine += '(&#916;50 day: <span class="' + posNeg + '">' + stocks[i]['chg'] + '</span>)&nbsp;&nbsp;&nbsp;';
					}
					if (document.getElementById('cbxBid').checked) {
						tickerLine += 'Bid: ' + stocks[i]['bid'] + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxAsk').checked) {
						tickerLine += 'Ask: ' + stocks[i]['ask'] + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxSpread').checked) {
						tickerLine += 'Spread: ' + spread + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxVol').checked) {
						tickerLine += 'Avg Dly Vol: ' + stocks[i]['adv'].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxPrevClose').checked) {
						tickerLine += 'Prev Close: ' + stocks[i]['prvClose'] + '&nbsp;&nbsp;&nbsp;'
					}
					if (document.getElementById('cbxDelay').checked) {
						tickerLine += 'DLY: ' + (this.delayTable[stocks[i]['exchange']] || 'UNKN') + '&nbsp;&nbsp;&nbsp;'
					}

					tickerLine += '</span>'

				}
				tickerLine += ' ...  ...  ';
				
				var tickerLineLen = tickerLine.length;
				var ticker = Y.one('#tickerContainer');
				var region = ticker.get('region');
				scrollStart = parseInt(region.right)-parseInt(region.left);
				var tickerText = '<div class="tickerLine" style="left: ' + scrollStart + 'px;">' + tickerLine + '</div>';
				ticker.set('innerHTML',ticker.get('innerHTML')+tickerText);
				Y.one('#identity').set('innerHTML', data['source']);
				
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

