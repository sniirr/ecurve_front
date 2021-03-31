import React, {useState} from 'react'
import _ from 'lodash'
import Checkbox from "components/Inputs/Checkbox";

function SlippageInput({slippage, setSlippage, options = ['0.1', '1']}) {

    const [customSlippage, setCustomSlippage] = useState(false)

    const onOptCheckChange = value => {
        setSlippage(value)
        setCustomSlippage(false)
    }

    return (
        <div className="slippage">
            <span className="arrow-left"/>Max Slippage
            {_.map(options, (value, i) => (
                <Checkbox key={`slippage-opt-${i}`} className="cbx-inline" name="slippage" checked={slippage === value}
                          onChange={() => onOptCheckChange(value)}>{value}%</Checkbox>
            ))}
            <Checkbox className="cbx-inline" name="slippage" checked={customSlippage} onChange={() => {
                setSlippage('3.0')
                setCustomSlippage(true)
            }}>
                <input type="text" className="input-small" value={customSlippage ? slippage : ''}
                       onChange={e => setSlippage(e.target.value)}/>%
            </Checkbox>
        </div>
    );
}

export default SlippageInput
