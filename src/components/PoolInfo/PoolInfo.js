import React, {useState, useRef} from 'react'
import _ from 'lodash'
import {useDispatch, useSelector} from "react-redux";
import numeral from 'numeral'
import classNames from 'classnames'
import TokenSymbol from "components/TokenSymbol";
import config from 'config'
import {poolFeesApySelector, poolInfoSelector, poolTVLSelector} from 'modules/pools'
import './PoolInfo.scss'
import PoolAPY from 'components/PoolAPY'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCaretDown} from '@fortawesome/free-solid-svg-icons'
import {selectPool} from "store/uiReducer";
import useOnClickOutside from "hooks/useClickOutside";

const {POOLS} = config

const PoolSelect = ({poolId}) => {

    const {name: poolName} = POOLS[poolId]

    const dispatch = useDispatch()
    const ref = useRef(null)
    const [menuVisible, setMenuVisible] = useState(false)

    useOnClickOutside(ref, () => setMenuVisible(false))

    const pools = _.filter(POOLS, p => p.operator === 'eCurve' && p.id !== poolId)

    return (
        <div className={classNames("pool-title", {'menu-visible': menuVisible})} onClick={() => setMenuVisible(!menuVisible)}>
            <span className="pool-name">{poolName}</span>
            <FontAwesomeIcon icon={faCaretDown}/>
            <div className="pool-select" ref={ref}>
                {_.map(pools, ({id, name}) => (
                    <div key={`pool-select-opt-${id}`} className="item" onClick={() => dispatch(selectPool(id))}>{name}</div>
                ))}
            </div>
        </div>
    )
}

const PoolInfo = ({poolId}) => {

    const {tokens} = POOLS[poolId]
    const poolBalances = useSelector(poolInfoSelector(poolId, 'balances'))
    const feesApy = useSelector(poolFeesApySelector(poolId))
    const tvl = useSelector(poolTVLSelector(poolId))

    return (
        <div className={classNames("top-section pool-info")}>
            <div className="top-section-title">
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
                    <div className="token-info pool-tvl">
                        <div>TVL ({_.join(tokens, ' + ')})</div>
                        <div className="tvl">{numeral(tvl).format('0,0.[000000]')}</div>
                    </div>
                </div>
                <div className="pool-apy">
                    <div>
                        <div>Liquidity Mining APY</div>
                        <PoolAPY poolId={poolId}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PoolInfo
