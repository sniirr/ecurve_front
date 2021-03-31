import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTelegramPlane} from '@fortawesome/free-brands-svg-icons'
import './Footer.scss';

const Footer = () => (
    <div className="footer">
        <div className="left">
            eCurve is developed by the <a target="_blank" rel="noopener noreferrer"
                                          href="https://daddydao.io">DappAccountDAO</a>
        </div>
        <div className="center">
            <a href="https://t.me/dad_ecurve" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTelegramPlane}/> eCurve
            </a>
            <a href="https://t.me/DAD_Token" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTelegramPlane}/> DAD
            </a>
        </div>
        <div className="right">
            {/*<span className="node-conn good">*/}
            {/*    <FontAwesomeIcon icon={faWifi}/> Canada*/}
            {/*</span>*/}
        </div>
    </div>
)

export default Footer
