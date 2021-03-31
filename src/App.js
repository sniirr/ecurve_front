import React, {useEffect} from 'react'
import _ from 'lodash'
import {useDispatch, useSelector} from "react-redux";
import {ToastContainer} from 'react-toastify';
import {BrowserRouter as Router} from "react-router-dom"
import Header from 'layout/Header'
import Main from 'layout/Main'
import Footer from 'layout/Footer'
import 'rc-slider/assets/index.css';
import 'react-toastify/dist/ReactToastify.css'
import 'css/common.scss';
import './App.scss';

function App({ual}) {

    const poolId = '3POOL'

    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))

    const accountName = ual?.activeUser?.accountName

    useEffect(() => {
        if (!_.isEmpty(accountName) && _.isEmpty(activeUser)) {
            dispatch({type: 'SET_ACTIVE_USER', payload: ual?.activeUser})
        }
    }, [accountName])

    const isLoggedIn = !_.isEmpty(accountName)

    return (
        <div className="App">
            <Header ual={ual}/>
            <div className="main-scroll">
                <Router>
                    <Main ual={ual} poolId={poolId} isLoggedIn={isLoggedIn}/>
                </Router>
                <Footer/>
            </div>
            <ToastContainer/>
        </div>
    );
}

export default App;
