const express = require('express')
const app = express()
const yf = require('yahoo-finance');
const port = 3010
const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => {

  yf.quote({
    symbols: ['G', 'MSFT', '^TNX'],
    modules: ['price', 'summaryDetail']
  }, (err, quote) => {
    if (quote === null || quote === undefined) {
      return {};
    }
    const keys = Object.keys(quote);
    const response = keys.map(key => {
      if (key && quote[key]) {
        const q = quote[key];
        // console.log(q)
        return {[key]: {
          price: q.price.regularMarketPrice,
          bid: q.summaryDetail.bid,
          ask: q.summaryDetail.ask,
          prevClose: q.summaryDetail.previousClose,
          volume: q.summaryDetail.volume,
          averageVolume: q.summaryDetail.averageVolume,
          exchangeDataDelayedBy: q.price.exchangeDataDelayedBy,
          shortName: q.price.shortName,
          exchangeName: q.price.exchangeName,
          change: q.price.regularMarketChange,
          symbol: q.price.symbol
        }}
      }
      return false;
    })
    res.send(response)
  })

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
