// import {useEffect} from 'react'
// import {useDispatch, useSelector} from "react-redux";
// import {fetchPoolFeeStats} from "modules/pools";
// import {fetchTokenPrices} from 'modules/prices'
// import {fetchBoostData} from "modules/boost";
// import {fetchDADStats} from "modules/dad";
// import {selectedPoolSelector} from "store/uiReducer";
//
// function usePageLoader() {
//
//     const dispatch = useDispatch()
//     const poolId = useSelector(selectedPoolSelector)
//
//     useEffect(() => {
//         if (!_.isEmpty(poolId)) {
//             dispatch(fetchPoolFeeStats(poolId))
//         }
//         dispatch(fetchTokenPrices())
//         dispatch(fetchBoostData())
//         dispatch(fetchDADStats())
//     }, [])
// }
//
// export default usePageLoader
