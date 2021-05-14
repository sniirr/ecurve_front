import React, {useMemo} from 'react'
import _ from 'lodash'
import {useSelector} from "react-redux";
import {makePoolMiningApySelector} from "modules/pools";

const PoolAPY = ({poolId, moreAPYs = []}) => {

    const poolMiningApySelector = useMemo(makePoolMiningApySelector(poolId), [poolId])

    const {basePoolApy, maxPoolApy} = useSelector(poolMiningApySelector)

    return (
        <div className="apys sbs">
            <div className="apy-sbs">
                <div className="text">Base LP</div>
                <div className="num">{basePoolApy.toFixed(2)}%</div>
            </div>
            <div className="apy-sbs">
                <div className="text">Max LP</div>
                <div className="num">{maxPoolApy.toFixed(2)}%</div>
            </div>
            {_.map(moreAPYs, ({text, value}, i) => (
                <div key={`more-apy-${i}`} className="apy-sbs">
                    <div className="text">{text}</div>
                    <div className="num">{value.toFixed(2)}%</div>
                </div>
            ))}
        </div>
    )
}

export default PoolAPY