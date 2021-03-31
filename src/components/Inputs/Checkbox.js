import React from 'react'
import classNames from "classnames";

function Checkbox({className, name, checked, onChange, children}) {

    return (
        <div className={classNames("input checkbox", className)}>
            <input type="checkbox" name={name} />
            <div className={classNames("cbx", {checked})} onClick={onChange}>
                <div className="cbx-left"/>
                <div className="cbx-right"/>
                {checked && <div className="cbx-checked"/>}
            </div>
            {children}
        </div>
    )
}

export default Checkbox
