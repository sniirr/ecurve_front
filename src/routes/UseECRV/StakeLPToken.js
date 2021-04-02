import React, {useState} from 'react'
import StakeForm from 'components/Forms/StakeForm'
import UnstakeForm from 'components/Forms/UnstakeForm'
import {fetchStakedToken} from "modules/wallet"
import {useDispatch, useSelector} from "react-redux";
import _ from "lodash";
import useOnLogin from "hooks/useOnLogin";
import {boostSelector} from "modules/boost";
import BoostGauge from 'components/Gauge/BoostGauge'
import {getTempLockArgs} from "routes/UseECRV/UseECRV.reducer";
import {poolFeesApySelector, poolECRVApySelector} from 'modules/pools'
import config from 'config'
import {fetchBalance, balanceSelector} from "modules/balances";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faClock} from "@fortawesome/free-regular-svg-icons";
import useLocking from "hooks/useLocking";
import usePoolLoader from "hooks/usePoolLoader";

const {MAIN_TOKEN, TOKENS, POOLS} = config

const StakeLPToken = ({poolId}) => {

    const {lpTokenSymbol: symbol} = POOLS[poolId]

    const dispatch = useDispatch()
    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const [poolTempStake, setPoolTempStake] = useState(0)

    const overrides = useSelector(getTempLockArgs)
    const {boost, ecrv_for_max_boost} = useSelector(boostSelector(poolId, {...overrides, stakedAmount: poolTempStake}))
    const feesApy = useSelector(poolFeesApySelector(poolId))
    const poolEcrvApy = useSelector(poolECRVApySelector(poolId))
    const stakedBalance = useSelector(balanceSelector('staked', symbol))
    const {hasLocked, lockedBalance} = useLocking(MAIN_TOKEN)

    const [shouldReset, setShouldReset] = useState('')

    useOnLogin(() => {
        dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
        dispatch(fetchStakedToken(activeUser, symbol))
    })

    usePoolLoader(poolId)

    const onInputChange = addStake => value => {
        setShouldReset(addStake ? 'unstake': 'stake')
        const fValue = parseFloat(value)
        setPoolTempStake(addStake ? fValue : (0 - fValue))

        setTimeout(() => setShouldReset(''), 0)
    }

    const hasTempStaked = poolTempStake !== 0
    const hasStaked = hasTempStaked || stakedBalance > 0

    const hasTempLock = overrides.lockedBalance > 0 || overrides.lockTimeInHours > 0

    const renderMaxBoostText = () => {
        if (!hasStaked || ecrv_for_max_boost <= 0) return null

        const text = lockedBalance > 0 && ecrv_for_max_boost > lockedBalance
            ? `Lock additional ${(ecrv_for_max_boost - lockedBalance).toFixed(6)}`
            : `Lock total of ${ecrv_for_max_boost.toFixed(6)}`

        return (
            <div className="info">
                {text} {MAIN_TOKEN} for max boost
            </div>
        )
    }

    return (
        <div className="section stake-and-lock">
            <div className="section-header">
                <h3>{symbol} Liquidity Gauge</h3>
                <div className="apy success">
                    Liquidity Mining APY {poolEcrvApy.toFixed(2)}%
                    {/*Liquidity Mining APY {poolEcrvApy.toFixed(2)}% + Fees APY {feesApy.toFixed(2)}%*/}
                </div>
            </div>
            <div className="boost-section">
                <div className="boost-info">
                    {!hasStaked && <div className="info">Stake {symbol} to start mining {MAIN_TOKEN}</div>}
                    {hasStaked && !hasLocked && !hasTempLock && <div className="info">Lock {MAIN_TOKEN} to boost liquidity mining</div>}
                    {hasStaked && hasTempLock && (
                        <div className="info">
                            <FontAwesomeIcon icon={faClock} />
                            Boost is calculated with pending {hasTempStaked ? `Stake and ` : ''}Timelock
                        </div>
                    )}
                    {renderMaxBoostText()}
                </div>
                <BoostGauge disabled={!hasStaked} boost={boost}/>
            </div>
            <div className="stake-unstake">
                <StakeForm symbol={symbol} onChange={onInputChange(true)} shouldReset={shouldReset === 'stake'}/>
                <UnstakeForm symbol={symbol} onChange={onInputChange(false)} shouldReset={shouldReset === 'unstake'}/>
            </div>
        </div>
    );
}

export default StakeLPToken