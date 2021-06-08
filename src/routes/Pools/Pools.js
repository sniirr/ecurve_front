import React, {useMemo} from 'react'
import {useDispatch, useSelector} from "react-redux";
import _ from "lodash";
import classNames from 'classnames'
import usePoolLoader from "hooks/usePoolLoader";
import './Pools.scss'
import config from 'config'
import PoolAPY, {DADLockingAPY, LPFeesAPY} from "components/PoolAPY";
import {makePoolTVLSelector, poolFeesApySelector} from "modules/pools";
import logo from 'images/ecurve-logo.png'
import defiboxLogo from 'images/defi-box.png'
import dadLogo from 'images/logo-dad.svg'
import numeral from 'numeral'
import {useHistory} from "react-router-dom"
import {maxDADApySelector} from "modules/ecrv";
import {selectPool} from "store/uiReducer";

const {POOLS} = config

const Pool = ({poolId, isEcurve, isNew, button = {}}) => {

    const dispatch = useDispatch()
    let history = useHistory();
    const {name, tokens, lpTokenSymbol, pairId} = POOLS[poolId]

    const poolTvlSelector = useMemo(makePoolTVLSelector(poolId), [poolId])
    const tvl = useSelector(poolTvlSelector)
    const {lpFeesApy, volume: dailyVolume} = useSelector(poolFeesApySelector(poolId))

    usePoolLoader(poolId)

    const onClick = () => {
        if (isEcurve) {
            dispatch(selectPool(poolId))
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
                <div className="pool-name">
                    {name}
                    {isNew && <div className="new-pool">NEW</div>}
                </div>
                <div className="text-small">
                    {!_.isEmpty(tokens) ? _.join(tokens, '+') : lpTokenSymbol}
                </div>
            </div>
            <div className="column col-apy success">
                <PoolAPY poolId={poolId} moreAPYs={isEcurve ? [<LPFeesAPY poolId={poolId} value={lpFeesApy}/>] : []}/>
            </div>
            {isEcurve && (
                <>
                    <div className="column col-tvl">{isEcurve ? numeral(tvl).format('0.00a') : ''}</div>
                    <div className="column col-volume">{isEcurve ? numeral(dailyVolume).format('0.00a') : ''}</div>
                </>
            )}

            <div className="column col-actions">
                <div className="button small" onClick={onStakeClick}>Stake {lpTokenSymbol}</div>
                {!_.isEmpty(button) && (
                    <div className="button small">
                        <a target="_blank" rel="noopener noreferrer" href={button.href}>
                            {button.text}
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

    const {maxApy} = useSelector(maxDADApySelector)

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
                    <DADLockingAPY value={maxApy}/>
                </div>
            </div>
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

const GROUP_ORDER = ['eCurve', 'DAD', 'Defibox']

export const Pools = () => {

    const groups = _.groupBy(POOLS, p => {
        if (p.operator === 'Hegeos') return 'DAD'
        return p.operator || 'eCurve'
    })

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
                    {isEcurve && (
                      <>
                          <div className="column col-tvl">
                              <div className="header-text">{isEcurve ? 'TVL' : ''}</div>
                          </div>
                          <div className="column col-volume">
                              <div className="header-text">{isEcurve ? '24H Volume' : ''}</div>
                          </div>
                      </>
                    )}
                    <div className="column col-actions"/>
                </div>
                {_.map(group, ({id: poolId, operator, isNew, pairId}) => {
                    const key = `pool-item-${poolId}`
                    if (poolId === 'DADGOV') return (
                        <DADPool key={key} poolId={poolId}/>
                    )

                    let button = {}
                    if (operator === 'Defibox') {
                        button = {
                            href: `https://defibox.io/pool-market-details/${pairId}`,
                            text: 'View on Defibox'
                        }
                    }
                    else if (poolId === POOLS.EHEGIC.id) {
                        button = {
                            href: `https://hegeos.io`,
                            text: 'View on Hegeos'
                        }
                    }

                    return (
                        <Pool key={key} poolId={poolId} isEcurve={isEcurve} isNew={isNew} button={button}/>
                    )
                })}
            </div>
        )
    })
}

export default Pools