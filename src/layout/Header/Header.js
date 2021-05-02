import React from 'react'
import _ from 'lodash'
import {getTestTokens} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import logo from 'images/ecurve-logo.png'
import './Header.scss';
import config from 'config'

const {ENVIRONMENT} = config

function Header({ual}) {

    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const isLoggedIn = !_.isEmpty(activeUser?.accountName)

    const renderNetMarker = () => {
        if (ENVIRONMENT === 'production') return (
            <div className="net-marker">EOS MAINNET</div>
        )
        return (
            <div className="net-marker">KYLIN TESTNET</div>
        )
    }

    return (
        <header>
            <div className="logo">
                <img src={logo} alt="eCurve"/>
                <span className="logo-inner">e</span>Curve
            </div>
            {isLoggedIn ? (
                <div className="account">
                    {ENVIRONMENT !== 'production' && <div className="link" onClick={() => dispatch(getTestTokens(activeUser))}>Get test tokens</div>}
                    <div className="username">{activeUser.accountName}</div>
                    <div className="logout" onClick={() => {
                        ual.logout()
                        dispatch({type: 'RESET_STATE'})
                    }}>Logout
                    </div>
                    {renderNetMarker()}
                </div>
            ) : (
                <div className="account">
                    <div className="login" onClick={ual.showModal}>Login</div>
                    {renderNetMarker()}
                </div>
            )}
        </header>
    );
}

export default Header
