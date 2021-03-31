import React from 'react'
import {increaseLockPeriod} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import _ from 'lodash'
import {LockPeriodInput} from "./CommonInputs";
import useLocking from "hooks/useLocking";
import {getMinLockHours, getVCRVString} from "utils";
import Button from "../Inputs/Button";
import config from 'config'
import {getTempLockArgs, setTempLockArgs} from "routes/UseECRV/UseECRV.reducer";
const {MAIN_TOKEN} = config

const IncrLockPeriodForm = ({symbol, intervals, apiKey = "incr-lock-period", increaseLock = increaseLockPeriod, title = 'Increase Lock Period', buttonText = 'Increase Lock Period'}) => {
    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const {lockedBalance, remainingLock} = useLocking(symbol)

    const minLock = getMinLockHours(intervals)
    const minHours = remainingLock > minLock ? remainingLock : minLock

    const {lockTimeInHours = minHours} = useSelector(getTempLockArgs)

    const {handleSubmit} = useForm();

    const onSubmit = () => {
        dispatch(increaseLock(activeUser, symbol, lockTimeInHours))
    }

    const onLockPeriodChange = newLockTimeInHours => {
        dispatch(setTempLockArgs({lockTimeInHours: newLockTimeInHours}))
    }

    return (
        <form>
            <h4>{title}</h4>
            <div className="form-inputs">
                <LockPeriodInput selected={lockTimeInHours} onChange={onLockPeriodChange} remainingLock={remainingLock} intervals={intervals} />
            </div>
            <div className="submit-container">
                <div className="receive-message">
                    {symbol === MAIN_TOKEN && lockTimeInHours > remainingLock && `New mining power: ${getVCRVString(lockedBalance, lockTimeInHours)}`}
                </div>
                <Button apiKey={apiKey} onClick={handleSubmit(onSubmit)}>{buttonText}</Button>
            </div>
        </form>
    )
}

export default IncrLockPeriodForm
