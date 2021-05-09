import React, {useEffect} from 'react'
import {unstake} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import _ from 'lodash'
import AssetInput from "components/Inputs/AssetInput"
import Button from "../Inputs/Button";
import {balanceSelector} from "modules/balances";

const UnstakeForm = ({symbol, onChange, onSuccess, shouldReset}) => {
    const dispatch = useDispatch()

    const apiKey = `unstake-${symbol}`
    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const stakedBalance = useSelector(balanceSelector('staked', symbol))

    const onSubmit = ({amount}) => {
        dispatch(unstake(activeUser, amount, symbol, onSuccess))
    }

    const {register, handleSubmit, setValue, errors, reset} = useForm({
        mode: 'onChange',
        criteriaMode: 'all',
    });

    useEffect(() => {
        if (shouldReset) {
            reset()
        }
    }, [shouldReset])

    return (
        <form>
            <div className="form-inputs">
                <AssetInput apiKey={apiKey} name="amount" symbol={symbol} maxAmount={stakedBalance} onChange={onChange} register={register} setValue={setValue} error={errors.amount}/>
                <Button apiKey={apiKey} onClick={handleSubmit(onSubmit)}>
                    Unstake {symbol}
                </Button>
            </div>
        </form>
    )
}

export default UnstakeForm