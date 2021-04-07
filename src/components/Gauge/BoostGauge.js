import React from 'react'
import GaugeChart from 'react-gauge-chart'
import './Gauge.scss'

const colors = ['#dc6868', '#dcb668', '#74a274']
const disabledColors = ['#464a4f', '#464a4f', '#464a4f']

const BoostGauge = ({boost, disabled}) => {

    let boostToShow = disabled ? 1 : boost
    const percent = (boostToShow - 1) / 1.5
    // console.log('COMP BOOST', boost, 'percent', percent)

    return (
        <div className="gauge">
            <GaugeChart colors={!disabled ? colors : disabledColors} arcWidth={0.15} arcPadding={0.08} animDelay={0}
                        percent={percent} formatTextValue={() => 'x' + boostToShow}/>
        </div>
    )
}

export default BoostGauge