import React from 'react';
import ReactDOM from 'react-dom';
import App from 'layout/App';
import reportWebVitals from './reportWebVitals';
import {Provider} from 'react-redux';
import {makeStore} from 'store';
import {UALProvider, withUAL} from 'ual-reactjs-renderer'
// import {Scatter} from 'ual-scatter'
import {Anchor} from 'ual-anchor'
// import {TokenPocket} from 'ual-token-pocket'
import config from "config"
const {CHAIN} = config

// const scatter = new Scatter([CHAIN], {appName: 'ecurve'})
const anchor = new Anchor([CHAIN], {appName: 'ecurve'})
// const tokenPocket = new TokenPocket([CHAIN], {appName: 'ecurve'})

const store = makeStore()

const UALConsumer = withUAL(App)

ReactDOM.render(
    <Provider store={store}>
        <React.StrictMode>
            <UALProvider chains={[CHAIN]} authenticators={[anchor]} appName={'ecurve'}>
                <UALConsumer/>
            </UALProvider>
        </React.StrictMode>
    </Provider>,
    document.getElementById('root')
)
;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
