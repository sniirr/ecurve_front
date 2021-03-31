import React from 'react'
import _ from 'lodash'
import {useSelector} from "react-redux";
import BeatLoader from "react-spinners/BeatLoader"
import classNames from 'classnames'

const Button = ({apiKey, className, children, disabled, onClick, ...props}) => {

    const isPending = useSelector(state => _.get(state.api, [apiKey, 'status'], '') === 'pending')

    return (
        <div className={classNames("button", className, {pending: isPending, disabled})} onClick={e => !disabled && !isPending && onClick(e)} {...props}>
            {isPending && (
                <div className="loading">
                    <BeatLoader className="test" color="#0c123a" loading css={{}} size={10} margin={1}/>
                </div>
            )}
            <span>{children}</span>
        </div>
    )
}

export default Button