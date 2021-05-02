import React, {useEffect} from 'react'
import _ from 'lodash'
import {useDispatch, useSelector} from "react-redux";
import {ToastContainer} from 'react-toastify';
import {BrowserRouter as Router} from "react-router-dom"
import {selectedPoolSelector} from "store/uiReducer";
import {fetchPoolsConfig} from 'modules/ecrv'
import Header from 'layout/Header'
import Main from 'layout/Main'
import Footer from 'layout/Footer'
import 'rc-slider/assets/index.css';
import 'react-toastify/dist/ReactToastify.css'
import 'css/common.scss';
import 'components/Forms/Forms.scss';
import './App.scss';
import ApiSuspense from "components/Inputs/ApiSuspense";

function App({ual}) {

    const dispatch = useDispatch()

    const activeUser = useSelector(state => _.get(state, 'activeUser'))
    const poolId = useSelector(selectedPoolSelector)

    const accountName = ual?.activeUser?.accountName

    useEffect(() => {
        if (!_.isEmpty(accountName) && _.isEmpty(activeUser)) {
            dispatch({type: 'SET_ACTIVE_USER', payload: ual?.activeUser})
        }
    }, [accountName])

    useEffect(() => {
        dispatch(fetchPoolsConfig())
    }, [])

    const isLoggedIn = !_.isEmpty(accountName)

    return (
        <div className="App">
            <Header ual={ual}/>
            <div className="main-scroll">
                <Router>
                    <ApiSuspense apiKey="fetch-pools-config" withLoader={false} strict>
                        <Main ual={ual} poolId={poolId} isLoggedIn={isLoggedIn}/>
                        <Footer/>
                    </ApiSuspense>
                </Router>
            </div>
            <ToastContainer/>
        </div>
    );
}

export default App;
