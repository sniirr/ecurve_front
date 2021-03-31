import React from 'react'
import _ from 'lodash'
import Exchange from 'routes/Exchange'
import Deposit from 'routes/Deposit'
import Withdraw from 'routes/Withdraw'
import {NavLink} from "react-router-dom"
import './Menu.scss'
import config from 'config'

const {MAIN_TOKEN, DAD_TOKEN} = config

const MENU_ITEMS = [
    {text: 'Exchange', path: '/'},
    {text: 'Deposit', path: '/deposit'},
    {text: 'Withdraw', path: '/withdraw'},
    {text: `Use ${MAIN_TOKEN}`, path: '/use-ecrv'},
    {text: `Lock ${DAD_TOKEN}`, path: '/lock-dad'},
]

const Menu = () => (
    <div className="menu">
        <div className="menu-left">
            {_.map(_.take(MENU_ITEMS, 3), ({text, path}, i) => (
                <div key={`menu-item-${_.kebabCase(text)}`} className="menu-item">
                    <NavLink to={path} exact>{text}</NavLink>
                </div>
            ))}
        </div>
        <div className="menu-right">
            {_.map(_.takeRight(MENU_ITEMS, 2), ({text, path}, i) => (
                <div key={`menu-item-${_.kebabCase(text)}`} className="menu-item">
                    <NavLink to={path} exact>{text}</NavLink>
                </div>
            ))}
            <div className="menu-item get-dad">
                <div className="button fancy">
                    <a target="_blank" rel="noopener noreferrer" href="https://defibox.io/pool-market-details/588">Get DAD</a>
                </div>
            </div>
        </div>
    </div>
)

export default Menu
