import React, {useState, useEffect} from 'react'
import {withdraw} from "modules/ecrv.txs";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import {toFloat, amountToAsset} from "utils";
import _ from 'lodash'
import Slider from 'rc-slider';
import TokenRadioButtons from 'components/Inputs/TokenRadioButtons'
import {AssetInput} from "components/Forms/CommonInputs";
import useFormulas from "hooks/useFormulas";
import useApiStatus from "hooks/useApiStatus";
import SlippageInput from "components/Inputs/SlippageInput";
import './Withdraw.scss'
import Button from "components/Inputs/Button";
import {balancesSelector} from 'modules/balances'
import config from 'config'
import usePoolLoader from "hooks/usePoolLoader";
const {POOLS, TOKENS} = config

function Withdraw() {

    const dispatch = useDispatch()

    const apiKey = "withdraw"
    const poolId = "3POOL"
    const {tokens, lpTokenSymbol} = POOLS[poolId]

    const [shareOfLiquidity, setShareOfLiquidity] = useState(0)
    const [withdrawOne, setWithdrawOne] = useState(-1)
    const [slippage, setSlippage] = useState('0.5')
    const [toBeBurned, setToBeBurned] = useState(0)

    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const balances = useSelector(balancesSelector('current'))

    const isWithdrawOne = withdrawOne > -1
    const isBalanced = shareOfLiquidity > 0 && !isWithdrawOne

    const calc = useFormulas(poolId)

    useApiStatus(apiKey, () => {
        setShareOfLiquidity(0)
        setToBeBurned(0)
    })

    const {register, handleSubmit, watch, setValue, errors, reset} = useForm({
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: _.zipObject(tokens, _.map(tokens, () => 0))
    });

    const amounts = watch()

    const sumAmount = _.sum(_.values(amounts))

    const onSubmit = data => {
        console.log(data)
        const withdrawOneSymbol = withdrawOne > -1 && tokens[withdrawOne]
        dispatch(withdraw(activeUser, toBeBurned, amounts, withdrawOneSymbol, isBalanced))
    }

    const estimateWithdrawOne = (lpTokenAmount) => {
        let amountReceived = calc.withdrawOne(lpTokenAmount * 1000000, withdrawOne, toFloat(slippage)) / 1000000
        amountReceived = amountReceived > 0 ? amountReceived : 0

        _.forEach(tokens, (symbol, i) => {
            setValue(symbol, i === withdrawOne ? amountReceived.toFixed(TOKENS[symbol].precision) : 0)
        })
    }

    const onSliderChange = value => {
        const lpTokenAmount = value === 0 ? 0 : toFloat(balances[lpTokenSymbol] * value / 100, 6)
        setValue('lpamount', lpTokenAmount.toFixed(6))
        setShareOfLiquidity(value)
        setToBeBurned(lpTokenAmount)
        if (withdrawOne > -1) {
            estimateWithdrawOne(lpTokenAmount)
        }
        else {
            const amountsReceived = calc.withdraw(lpTokenAmount, 0)
            _.forEach(tokens, (symbol, i) => {
                setValue(symbol, amountsReceived[i].toFixed(TOKENS[symbol].precision))
            })
        }
    }

    const onWithdrawOneChange = value => {
        setShareOfLiquidity(0)
        reset()
        setWithdrawOne(value)
        setToBeBurned(0)
    }

    const onInputFocus = () => {
        setShareOfLiquidity(-1)
        setWithdrawOne(-1)
    }

    const estimateBurn = () => {
        const withdrawAmounts = _.map(tokens, (symbol, i) => amounts[symbol] * 1000000)

        const estimatedBurn = calc.withdrawImbalanced(withdrawAmounts, toFloat(slippage))
        setToBeBurned(toFloat(estimatedBurn / 1000000))
    }

    useEffect(() => {
        if (sumAmount === 0) {
            // all 0's, no need to calc
            setToBeBurned(0)
            return
        }
        if (isWithdrawOne) {
            estimateWithdrawOne(toBeBurned)
        }
        else {
            estimateBurn()
        }
    }, [slippage])

    usePoolLoader(poolId)

    const renderBurnMessage = () => {
        if (toBeBurned <= 0) return null

        if (toBeBurned > balances[lpTokenSymbol]) return (
            <span className="error">Burn amount exceeding {lpTokenSymbol} balance ({toBeBurned} {lpTokenSymbol})</span>
        )

        return `${!isBalanced && !isWithdrawOne ? 'Max. ' : ''}${amountToAsset(toBeBurned, lpTokenSymbol)} will be burned`
    }

    return (
        <div className="section withdraw">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="withdraw-inputs">
                    <div className="left-side">
                        <div className="title">Withdraw {lpTokenSymbol}</div>
                        <div className="max-amount"
                             onClick={() => onSliderChange(100)}>max: {amountToAsset(balances[lpTokenSymbol], lpTokenSymbol, true)}</div>
                        <div className="input slider">
                            <Slider marks={{0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%'}}
                                    value={shareOfLiquidity >= 0 ? shareOfLiquidity : 0}
                                    onChange={onSliderChange}/>
                        </div>
                    </div>
                    <div className="right-side">
                        <div className="title">Withdraw In One Coin</div>
                        <TokenRadioButtons tokens={tokens} name="withrawone" selected={withdrawOne}
                                           onChange={onWithdrawOneChange}/>
                    </div>
                </div>
                <div className="token-inputs">
                    {_.map(tokens, (symbol, i) => {
                        return (
                            <AssetInput apiKey={apiKey} key={`token-input-${symbol}`} symbol={symbol} name={symbol} canBeZero
                                        register={register} setValue={setValue} withSymbol onFocus={onInputFocus}
                                        onChange={estimateBurn} error={errors[symbol]}/>
                        )
                    })}
                </div>
                {(shareOfLiquidity === -1 || withdrawOne !== -1) && (
                    <SlippageInput slippage={slippage} setSlippage={setSlippage} options={['0.5', '1']}/>
                )}
                <div className="submit-container">
                    <span className="receive-message">
                        {renderBurnMessage()}
                    </span>
                    <Button apiKey={apiKey} onClick={handleSubmit(onSubmit)}>Withdraw</Button>
                </div>
            </form>
        </div>
    );
}

export default Withdraw
