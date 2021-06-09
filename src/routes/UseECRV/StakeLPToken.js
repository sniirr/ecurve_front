import React, {useState, useMemo} from 'react'
import StakeForm from 'components/Forms/StakeForm'
import UnstakeForm from 'components/Forms/UnstakeForm'
import {fetchStakedToken} from "modules/wallet"
import {useDispatch, useSelector} from "react-redux";
import _ from "lodash";
import useOnLogin from "hooks/useOnLogin";
import {makeBoostSelector} from "modules/boost";
import BoostGauge from 'components/BoostGauge'
import {getTempLockArgs} from "routes/UseECRV/UseECRV.reducer";
import {makePoolMiningApySelector, poolInfoSelector} from 'modules/pools'
import config from 'config'
import {fetchBalance, balanceSelector} from "modules/balances";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faClock} from "@fortawesome/free-regular-svg-icons";
import useLocking from "hooks/useLocking";
import usePoolLoader from "hooks/usePoolLoader";
import {amountToAsset} from "utils";

const {MAIN_TOKEN, TOKENS, POOLS} = config

const StakeLPToken = ({poolId}) => {

    const {lpTokenSymbol: symbol, name: poolName, operator} = POOLS[poolId]

    const dispatch = useDispatch()
    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const [poolTempStake, setPoolTempStake] = useState(0)

    const overrides = useSelector(getTempLockArgs)

    const boostSelector = useMemo(makeBoostSelector(poolId, {
        ...overrides,
        stakedAmount: poolTempStake
    }), [poolId, overrides, poolTempStake])
    const poolMiningApySelector = useMemo(makePoolMiningApySelector(poolId), [poolId])

    const {boost, ecrv_for_max_boost, stakeForMaxBoost} = useSelector(boostSelector)
    const {basePoolApy, maxPoolApy} = useSelector(poolMiningApySelector)

    const {lpTokenValue, price: lpTokenPrice} = useSelector(poolInfoSelector(poolId, 'stats'))

    const stakedBalance = useSelector(balanceSelector('staked', symbol))
    const {hasLocked, lockedBalance} = useLocking(MAIN_TOKEN)

    const [shouldReset, setShouldReset] = useState('')

    useOnLogin(() => {
        dispatch(fetchBalance(activeUser.accountName, TOKENS[symbol]))
        dispatch(fetchStakedToken(activeUser, symbol))
    })

    usePoolLoader(poolId)

    const onInputChange = addStake => value => {
        setShouldReset(addStake ? 'unstake' : 'stake')
        const fValue = parseFloat(value)
        setPoolTempStake(addStake ? fValue : (0 - fValue))

        setTimeout(() => setShouldReset(''), 0)
    }

    const hasTempStaked = poolTempStake !== 0

    const pendingStakedBalance = hasTempStaked ? (stakedBalance + poolTempStake) : stakedBalance
    const hasStaked = pendingStakedBalance > 0

    const hasTempLock = overrides.lockedBalance > 0 || overrides.lockTimeInHours > 0

    const renderPairSide = (i, balance) => amountToAsset(lpTokenValue[i].value * balance, lpTokenValue[i].symbol, true, true, 2)

    const renderMaxBoostText = () => {
        if (!hasStaked || ecrv_for_max_boost <= 0) return null

        const renderStakeText = () => {

            let balance = stakeForMaxBoost - (stakedBalance || 0)

            let temp = 'additional'
            let temp2 = 'keeping'
            if (balance < 0) {
                balance = stakeForMaxBoost
                temp = 'total of'
                temp2 = 'for'
            }

            switch (operator) {
                case 'Defibox':
                    if (_.isEmpty(lpTokenValue)) return null
                    return (
                        <>
                            Stake {temp}
                            <span className="current-stake">
                                {amountToAsset(balance, symbol, true, true)} ({renderPairSide(1, balance)} / {renderPairSide(0, balance)})
                            </span> {temp2} max boost
                        </>
                    )
                case 'Hegeos':
                    if (_.isEmpty(lpTokenValue)) return null
                    return `Stake ${temp} ${amountToAsset(balance, symbol, true, true)} (${renderPairSide(0, balance)}) ${temp2} max boost`
                default:
                    return `Stake ${temp} ${amountToAsset(balance, symbol, true, true)} ${temp2} max boost`
            }
        }

        const text = lockedBalance > 0 && ecrv_for_max_boost > lockedBalance
            ? `Lock additional ${(amountToAsset(ecrv_for_max_boost - lockedBalance, MAIN_TOKEN, false, true))} ${MAIN_TOKEN} for max boost`
            : renderStakeText()

        return (
            <div className="info">{text}</div>
        )
    }

    const renderCurrentStake = () => {
        if (stakedBalance <= 0) return null

        let value = ''
        if (operator === 'Defibox' && !_.isEmpty(lpTokenValue)) {
            value = `${renderPairSide(1, stakedBalance)} / ${renderPairSide(0, stakedBalance)}`
        }
        else if (operator === 'Hegeos' && !_.isEmpty(lpTokenValue)) {
            value = renderPairSide(0, stakedBalance)
        }
        else {
            value = `${amountToAsset(stakedBalance * lpTokenPrice, symbol, false, true, 2)} $`
        }

        return (
            <div className="info">
                Liquidity Value:
                <span className="current-stake">{value}</span>
            </div>
        )
    }

    return (
        <div id={`pool-${poolId}`} className="section stake-and-lock pool">
            <div className="section-header">
                <h3>{poolName} Gauge</h3>
                <div className="apy success">
                    {!_.isEmpty(activeUser) ? (
                        <>{hasStaked ? 'Your' : 'Base'} APY {(basePoolApy * boost).toFixed(2)}% | Max
                            APY {maxPoolApy.toFixed(2)}%</>
                    ) : (
                        <>Max Liquidity Mining APY {maxPoolApy.toFixed(2)}%</>
                    )}
                </div>
            </div>
            <div className="boost-section">
                <div className="boost-info">
                    {renderCurrentStake()}
                    {!hasStaked && <div className="info">Stake {symbol} to start mining {MAIN_TOKEN}</div>}
                    {hasStaked && !hasLocked && !hasTempLock &&
                    <div className="info">Lock {MAIN_TOKEN} to boost liquidity mining</div>}
                    {renderMaxBoostText()}
                    {hasStaked && hasTempLock && (
                        <div className="info warning">
                            <FontAwesomeIcon icon={faClock}/>
                            Boost & "Your APY" are calculated with pending {hasTempStaked ? `Stake and ` : ''}Timelock
                        </div>
                    )}
                </div>
                <BoostGauge disabled={!hasStaked} boost={boost}/>
            </div>
            <div className="stake-unstake">
                <StakeForm symbol={symbol} onChange={onInputChange(true)} onSuccess={() => setPoolTempStake(0)}
                           shouldReset={shouldReset === 'stake'}/>
                <UnstakeForm symbol={symbol} onChange={onInputChange(false)} onSuccess={() => setPoolTempStake(0)}
                             shouldReset={shouldReset === 'unstake'}/>
            </div>
        </div>
    );
}

export default StakeLPToken