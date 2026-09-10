import { useRef, useState, useCallback, useEffect } from 'react'

interface DragPos {
  x: number
  y: number
}

export function useDraggable() {
  const [pos, setPos] = useState<DragPos>({ x: 0, y: 0 })
  const dragRef = useRef({
    dragging: false,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
  })
  const posRef = useRef(pos)

  useEffect(() => {
    posRef.current = pos
  }, [pos])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const d = dragRef.current
    d.dragging = true
    d.sx = e.clientX
    d.sy = e.clientY
    d.ox = posRef.current.x
    d.oy = posRef.current.y

    const onMouseMove = (ev: MouseEvent) => {
      if (!d.dragging) return
      setPos({
        x: d.ox + (ev.clientX - d.sx),
        y: d.oy + (ev.clientY - d.sy),
      })
    }

    const onMouseUp = () => {
      d.dragging = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [])

  const getDragDistance = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  return { pos, onMouseDown, getDragDistance }
}
