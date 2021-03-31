import React from 'react'
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import _ from 'lodash'
import {AssetInput, LockPeriodInput} from "./CommonInputs";
import {getMinLockHours, getVCRVString} from "utils";
import Button from "../Inputs/Button";
import classNames from 'classnames'
import {balanceSelector} from 'modules/balances'
import {setTempLockArgs, getTempLockArgs} from 'routes/UseECRV/UseECRV.reducer'
import config from 'config'
const {MAIN_TOKEN} = config

const LockForm = ({symbol, intervals, lock, warningMessage, canBeZero}) => {
    const dispatch = useDispatch()

    const apiKey = "lock"
    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const balance = useSelector(balanceSelector('current', symbol))

    const {register, handleSubmit, setValue, watch, errors} = useForm({
        mode: 'onChange',
        criteriaMode: 'all',
    });

    const amount = watch('amount')

    const {lockTimeInHours = getMinLockHours(intervals)} = useSelector(getTempLockArgs)

    const onSubmit = ({amount}) => {
        dispatch(lock(activeUser, amount, symbol, lockTimeInHours))
    }

    const onLockPeriodChange = newLockTimeInHours => {
        dispatch(setTempLockArgs({lockTimeInHours: newLockTimeInHours}))
    }

    const hasWarning = !_.isEmpty(warningMessage)

    return (
        <form className="full-width">
            <div className="form-inputs">
                <AssetInput apiKey={apiKey} name="amount" label="Lock amount" symbol={symbol}
                            canBeZero={canBeZero} maxAmount={balance} register={register} setValue={setValue} error={errors.amount}
                            onChange={value => dispatch(setTempLockArgs({lockedBalance: parseFloat(value)}))}/>
                <LockPeriodInput selected={lockTimeInHours} onChange={onLockPeriodChange} intervals={intervals}/>
            </div>
            <div className="submit-container">
                <span className={classNames("receive-message", {warning: hasWarning})}>
                    {symbol === MAIN_TOKEN && amount > 0 && lockTimeInHours > 0 && _.isNil(errors.amount) && `Calculated mining power: ${getVCRVString(amount, lockTimeInHours)}`}
                    {hasWarning && (
                        <>
                            <span className="exclamation">!</span>
                            {warningMessage}
                        </>
                    )}
                </span>
                <Button apiKey={apiKey} onClick={handleSubmit(onSubmit)}>Lock {symbol}</Button>
            </div>
        </form>
    )
}

export default LockForm
