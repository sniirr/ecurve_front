import React, {useMemo} from 'react'
import _ from 'lodash'
import {useSelector} from "react-redux";
import {makePoolMiningApySelector} from "modules/pools";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowRight} from '@fortawesome/free-solid-svg-icons'
import Tooltip from "components/Tooltip";

export const AdminFeesAPY = ({value, title}) => (
    <>
        <div data-tip data-for="admin-fees-apy">
            <div className="text-small">{title || "vECRV"}</div>
            <div className="num">{value.toFixed(2)}%</div>
        </div>
        <Tooltip id="admin-fees-apy">
            <h4>Admin fees APY (vECRV)</h4>
            - 50% of system fees are distributed to ECRV lockers <br/>based on their vECRV power.
            <br/>
            <br/>
            - vECRV = locked ECRV amount * lock time / max lock time
            <br/>
            <br/>
            - Admin fees are claimable in the "Use ECRV" tab
        </Tooltip>
    </>
)

export const LPFeesAPY = ({poolId, value}) => {
    const id = `lp-fees-apy-${poolId}`
    return (
        <>
            <div data-tip data-for={id}>
                <div className="text-small">LP Fees</div>
                <div className="num">{value.toFixed(2)}%</div>
            </div>
            <Tooltip id={id}>
                <h4>LP fees APY</h4>
                - 50% of system fees are distributed to liquidity <br/>providers based on their share of the pool.
                <br/>
                <br/>
                - LP fees are automatically added to the liquidity <br/>pool and reflected in {poolId} price
            </Tooltip>
        </>
    )
}

export const DADLockingAPY = ({value}) => (
    <>
        <div data-tip data-for="dad-locking-apy">
            <div className="text-small">DAD Locking Max APY</div>
            <div className="num">{value.toFixed(2)}%</div>
        </div>
        <Tooltip id="dad-locking-apy">
            <h4>DAD Locking APY</h4>
            - Each round 15% of minted ECRV is distributed to long-term DAD stakeholders
            <br/>
            <br/>
            - DAD can be locked up to 1 year, distribution is based on the amount of <br/>locked DAD and the remaining lock time
        </Tooltip>
    </>
)

const PoolAPY = ({poolId, moreAPYs = []}) => {

    const poolMiningApySelector = useMemo(makePoolMiningApySelector(poolId), [poolId])

    const {basePoolApy, maxPoolApy} = useSelector(poolMiningApySelector)

    return (
        <div className="apys sbs">
            <div className="mining-apy" data-tip data-for="ecrv-mining-apy">
                <div className="text">ECRV Mining</div>
                <div className="apy-sbs">
                    <div className="num">{basePoolApy.toFixed(2)}%</div>
                    <FontAwesomeIcon icon={faArrowRight}/>
                    <div className="num">{maxPoolApy.toFixed(2)}%</div>
                </div>
            </div>
            {_.map(moreAPYs, (APYComp, i) => (
                <>
                    <div className="separator"> + </div>
                    {APYComp}
                </>
            ))}
            <Tooltip id="ecrv-mining-apy">
                <h4>ECRV Mining APY</h4>
                - Mine ECRV by providing liquidity.
                <br/>
                <br/>
                - ECRV mining can be boosted up to x2.5 by locking ECRV in the "Use ECRV" tab.
                <br/>
                <br/>
                - Mined ECRV is claimable in the "Use ECRV" tab
            </Tooltip>
        </div>
    )
}

export default PoolAPY