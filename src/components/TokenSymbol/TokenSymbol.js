import React from 'react'
import config from 'config'
import './TokenSymbol.scss'
import classNames from 'classnames'

const {TOKENS} = config

function TokenSymbol({symbol}) {
    return (
        <div className={classNames("token-symbol", symbol)}>
            <img className="token-icon" src={TOKENS[symbol]?.icon} alt={symbol}/>
            <span>{symbol}</span>
        </div>
    );
}

export default TokenSymbol
