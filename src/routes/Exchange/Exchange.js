import React, {useState, useEffect} from 'react'
import {exchange} from "modules/ecrv.txs";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import _ from 'lodash'
import AssetInput from "components/Inputs/AssetInput"
import useFormulas from "hooks/useFormulas";
import useApiStatus from "hooks/useApiStatus";
import usePoolLoader from 'hooks/usePoolLoader'
import SlippageInput from "components/Inputs/SlippageInput";
import TokenRadioButtons from "components/Inputs/TokenRadioButtons";
import {amountToAsset, toFloat} from "utils";
import Button from "components/Inputs/Button";
import {balancesSelector} from 'modules/balances'
import {poolInfoSelector} from 'modules/pools'
import './Exchange.scss'
import config from 'config'
import classNames from "classnames";
import {selectedPoolSelector} from "store/uiReducer";

const {POOLS, TOKENS} = config

function Exchange() {

    const dispatch = useDispatch()

    // const poolId = "3POOL"
    const poolId = useSelector(selectedPoolSelector)
    const apiKey = 'exchange'
    const {tokens} = POOLS[poolId]

    const [fromTo, setFromTo] = useState([0, 1])
    const [slippage, setSlippage] = useState('0.5')
    const [rate, setRate] = useState(-1)
    const [minReceiveAmount, setMinReceiveAmount] = useState(0)
    const fromSymbol = tokens[fromTo[0]]
    const toSymbol = tokens[fromTo[1]]

    const {register, handleSubmit, watch, errors, setValue, trigger} = useForm({
        mode: 'onChange',
        criteriaMode: 'all',
    });

    const onSelectionChange = (dirIndex, value) => {
        const currInDir = fromTo[dirIndex]
        if (value === currInDir) {
            // same value
            return
        }
        const otherDirIdx = dirIndex === 0 ? 1 : 0
        const currInOther = fromTo[otherDirIdx]
        let otherValue = currInOther

        const willChangeOther = value === currInOther
        if (willChangeOther) {
            otherValue = value === 0 ? 1 : 0
        }

        setFromTo(dirIndex === 0 ? [value, otherValue] : [otherValue, value])
    }

    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const balances = useSelector(balancesSelector('current'))
    const poolStats = useSelector(poolInfoSelector(poolId, 'stats'))
    const fee = _.get(poolStats, 'fee', {total: 0, lpPart: 0, adminPart: 0})

    const calc = useFormulas(poolId)
    const isCalcReady = calc.isReady

    useApiStatus(apiKey, () => {
        setValue('outAmount', 0)
    })

    const {inAmount} = watch()

    const calcReceiveAmount = (inAmount, inSlippage) => calc.exchangeAmount(
        fromTo[0],
        fromTo[1],
        inAmount * 1000000,
        toFloat(inSlippage),
    )

    const onSubmit = data => {
        console.log(data)
        dispatch(exchange(
            activeUser,
            poolId,
            {amount: inAmount, symbol: fromSymbol},
            {amount: minReceiveAmount, symbol: toSymbol}
        ))
    }

    useEffect(() => {
        if (!_.isEmpty(poolId)) {
            setFromTo([0, 1])
        }
    }, [poolId])

    useEffect(() => {
        setRate(isCalcReady ? calcReceiveAmount(1, 0) : 1)
    }, [fromSymbol, toSymbol, isCalcReady])

    useEffect(() => {
        if (!_.has(TOKENS, toSymbol)) return

        const precision = TOKENS[toSymbol].precision
        const expected = inAmount > 0 ? calcReceiveAmount(inAmount, 0).toFixed(precision) : 0
        const minAmount = inAmount > 0 ? calcReceiveAmount(inAmount, slippage).toFixed(precision) : 0
        if (inAmount > 0) {
            trigger('inAmount')
        }
        setValue('outAmount', expected)
        setMinReceiveAmount(minAmount)
    }, [inAmount, fromSymbol, toSymbol, slippage])

    usePoolLoader(poolId)

    const fromTokenBalance = balances[tokens[fromTo[0]]]

    return (
        <div className="section exchange">
            <form>
                <div className="lists-container">
                    <div className="direction">
                        <div className="title">From:</div>
                        <AssetInput apiKey={apiKey} symbol={fromSymbol} name="inAmount"
                                    maxAmount={fromTokenBalance || 0}
                                    register={register} setValue={setValue}
                                    error={errors.inAmount}/>
                        <TokenRadioButtons tokens={tokens} name="inToken" selected={fromTo[0]}
                                           onChange={i => onSelectionChange(0, i)}/>
                    </div>
                    <div className="direction">
                        <div className="title">To:</div>
                        <div className="input to">
                            <input type="text" name="outAmount" disabled defaultValue="0" ref={register}/>
                        </div>
                        <TokenRadioButtons tokens={tokens} name="outToken" selected={fromTo[1]}
                                           onChange={i => onSelectionChange(1, i)}/>
                    </div>
                </div>
                <div className="exchange-info">
                    <div className="fee">Fee + Admin Fee: {fee.lpPart}% + {fee.adminPart}%</div>
                    <div className="rate">Exchange rate <span
                        className="text-small">(inc. fees)</span> {fromSymbol}/{toSymbol}: {(rate).toFixed(4)}</div>
                </div>
                <SlippageInput slippage={slippage} setSlippage={setSlippage} options={['0.5', '1']}/>
                <div className="submit-container">
                    <span className={classNames("receive-message")}>
                        {minReceiveAmount > 0 && (
                            <>
                                Receive at least {amountToAsset(minReceiveAmount, toSymbol, true, true)}
                            </>
                        )}
                    </span>
                    <Button apiKey={apiKey} onClick={handleSubmit(onSubmit)}>Exchange</Button>
                </div>
            </form>
        </div>
    );
}

export default Exchange
