import React from 'react'
import _ from 'lodash'
import {useSelector} from "react-redux";
import numeral from 'numeral'
import classNames from 'classnames'
import TokenSymbol from "components/TokenSymbol";
import config from 'config'
import {poolECRVApySelector, poolFeesApySelector, poolInfoSelector} from 'modules/pools'
import './PoolInfo.scss'
import {maxDADApySelector} from "modules/ecrv";

const {POOLS} = config

const PoolInfo = ({poolId}) => {

    const poolBalances = useSelector(poolInfoSelector(poolId, 'balances'))
    const feesApy = useSelector(poolFeesApySelector(poolId))
    const {basePoolApy, maxPoolApy} = useSelector(poolECRVApySelector(poolId))
    const dadMaxApy = useSelector(maxDADApySelector)

    const sumBalances = !_.isEmpty(poolBalances) && _.sum(_.map(_.values(poolBalances), parseFloat))

    return (
        <div className={classNames("top-section pool-info")}>
            <div className="top-section-title">{POOLS[poolId].name}</div>
            <div className="top-section-content">
                <div className="pool-tokens">
                    {_.map(POOLS[poolId].tokens, symbol => {
                        const tokenAmount = _.get(poolBalances, symbol, 0)
                        const percentage = tokenAmount * 100 / sumBalances
                        return (
                            <div key={`pool-info-token-${symbol}`} className="token-info">
                                <TokenSymbol symbol={symbol}/>
                                <div>{numeral(tokenAmount).format('0,0.[000000]')}</div>
                                <div className="percentage">({!_.isNaN(percentage) ? percentage.toFixed(2) : '0'}%)</div>
                            </div>
                        )
                    })}
                    <div className="token-info">
                        <div>TVL (USDC + DAI + USDT)</div>
                        <div className="tvl">{numeral(sumBalances).format('0,0.[000000]')}</div>
                    </div>
                </div>
                <div className="pool-apy">
                    <div>
                        <div>Liquidity Mining APY</div>
                        <div className="apys">
                            <div className="apy-sbs">
                                <div className="text">Base</div>
                                <div className="num">{basePoolApy.toFixed(2)}%</div>
                            </div>
                            <div className="apy-sbs">
                                <div className="text">Max</div>
                                <div className="num">{maxPoolApy.toFixed(2)}%</div>
                            </div>
                        </div>
                    </div>
                    <div className="apy">DAD Locking Max APY {dadMaxApy.toFixed(2)}%</div>
                </div>
            </div>
        </div>
    );
}

export default PoolInfo
