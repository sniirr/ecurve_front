import React, {useMemo} from 'react'
import _ from 'lodash'
import {useDispatch, useSelector} from "react-redux";
import numeral from 'numeral'
import classNames from 'classnames'
import TokenSymbol from "components/TokenSymbol";
import config from 'config'
import {poolFeesApySelector, poolInfoSelector, makePoolTVLSelector} from 'modules/pools'
import './PoolInfo.scss'
import PoolAPY, {LPFeesAPY} from 'components/PoolAPY'
import {selectPool} from "store/uiReducer";
import Dropdown from 'components/Inputs/Dropdown'

const {POOLS} = config

const PoolSelect = ({poolId}) => {

    const dispatch = useDispatch()

    const pools = _.map(
        _.filter(POOLS, p => p.operator === 'eCurve' && p.id !== poolId),
        p => _.pick(p, ['id', 'name'])
    )

    return (
        <Dropdown id="pools-select" withCaret={true} items={pools}
                  onItemClick={({id}) => dispatch(selectPool(id))}>
            More pools
        </Dropdown>
    )
}

const PoolInfo = ({poolId}) => {

    const {name: poolName, tokens} = POOLS[poolId]
    const poolBalances = useSelector(poolInfoSelector(poolId, 'balances'))
    const {volume: dailyVolume, lpFeesApy} = useSelector(poolFeesApySelector(poolId))

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
                            <div className="num">{numeral(tvl).format('0.00a')}</div>
                        </div>
                        <div>
                            <div className="text-small">24H Volume</div>
                            <div className="num">
                                {numeral(dailyVolume).format('0.00a')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pool-apy">
                    <div>
                        <div className="text-small yield-title">
                            <span>Annualized Yields</span>
                        </div>
                        <PoolAPY poolId={poolId}/>
                    </div>
                    <div className="fees-apy sbs">
                        <LPFeesAPY value={lpFeesApy} poolId={poolId}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PoolInfo
