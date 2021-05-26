import React from 'react'
import ReactTooltip from "react-tooltip"

export default props => (
    <ReactTooltip className="tooltip" effect="solid" delayHide={250} delayShow={250} {...props}/>
)
