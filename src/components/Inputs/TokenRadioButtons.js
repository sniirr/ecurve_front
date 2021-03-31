import React from 'react'
import _ from 'lodash'
import TokenSymbol from "components/TokenSymbol"
import Checkbox from './Checkbox'

function TokenRadioButtons({tokens, name, selected, onChange, required}) {

    const _onChange = i => {
        const isSelected = i === selected
        if (!isSelected) {
            return onChange(i)
        }
        if (!required) {
            onChange(-1)
        }
    }

    return (
        <div className="token-list">
            {_.map(tokens, (symbol, i) => {
                const isSelected = i === selected
                return (
                    <Checkbox key={`token-rdb-${name}-${i}`} name={name} checked={isSelected} onChange={() => _onChange(i)}>
                        <TokenSymbol symbol={symbol}/>
                    </Checkbox>
                )
            })}
        </div>
    );
}

export default TokenRadioButtons
