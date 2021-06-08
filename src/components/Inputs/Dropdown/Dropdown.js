import React, {useState, useRef} from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import './Dropdown.scss'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCaretDown, faCaretRight} from '@fortawesome/free-solid-svg-icons'
import useOnClickOutside from "hooks/useClickOutside"

const Dropdown = ({id, className, items, onItemClick, withCaret, children}) => {

    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useOnClickOutside(ref, () => setIsVisible(false))

    return (
        <div ref={ref} className={classNames('dropdown', className, {'is-visible': isVisible})} onClick={() => setIsVisible(!isVisible)}>
            <div>
                {children}
            </div>
            {withCaret && (<div className="caret">
                <FontAwesomeIcon icon={isVisible ? faCaretDown : faCaretRight}/>
            </div>)}
            <div className="dropdown-menu">
                {_.map(items, ({name, link, ...itemProps}, i) => {
                    const Item = (
                        <div key={`dropdown-menu-opt-${id}-${i}`}
                             className="dropdown-item"
                             onClick={() => _.isFunction(onItemClick) && onItemClick(itemProps)}
                             {...itemProps}>{name}</div>
                    )

                    return _.isEmpty(link) ? Item : (
                        <a href={link} target="_blank" rel="noopener noreferrer">{Item}</a>
                    )
                })}
            </div>
        </div>
    )
}

export default Dropdown
