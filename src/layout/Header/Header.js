import React from 'react'
import _ from 'lodash'
import {getTestTokens} from "modules/wallet";
import {useDispatch, useSelector} from "react-redux";
import logo from 'images/ecurve-logo.png'
import './Header.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars} from '@fortawesome/free-solid-svg-icons'
import config from 'config'
import Dropdown from "components/Inputs/Dropdown";

const {ENVIRONMENT} = config

function Header({ual}) {

    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const isLoggedIn = !_.isEmpty(activeUser?.accountName)

    const renderNetMarker = () => {
        if (ENVIRONMENT === 'production') return null
        return (
            <div className="net-marker">KYLIN TESTNET</div>
        )
    }

    const logout = () => {
        ual.logout()
        dispatch({type: 'RESET_STATE'})
    }

    const menuItems = [{link: 'https://dappaccountdao.gitbook.io/dappaccountdao/ecurve', name: 'About'}]
    if (isLoggedIn) {
        menuItems.push({name: 'Logout', onClick: logout})
    }

    return (
        <header>
            <div className="logo">
                <img src={logo} alt="eCurve"/>
                <span className="logo-inner">e</span>Curve
            </div>
            <div className="account">
                {isLoggedIn ? (
                    <>
                        {ENVIRONMENT !== 'production' && <div className="link" onClick={() => dispatch(getTestTokens(activeUser))}>Get test tokens</div>}
                        <div className="username">{activeUser.accountName}</div>
                        {renderNetMarker()}
                    </>
                ) : (
                    <>
                        <div className="login" onClick={ual.showModal}>Login</div>
                        {renderNetMarker()}
                    </>
                )}
                <div className="header-menu">
                    <Dropdown id="header-menu" items={menuItems}>
                        <FontAwesomeIcon icon={faBars}/>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}

export default Header
