import React from 'react'
import {useSelector} from "react-redux";
import _ from "lodash";
import classNames from 'classnames'
import usePoolLoader from "hooks/usePoolLoader";
import './Pools.scss'
import config from 'config'
import PoolAPY from "components/PoolAPY";
import {poolTVLSelector} from "modules/pools";
import logo from 'images/ecurve-logo.png'
import defiboxLogo from 'images/defi-box.png'
import dadLogo from 'images/logo-dad.svg'
import numeral from 'numeral'
import {useHistory} from "react-router-dom"
import {maxDADApySelector} from "../../modules/ecrv";

const {POOLS} = config

const Pool = ({poolId, isEcurve}) => {
    let history = useHistory();
    const {name, tokens, lpTokenSymbol, pairId} = POOLS[poolId]
    const tvl = useSelector(poolTVLSelector(poolId))

    usePoolLoader(poolId)

    const onClick = () => {
        if (isEcurve) {
            history.push('/exchange')
        }
    }

    const onStakeClick = e => {
        e.preventDefault()
        e.stopPropagation()
        history.push(`/use-ecrv/#pool-${poolId}`)
    }

    return (
        <div className={classNames("pool-list-item", {'internal-pool': isEcurve})} onClick={onClick}>
            <div className="column col-info">
                <div className="pool-name">{name}</div>
                <div className="text-small">
                    {!_.isEmpty(tokens) ? _.join(tokens, '+') : lpTokenSymbol}
                </div>
            </div>
            <div className="column col-apy success">
                <PoolAPY poolId={poolId}/>
            </div>
            <div className="column col-tvl">{isEcurve ? numeral(tvl).format('0,0.[000000]$') : ''}</div>
            <div className="column col-actions">
                <div className="button small" onClick={onStakeClick}>Stake {lpTokenSymbol}</div>
                {!isEcurve && (
                    <div className="button small">
                        <a target="_blank" rel="noopener noreferrer"
                           href={`https://defibox.io/pool-market-details/${pairId}`}>
                            View on Defibox
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

const DADPool = ({poolId}) => {
    let history = useHistory();
    const {name, pairId} = POOLS[poolId]

    const dadMaxApy = useSelector(maxDADApySelector)

    const onLockClick = e => {
        e.preventDefault()
        e.stopPropagation()
        history.push(`/lock-dad`)
    }

    return (
        <div className={classNames("pool-list-item")}>
            <div className="column col-info">
                <div className="pool-name">{name}</div>
                <div className="text-small">DAD</div>
            </div>
            <div className="column col-apy success">
                <div className="apys">
                    <div className="apy-sbs">
                        <div className="text">Max</div>
                        <div className="num">{dadMaxApy.toFixed(2)}%</div>
                    </div>
                </div>
            </div>
            <div className="column col-tvl"/>
            <div className="column col-actions">
                <div className="button small" onClick={onLockClick}>Lock DAD</div>
                <div className="button small">
                    <a target="_blank" rel="noopener noreferrer"
                       href={`https://defibox.io/pool-market-details/${pairId}`}>
                        Buy DAD
                    </a>
                </div>
                <div className="button small">
                    <a target="_blank" rel="noopener noreferrer" href={`https://daddydao.io`}>
                        DAD Website
                    </a>
                </div>
            </div>
        </div>
    )
}

const GROUP_ORDER = ['eCurve', 'Defibox', 'DAD']

export const Pools = () => {

    const groups = _.groupBy(POOLS, p => p.operator || 'eCurve')

    const getGroupParams = groupName => {
        switch (groupName) {
            case 'eCurve':
                return [logo, groupName]
            case 'Defibox':
                return [defiboxLogo, groupName + ' LP Token']
            case 'DAD':
                return [dadLogo, groupName]
        }
    }

    return _.map(GROUP_ORDER, groupName => {
        const group = groups[groupName]
        const isEcurve = groupName === 'eCurve'
        const [groupLogo, groupTitle] = getGroupParams(groupName)
        return (
            <div className="section pools">
                <div className="section-header">
                    <img src={groupLogo} alt=""/>
                    <h3>{groupTitle} Pools</h3>
                </div>
                <div className="group-header">
                    <div className="column col-info"/>
                    <div className="column col-apy">
                        <div className="header-text">Pool APY</div>
                    </div>
                    <div className="column col-tvl">
                        <div className="header-text">{isEcurve ? 'TVL' : ''}</div>
                    </div>
                    <div className="column col-actions"/>
                </div>
                {_.map(group, ({id: poolId, name}) => {
                    return poolId === 'DADGOV' ? (
                        <DADPool poolId={poolId}/>
                    ) : (
                        <Pool key={`pool-list-item-${poolId}`} poolId={poolId} isEcurve={isEcurve}/>
                    )
                })}
            </div>
        )
    })
}

export default Pools