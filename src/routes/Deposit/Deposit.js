import React, {useState, useEffect} from 'react'
import {deposit} from "modules/ecrv.txs";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import _ from 'lodash'
import {AssetInput} from "../../components/Forms/CommonInputs";
import useFormulas from "hooks/useFormulas"
import Checkbox from "components/Inputs/Checkbox";
import SlippageInput from 'components/Inputs/SlippageInput'
import './Deposit.scss'
import {toFloat, amountToAsset} from "utils";
import Button from "components/Inputs/Button";
import {balancesSelector} from 'modules/balances'
import config from 'config'
import usePoolLoader from "hooks/usePoolLoader";
import {poolInfoSelector} from 'modules/pools'

const {POOLS} = config

function Deposit() {

    const dispatch = useDispatch()

    const apiKey = "deposit"

    const poolId = '3POOL'
    const {tokens, lpTokenSymbol} = POOLS[poolId]

    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const balances = useSelector(balancesSelector('current'))
    const {price} = useSelector(poolInfoSelector(poolId, 'stats'))
    const [isDepositBalanced, setIsDepositBalanced] = useState(false)
    const [isDepositMax, setIsDepositMax] = useState(false)
    const [slippage, setSlippage] = useState('0.5')
    const [bonus, setBonus] = useState(0)

    const calc = useFormulas(poolId)

    const [receiveAmount, setReceiveAmount] = useState(0)
    const [receiveAmountWithoutSlippage, setReceiveAmountWithoutSlippage] = useState(0)

    const {register, handleSubmit, watch, errors, setValue} = useForm({
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: _.zipObject(tokens, _.map(tokens, () => 0))
    })

    const amounts = watch()

    const sumAmount = _.sum(_.values(amounts))

    const onSubmit = data => {
        dispatch(deposit(activeUser, amounts, receiveAmount))
    }

    const setInputAmount = (symbol, amount) => {
        setValue(symbol, amountToAsset(amount, symbol, false), {shouldValidate: true})
    }

    const onInputChange = (amount, tokenIndex) => {
        setIsDepositMax(false)
        if (isDepositBalanced) {
            const values = calc.balancedDeposit(amount, tokenIndex, slippage)
            _.forEach(tokens, (symbol, i) => setInputAmount(symbol, values[i]))
        }
    }

    const onToggleDepositMax = () => {
        if (!isDepositMax) {
            const values = isDepositBalanced ? _.zipObject(tokens, calc.maxBalancedDeposit(balances)) : balances
            _.forEach(tokens, symbol => setInputAmount(symbol, values[symbol]))
        }
        setIsDepositMax(!isDepositMax)
    }

    const onToggleDepositBalanced = () => {
        setIsDepositMax(false)
        setIsDepositBalanced(!isDepositBalanced)
    }

    useEffect(() => {
        if (sumAmount === 0) {
            // all 0's, no need to calc
            setReceiveAmount(0)
            setReceiveAmountWithoutSlippage(0)
            return
        }

        // valid amounts - calculate received LP token and bonus
        const depositAmounts = _.map(tokens, (symbol, i) => amounts[symbol] * 1000000)
        const {lpTokenAmount, withoutSlippage, bonusAmount} = calc.lpTokenOnDeposit(depositAmounts, toFloat(slippage))

        console.log('deposit receive amount', {lpTokenAmount, bonusAmount})

        setReceiveAmount(lpTokenAmount / 1000000)
        setReceiveAmountWithoutSlippage(withoutSlippage / 1000000)
        setBonus(bonusAmount > 0 ? bonusAmount : 0)
    }, [sumAmount, slippage])

    usePoolLoader(poolId)

    const bonusText = !isDepositBalanced && toFloat(bonus, 3) > 0 ? ` | ${bonus.toFixed(3)}% Bonus` : ''

    return (
        <div className="section deposit">
            <form onSubmit={handleSubmit(onSubmit)}>
                {_.map(tokens, (symbol, i) => {
                    const balance = balances[symbol]
                    return (
                        <AssetInput apiKey={apiKey} key={`deposit-input-${symbol}`} symbol={symbol} name={symbol} canBeZero
                                    onChange={value => onInputChange(value, i)}
                                    error={_.get(errors, symbol)}
                                    maxAmount={balance || 0} withSymbol register={register} setValue={setValue}/>
                    )
                })}
                <Checkbox checked={isDepositBalanced} onChange={onToggleDepositBalanced}>
                    Add all coins in a balanced proportion
                </Checkbox>
                <Checkbox checked={isDepositMax} onChange={onToggleDepositMax}>
                    Use maximum amount of coins available
                </Checkbox>
                <SlippageInput options={['0.5', '1']} slippage={slippage} setSlippage={setSlippage}/>
                <div className="submit-container">
                    <span className="receive-message">
                        {receiveAmount > 0 && (
                            <>
                                <div style={{marginBottom: 8}}>You will receive {amountToAsset(receiveAmountWithoutSlippage, lpTokenSymbol, true, true)} {bonusText}</div>
                                <div className="text-small">(At least {amountToAsset(receiveAmount, lpTokenSymbol, true, true)} with {slippage}% max slippage)</div>
                            </>
                        )}
                    </span>
                    <Button apiKey={apiKey} onClick={handleSubmit(onSubmit)}>Deposit</Button>
                </div>
                {receiveAmount > 0 && (
                    <div className="lp-price text-small">1 {lpTokenSymbol} = {parseFloat(price || '0').toFixed(6)} USD</div>
                )}
            </form>
        </div>
    );
}

export default Deposit
