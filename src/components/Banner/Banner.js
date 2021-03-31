import React from 'react'
import classNames from 'classnames'
import './Banner.scss'

const Banner = ({className, children}) => {

    return (
        <div className={classNames("section banner", className)}>
            <div className="abs-center">
                {children}
            </div>
        </div>
    )
}

export default Banner
