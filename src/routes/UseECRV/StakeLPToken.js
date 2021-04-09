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
import {amountToAsset} from "../../utils";

const {MAIN_TOKEN, TOKENS, POOLS} = config

const StakeLPToken = ({poolId}) => {

    const {lpTokenSymbol: symbol, name: poolName} = POOLS[poolId]

    const dispatch = useDispatch()
    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const [poolTempStake, setPoolTempStake] = useState(0)

    const overrides = useSelector(getTempLockArgs)
    const {boost, ecrv_for_max_boost} = useSelector(boostSelector(poolId, {...overrides, stakedAmount: poolTempStake}))
    const feesApy = useSelector(poolFeesApySelector(poolId))
    const {basePoolApy, maxPoolApy} = useSelector(poolECRVApySelector(poolId))
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

    const pendingStakedBalance = hasTempStaked ? (stakedBalance + poolTempStake) : stakedBalance
    const hasStaked = (hasTempStaked && stakedBalance + poolTempStake !== 0) || pendingStakedBalance > 0

    const hasTempLock = overrides.lockedBalance > 0 || overrides.lockTimeInHours > 0

    const renderMaxBoostText = () => {
        if (!hasStaked || ecrv_for_max_boost <= 0) return null

        const text = lockedBalance > 0 && ecrv_for_max_boost > lockedBalance
            ? `Lock additional ${(amountToAsset(ecrv_for_max_boost - lockedBalance, MAIN_TOKEN, false, true))}`
            : `Lock total of ${amountToAsset(ecrv_for_max_boost, MAIN_TOKEN, false, true)}`

        return (
            <div className="info">
                {text} {MAIN_TOKEN} for max boost
            </div>
        )
    }

    return (
        <div id={`pool-${poolId}`} className="section stake-and-lock pool">
            <div className="section-header">
                <h3>{poolName} Gauge</h3>
                <div className="apy success">
                    {!_.isEmpty(activeUser) ? (
                        <>{hasStaked ? 'Your' : 'Base'} APY {(basePoolApy * boost).toFixed(2)}% | Max APY {maxPoolApy.toFixed(2)}%</>
                    ) : (
                        <>Max Liquidity Mining APY {maxPoolApy.toFixed(2)}%</>
                    )}
                </div>
            </div>
            <div className="boost-section">
                <div className="boost-info">
                    {!hasStaked && <div className="info">Stake {symbol} to start mining {MAIN_TOKEN}</div>}
                    {hasStaked && !hasLocked && !hasTempLock && <div className="info">Lock {MAIN_TOKEN} to boost liquidity mining</div>}
                    {hasStaked && hasTempLock && (
                        <div className="info">
                            <FontAwesomeIcon icon={faClock} />
                            Boost & "Your APY" are calculated with pending {hasTempStaked ? `Stake and ` : ''}Timelock
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