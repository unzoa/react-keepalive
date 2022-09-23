import { useContext, useRef, useEffect } from "react";
import keepAliveContext from "./keepAliveContext";

export default function withKeepAlive (
  OldComponent,
  { cacheId, scroll = false }
) {
  return function (props) {
    const ref = useRef(null);
    const { createEvent, comps } = useContext(keepAliveContext)

    useEffect(() => {
      // 存储路由滚动高度
      const saveScrollTop = () => {
        const top = document.body.scrollTop || document.documentElement.scrollTop
        // 切换页面时依然会走一遍top=0，然后才移除监听， 所以这里处理不存储top=0
        top && (localStorage[cacheId] = top)
      }

      document.addEventListener('scroll', saveScrollTop)
      return () => {
        document.removeEventListener('scroll', saveScrollTop)
      }
    }, [comps])

    useEffect(() => {
      const currComp = comps[cacheId]

      if (currComp && currComp.reactElementDom) {
        // 从cacheId节点移动了所有子节点到这里
        currComp.reactElementDom.forEach(dom => ref.current.appendChild(dom) )

        // 删除缓存的父级节点 cacheDom
        const cacheDom = document.querySelector(`#cache_${currComp.cacheId}`)
        if (cacheDom) {
          cacheDom.parentNode.removeChild(cacheDom)
        }

        if (scroll) {
          // 滚动到保存的位置
          const y = 1 * localStorage[cacheId]
          document.scrollTo
            ? document.scrollTo(0, y)
            : window.scrollTo(0, y)
        }
      } else {
        createEvent({
          cacheId,
          reactElement: <OldComponent {...props} />
        })
      }
    }, [comps, createEvent, props]);

    return <div id={`keepalive_${cacheId}`} ref={ref} />;
  };
}
