import { useCallback, useReducer } from 'react'
import keepAliveContext from './keepAliveContext';
import keepAliveReducer from './keepAliveReducer'
import * as aliveTypes from './aliveTypes'

export default function KeepAliveProvider (props) {
  const [comps, dispatch] = useReducer(keepAliveReducer, {})

  const createEvent = useCallback(
    ({ cacheId, reactElement }) => {
      const comp = comps[cacheId]
      if (comp) {
        // 组件销毁，目前没有走这里
        if (comp.alive === aliveTypes.DESTROY) { }
      } else {
        dispatch({
          type: aliveTypes.CREATECACHE,
          payload: { cacheId, reactElement }
        })
      }
    },
    [comps]
  )

  return (
    <keepAliveContext.Provider value={{ createEvent, comps }}>
      { props.children }
      {
        Object.values(comps)
          .filter( ({ alive }) => alive !== aliveTypes.DESTROY )
          .map( ({ cacheId, reactElement, reactElementDom }) => {
            return <div
              id={`cache_${cacheId}`}
              key={cacheId}
              ref={cacheDom => {
                if ( cacheDom && !reactElementDom ) {
                  const childNodes = Array.from(cacheDom.childNodes)

                  dispatch({
                    type: aliveTypes.SAVENODES,
                    payload: { cacheId, reactElementDom: childNodes }
                  })
                }
              }}
              >
              { reactElement }
            </div>
          } )
      }
    </keepAliveContext.Provider>
  )
}
