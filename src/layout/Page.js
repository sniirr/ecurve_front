import React from 'react'
import usePageLoader from "hooks/usePageLoader"

const Page = ({children}) => {
    const poolId = '3POOL'
    usePageLoader(poolId)

    return children
}

export default Page
