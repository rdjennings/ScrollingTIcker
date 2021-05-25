const ConfigForm = ({config, updateConfig}) => {
  const handleUpdateValue = e => {
    updateConfig(e.target)
  }

  return (
    <div className="configForm">
      <form>
        <div className="showHideLabel">Show/hide options:</div>
        <ul className="configList">
          <li>
            <label>
              Symbol:
              <input type="checkbox" name="showSymbol" onChange={handleUpdateValue} checked={config.showSymbol} />
            </label>
          </li>
          <li>
            <label>
              Change:
              <input type="checkbox" name="showChange" onChange={handleUpdateValue} checked={config.showChange} />
            </label>
          </li>
          <li>
            <label>
              Bid:
              <input type="checkbox" name="showBid" onChange={handleUpdateValue} checked={config.showBid} />
            </label>
          </li>
          <li>
            <label>
              Asked:
              <input type="checkbox" name="showAsk" onChange={handleUpdateValue} checked={config.showAsk} />
            </label>
          </li>
          <li>
            <label>
              Spread:
              <input type="checkbox" name="showSpread" onChange={handleUpdateValue} checked={config.showSpread} />
            </label>
          </li>
          <li>
            <label>
              Volume:
              <input type="checkbox" name="showVolume" onChange={handleUpdateValue} checked={config.showVolume} />
            </label>
          </li>
          <li>
            <label>
              Previous Close:
              <input type="checkbox" name="showPrevClose" onChange={handleUpdateValue} checked={config.showPrevClose} />
            </label>
          </li>
          <li>
            <label>
              Exchange Name:
              <input type="checkbox" name="showExchange" onChange={handleUpdateValue} checked={config.showExchange} />
            </label>
          </li>
          <li>
            <label>
              Delay:
              <input type="checkbox" name="showDelay" onChange={handleUpdateValue} checked={config.showDelay} />
            </label>
          </li>
        </ul>
      </form>
    </div>
  )
}

export default ConfigForm;
