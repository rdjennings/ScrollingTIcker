import {useEffect, useState} from 'react';
import './App.css';
import ConfigForm from './Components/ConfigForm';

const App = () => {
  const [tickerData, setTickerData] = useState([]);
  
  const [config, setConfig] = useState({
    pause: true,
    showAsk: true,
    showBid: true,
    showChange: true,
    showDelay: true,
    showExchange: true,
    showPrevClose: true,
    showSpread: true,
    showSymbol: true,
    showVolume: true,
  });

  useEffect(() => {
    let delayState = false;
    const fetchTicker = () =>fetch('http://localhost:3010')
      .then(response => response.json())
      .then(data => {
        setTickerData(data);
        let delay = 5000;
        let now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        let sod = new Date(year, month, day, 9, 30);
        let eod = new Date(year, month, day, 16, 30);

        if (now.getTime >= sod.getTime() && now.getTime() <= eod.getTime()) {
          delay = 5000;
        } else if (now.getTime() > eod.getTime()) {
          const tomorrow = new Date(year, month, day + 1, 9, 30).getTime();
          delayState = true;
          delay = tomorrow - now.getTime();
        } else if (now.getTime() < sod.getTime()) {
          delay = sod.getTime() - now.getTime();
          delayState = true;
        }

        let title = document.title;
        if (title[0] === '*') title = title.substring(1);
        if (delayState) title = '*' + title;
        document.title = title;
        
        setTimeout(() => {
          fetchTicker();
        }, delay);
      })
      fetchTicker()
  }, [])

  const tickerBlocks = item => {
    const key = Object.keys(item)[0];
    const data = item[key];
    let spreadClass = '';
    let dirImage = null;
    let posNeg = '';
    let dirChange = null;

    let spread = '--'
    if (data.bid === 0 || data.bid === null || data.ask === 0 || data.ask === 0) {
      spread = '--'
    } else {
      const numBid = data.bid * 1;
      const numAsk = data.ask * 1;
      spread = (Math.round((Math.abs(numBid - numAsk)) * 1000))/1000
    }

    let label = '';

    if (!isNaN(spread) && spread <= .03) {
      spreadClass = 'spreadBold';
      label = '*';
    } else if (isNaN(spread)) {
      spreadClass = 'spreadGold';
    } else {
      spreadClass = 'spreadDim'
    }

    if (config.showChange) {
      if ((data.change + '').indexOf('-') > -1) {
        dirImage = (<img src="/assets/images/spacer.png" alt="" className="dirArrow down" />);
        posNeg = 'negative';
      } else if (data.change * 1 === 0) {
        dirImage = null;
        posNeg = '';
      } else {
        dirImage = (<img src="/assets/images/spacer.png" alt="" className="dirArrow up" />);
        posNeg = 'positive';
      }
      dirChange = (<span className={posNeg}>{(data.change + '').replace(/-|\+/,"")}</span> );
    }

    let price = data.price + '';
    const parts = price.split('.');
    if (parts[1].length === 0) {
      price += '.00'; 
    } else if (parts[1].length === 1) {
      price += '0';
    }

    if (data.symbol === 'G') {
      document.title = `Equity Quotes (G: ${price})`;
    }

    const itemName =  (<div>{data.shortName} {config.showSymbol && `(${data.symbol})`}: {price}</div>);
    const itemChange = config.showChange ? (<div className={posNeg}>{dirImage}Change: {dirChange}</div>) : null;
    const itemBid = config.showBid ? (<div>Bid: {data.bid}</div>) : null;
    const itemAsk = config.showAsk ? (<div>Ask: {data.ask}</div>) : null;
    const itemSpread = config.showSpread ? (<div>Spread: {spread} {label}</div>) : null;
    const itemVolume = config.showVolume ? (<div>Volume: {data.averageVolume}</div>) : null;
    const itemPrevClose = config.showPrevClose ? (<div>PrevClose: {data.prevClose}</div>) : null;
    const itemExchange = config.showExchange ? (<div>Exchange: {data.exchangeName}</div>) : null;
    const itemEDelay = config.showDelay ? (<div>Exch Delay: {data.exchangeDataDelayedBy}</div>) : null;
    return (<div className={spreadClass} key={`symbol_${key}`}>{itemName}{itemChange}{itemBid}{itemAsk}{itemSpread}{itemVolume}{itemPrevClose}{itemExchange}{itemEDelay}</div>)
  }

  const updateConfig = target => {
    const eName = target.name;
    setConfig(currConfig => Object.assign({}, currConfig, {[eName]: target.checked}))
  }

  return (
    <div className="App">
      <div className="blocksContainer">
        <div className="tickerBlocks">
          {tickerData.map((item) => {
            return tickerBlocks(item)
          })}
        </div>
      </div>
      <ConfigForm
        config={config}
        updateConfig={updateConfig}
      />
      <div className="footNote">(*: Spread less than or equal to .03)</div>
    </div>
  );
}

export default App;
