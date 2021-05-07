import React from 'react'
import TokenSymbol from "components/TokenSymbol"
import _ from 'lodash'
import classNames from 'classnames'
import {amountToAsset, removeComma} from "utils";
import useApiStatus from "hooks/useApiStatus"
import './AssetInput.scss'


export const AssetInput = ({symbol, name = "amount", label, apiKey, maxAmount, withSymbol, register, setValue, onChange, error, disabled, canBeZero, ...inputProps}) => {
    const withMax = _.isNumber(maxAmount)

    useApiStatus(apiKey, () => setValue(name, 0))

    const _onChange = value => _.isFunction(onChange) && onChange(removeComma(value))

    const _onMaxClick = () => {
        _onChange(maxAmount + '')
        setValue(name, maxAmount, {shouldValidate: true})
    }

    const processValue = v => {
        const fValue = parseFloat(removeComma(v))
        return !_.isNaN(fValue) ? fValue : 0
    }

    const hasError = !_.isNil(error)

    return (
        <div className={classNames("input asset-input", {'with-error': hasError})}>
            <div className={classNames("label-row", {'with-symbol': withSymbol || !_.isEmpty(label)})}>
                {withSymbol && (
                    <TokenSymbol symbol={symbol}/>
                )}
                {label && (
                    <span>{label}</span>
                )}
                <div className="max-amount">
                    {withMax && (
                        <span onClick={_onMaxClick}>max: {amountToAsset(maxAmount, symbol, false, true)}</span>
                    )}
                </div>
            </div>
            <input type="text" name={name} disabled={disabled} defaultValue="0" ref={
                register({
                    setValueAs: processValue,
                    validate: {
                        positive: v => {
                            const fv = parseFloat(v)
                            return (canBeZero ? fv >= 0 : fv > 0) || "Must be greater then 0"
                        },
                        maxExceeded: v => !withMax || parseFloat(removeComma(v)) <= maxAmount || "Max amount exceeded",
                    }
                })}
                   onChange={e => _onChange(e.target.value)} {...inputProps}/>
            {hasError && (
                <div className="error">{error.message}</div>
            )}
        </div>
    )
}

export default AssetInput