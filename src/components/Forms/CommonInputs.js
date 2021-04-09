import React from 'react'
import TokenSymbol from "../TokenSymbol/TokenSymbol";
import _ from 'lodash'
import classNames from 'classnames'
import {addHours, differenceInHours} from "date-fns"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {getMinLockHours, amountToAsset, getMaxLockHours, getTimePeriodHoursValue} from "utils";
import useApiStatus from "hooks/useApiStatus";


export const AssetInput = ({symbol, name = "amount", label, apiKey, maxAmount, withSymbol, register, setValue, onChange, error, disabled, canBeZero, ...inputProps}) => {
    const withMax = _.isNumber(maxAmount)

    useApiStatus(apiKey, () => setValue(name, 0))

    const _onChange = value => _.isFunction(onChange) && onChange(value)

    const _onMaxClick = () => {
        _onChange(maxAmount)
        setValue(name, maxAmount, {shouldValidate: true})
    }

    const processValue = v => {
        const fValue = parseFloat(v)
        return !_.isNaN(fValue) ? fValue : 0
    }

    const hasError = !_.isNil(error)

    return (
        <div className={classNames("input", {'with-error': hasError})}>
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
                        maxExceeded: v => !withMax || parseFloat(v) <= maxAmount || "Max amount exceeded",
                    }
                })}
                   onChange={e => _onChange(e.target.value)} {...inputProps}/>
            {hasError && (
                <div className="error">{error.message}</div>
            )}
        </div>
    )
}

export const LockPeriodInput = ({intervals, remainingLock = 0, selected, onChange}) => {

    const now = new Date()
    const minHours = getMinLockHours(intervals)
    const maxHours = getMaxLockHours(intervals)
    const minDate = addHours(now, remainingLock > minHours ? remainingLock : minHours)
    const maxDate = addHours(now, maxHours)
    const selection = addHours(now, selected)

    const onCalendarChange = date => {
        const hourDiff = differenceInHours(date, now) + 1
        onChange(hourDiff)
    }

    return (
        <div className="input lock-period">
            <div className="input-row">
                <div>Lock Until:</div>
                <DatePicker dateFormat="dd MMM yyyy hh:mm" showYearDropdown showMonthDropdown
                            minDate={minDate} maxDate={maxDate} selected={selection} onChange={onCalendarChange}/>
            </div>
            <div className="intervals">
                {_.map(intervals, ({text, interval}, i) => {
                    const value = getTimePeriodHoursValue(interval)
                    const isDisabled =  remainingLock > 0 && value <=  remainingLock
                    const classes = classNames("interval", {disabled: isDisabled})
                    return (
                        <div key={`interval-${i}`} className={classes}
                             onClick={() => !isDisabled && onChange(value)}>{text}</div>
                    )
                })}
            </div>
        </div>
    )
}
