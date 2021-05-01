import React from 'react'
import './TokenSymbol.scss'
import classNames from 'classnames'
import ICONS from 'images/token-icons'

function TokenSymbol({symbol}) {
    return (
        <div className={classNames("token-symbol", symbol)}>
            <img className="token-icon" src={ICONS[symbol]} alt={symbol}/>
            <span>{symbol}</span>
        </div>
    );
}

export default TokenSymbol
