import React from 'react'
import {increaseLockedAmount} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import _ from 'lodash'
import AssetInput from "components/Inputs/AssetInput"
import useLocking from "hooks/useLocking";
import {getVCRVString} from "utils";
import Button from "../Inputs/Button";
import {balanceSelector} from 'modules/balances'
import config from 'config'
import {setTempLockArgs} from "routes/UseECRV/UseECRV.reducer";
const {MAIN_TOKEN} = config

const IncrLockAmountForm = ({symbol}) => {
    const dispatch = useDispatch()

    const apiKey = "incr-lock-amount"
    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const balance = useSelector(balanceSelector('current', symbol))

    const { lockedBalance, remainingLock } = useLocking(symbol)

    const {register, handleSubmit, setValue, watch, errors} = useForm({
        mode: 'onChange',
        criteriaMode: 'all',
    })

    const amount = watch('amount')

    const onSubmit = ({amount}) => {
        dispatch(increaseLockedAmount(activeUser, amount, symbol))
    }

    const hasError = !_.isNil(errors.amount)

    return (
        <form>
            <h4>Increase Locked Amount</h4>
            <div className="form-inputs">
                <AssetInput apiKey={apiKey} name="amount" symbol={symbol} maxAmount={balance} register={register} setValue={setValue} error={errors.amount}
                            onChange={value => dispatch(setTempLockArgs({lockedBalance: parseFloat(value)}))}/>
            </div>
            <div className="submit-container">
                <div className="receive-message">
                    {symbol === MAIN_TOKEN && amount > 0 && !hasError && `New mining power: ${getVCRVString(amount + lockedBalance, remainingLock)}`}
                </div>
                <Button apiKey={apiKey} onClick={handleSubmit(onSubmit)}>Increase Locked Amount</Button>
            </div>
        </form>
    )
}

export default IncrLockAmountForm
