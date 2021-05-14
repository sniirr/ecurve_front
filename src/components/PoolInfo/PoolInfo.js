import React, {useState, useRef, useMemo} from 'react'
import _ from 'lodash'
import {useDispatch, useSelector} from "react-redux";
import numeral from 'numeral'
import classNames from 'classnames'
import TokenSymbol from "components/TokenSymbol";
import config from 'config'
import {poolFeesApySelector, poolInfoSelector, makePoolTVLSelector} from 'modules/pools'
import './PoolInfo.scss'
import PoolAPY from 'components/PoolAPY'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCaretDown, faCaretRight} from '@fortawesome/free-solid-svg-icons'
import {selectPool} from "store/uiReducer";
import useOnClickOutside from "hooks/useClickOutside";

const {POOLS} = config

const PoolSelect = ({poolId}) => {

    const dispatch = useDispatch()
    const ref = useRef(null)
    const [menuVisible, setMenuVisible] = useState(false)

    useOnClickOutside(ref, () => setMenuVisible(false))

    const pools = _.filter(POOLS, p => p.operator === 'eCurve' && p.id !== poolId)

    return (
        <div ref={ref} className={classNames("pool-title", {'menu-visible': menuVisible})} onClick={() => setMenuVisible(!menuVisible)}>
            <div>More pools</div>
            <div className="caret">
                <FontAwesomeIcon icon={menuVisible ? faCaretDown : faCaretRight}/>
            </div>
            <div className="pool-select">
                {_.map(pools, ({id, name}) => (
                    <div key={`pool-select-opt-${id}`} className="item" onClick={() => dispatch(selectPool(id))}>{name}</div>
                ))}
            </div>
        </div>
    )
}

const PoolInfo = ({poolId}) => {

    const {name: poolName, tokens} = POOLS[poolId]
    const poolBalances = useSelector(poolInfoSelector(poolId, 'balances'))
    const {apy: feesApy, volume: dailyVolume} = useSelector(poolFeesApySelector(poolId))
    //  FEES APY {feesApy.toFixed(2)}%

    const poolTvlSelector = useMemo(makePoolTVLSelector(poolId), [poolId])
    const tvl = useSelector(poolTvlSelector)

    return (
        <div className={classNames("top-section pool-info")}>
            <div className="top-section-title">
                <div className="pool-name">{poolName}</div>
                <PoolSelect poolId={poolId}/>
            </div>
            <div className="top-section-content">
                <div className="pool-tokens">
                    <div className="token-balances">
                        {_.map(tokens, symbol => {
                            const tokenAmount = _.get(poolBalances, symbol, 0)
                            const percentage = tokenAmount * 100 / tvl
                            return (
                                <div key={`pool-info-token-${symbol}`} className="token-info">
                                    <TokenSymbol symbol={symbol}/>
                                    <div>{numeral(tokenAmount).format('0,0.[000000]')}</div>
                                    <div className="percentage">({!_.isNaN(percentage) ? percentage.toFixed(2) : '0'}%)</div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="token-info pool-tvl sbs">
                        <div>
                            <div className="text-small" title='Total value locked'>TVL</div>
                            <div className="num">{numeral(tvl).format('0,0.[000000]')}</div>
                        </div>
                        <div>
                            <div className="text-small">24H Volume</div>
                            <div className="num">
                                {numeral(dailyVolume).format('0.0a')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pool-apy">
                    <div>
                        <div className="text-small">Liquidity Mining APY</div>
                        <PoolAPY poolId={poolId}/>
                    </div>
                    <div className="fees-apy sbs">
                        <div>
                            <div className="text-small">vECRV APY</div>
                            <div className="num">{feesApy.toFixed(2)}%</div>
                        </div>
                        <div>
                            {/*<div className="text-small">LP FEES APY</div>*/}
                            {/*<div className="num">{feesApy.toFixed(2)}%</div>*/}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PoolInfo
