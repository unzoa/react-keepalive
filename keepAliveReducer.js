import * as aliveTypes from './aliveTypes'

export default function keepAliveReducer (comps, action) {
  const { type, payload: { cacheId, reactElement, reactElementDom } } = action

  switch (type) {
    case aliveTypes.DESTROY:
      // 目前没有
      break;

    case aliveTypes.CREATECACHE:
      return {
        ...comps,
        [cacheId]: {
          cacheId,
          reactElement,
          alive: type
        }
      }

    case aliveTypes.SAVENODES:
      return {
        ...comps,
        [cacheId]: {
          ...comps[cacheId],
          reactElementDom,
          alive: type
        }
      }

    default:
      return comps
  }
}
