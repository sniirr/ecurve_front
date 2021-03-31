import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension'

import rootReducer from './rootReducer';

// export const makeStore = () => createStore(rootReducer, applyMiddleware(thunk));
const logger = createLogger({
    predicate: (store, {type}) => {
        // console.log(action)
        return type !== 'SET_API_STATUS'
    }
})
export const makeStore = () => createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk, logger)));