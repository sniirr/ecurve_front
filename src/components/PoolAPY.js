import React, {useMemo} from 'react'
import _ from 'lodash'
import {useSelector} from "react-redux";
import {makePoolMiningApySelector} from "modules/pools";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowRight} from '@fortawesome/free-solid-svg-icons'

const PoolAPY = ({poolId, moreAPYs = []}) => {

    const poolMiningApySelector = useMemo(makePoolMiningApySelector(poolId), [poolId])

    const {basePoolApy, maxPoolApy} = useSelector(poolMiningApySelector)

    return (
        <div className="apys sbs">
            <div className="mining-apy">
                <div className="text">ECRV Mining</div>
                <div className="apy-sbs">
                    <div className="num">{basePoolApy.toFixed(2)}%</div>
                    <FontAwesomeIcon icon={faArrowRight}/>
                    <div className="num">{maxPoolApy.toFixed(2)}%</div>
                </div>
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