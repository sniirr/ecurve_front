import React, {useEffect} from 'react'
import {stake} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import _ from 'lodash'
import {AssetInput} from "./CommonInputs";
import Button from 'components/Inputs/Button'
import {balanceSelector} from 'modules/balances'

const StakeForm = ({symbol, withTitle, onChange, onFocus, shouldReset}) => {
    const dispatch = useDispatch()

    const apiKey = `stake-${symbol}`
    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const balance = useSelector(balanceSelector('current', symbol))

    const {register, handleSubmit, setValue, errors, reset} = useForm({
        mode: 'onChange',
        criteriaMode: 'all',
    });

    const onSubmit = ({amount}) => {
        dispatch(stake(activeUser, amount, symbol))
    }

    useEffect(() => {
        if (shouldReset) {
            reset()
        }
    }, [shouldReset])

    return (
        <form>
            {withTitle && (<h4>Stake {symbol}</h4>)}
            <div className="form-inputs">
                <AssetInput apiKey={apiKey} name="amount" symbol={symbol} maxAmount={balance} onChange={onChange} onFocus={onFocus} register={register} setValue={setValue} error={errors.amount}/>
                <Button apiKey={apiKey} onClick={handleSubmit(onSubmit)}>
                    Stake {symbol}
                </Button>
            </div>
        </form>
    )
}

export default StakeForm
