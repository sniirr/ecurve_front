import React from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import {addHours, differenceInHours} from "date-fns"
import DatePicker from "react-datepicker";
import {getMinLockHours, getMaxLockHours, getTimePeriodHoursValue} from "utils";
import "react-datepicker/dist/react-datepicker.css";
import './LockPeriodInput.scss'

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

export default LockPeriodInput
