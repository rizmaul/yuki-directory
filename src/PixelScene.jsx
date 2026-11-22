import { useEffect, useRef } from 'react'

const baseWidth = 240
const baseHeight = 212
const ink = '#111111'
const paper = '#f7f7f7'

const cat = [
  '....#......#....',
  '....##....##....',
  '....########....',
  '...##########...',
  '...##.####.##...',
  '...##########...',
  '....########....',
  '.....######.....',
  '.....########...',
  '....##########..',
  '....##########..',
  '....###....###..',
]

const stars = Array.from({ length: 105 }, (_, i) => [
  (i * 67 + i * i * 13) % baseWidth,
  (i * 17 + i * i * 7) % 100,
])

const mountains = [
  [0, 83, 51, 44, 112, 103, 159, 61, 221, 98, 240, 77],
  [0, 102, 28, 79, 75, 111, 139, 91, 182, 114, 211, 87, 240, 108],
]

const trees = [[5, 19], [12, 27], [22, 15], [28, 20], [202, 15], [214, 23], [224, 32], [233, 23]]

function drawRidge(ctx, points, color, horizontalScale, elevationScale) {
  for (let i = 0; i < points.length - 2; i += 2) {
    const [start, y, end, nextY] = points.slice(i, i + 4)
    const x = Math.round(start * horizontalScale)
    const nextX = Math.round(end * horizontalScale)
    for (let col = x; col < nextX; col++) {
      const elevation = 119 - (y + (nextY - y) * (col - x) / (nextX - x))
      const top = 119 - Math.round(elevation * elevationScale)
      ctx.fillStyle = color
      ctx.fillRect(col, top, 1, 120 - top)
      ctx.fillStyle = '#909090'
      ctx.fillRect(col, top, 1, 1)
    }
  }
}

function drawScene(ctx, time, x, target, lift, pointer, reducedMotion) {
  const { width, height } = ctx.canvas
  const horizontalScale = width / baseWidth
  const horizon = Math.round(height * 0.7)
  const offset = horizon - 119
  const waterDepth = height - horizon
  const elevationScale = Math.min(1, horizon / 105)
  const moonX = Math.round(167 * horizontalScale)
  const moonY = Math.max(32, 19 - offset)
  ctx.fillStyle = ink
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.translate(0, offset)

  stars.forEach(([sx, sy], i) => {
    ctx.fillStyle = (i + Math.floor(time / 550)) % 7 === 0 ? paper : '#696969'
    ctx.fillRect(Math.floor(sx * horizontalScale), Math.floor(sy * (horizon - 19) / 100) - offset, 1, 1)
  })

  // Draw the moon in horizontal pixel steps.
  for (let dy = -15; dy <= 15; dy++) {
    const half = Math.floor(Math.sqrt(225 - dy * dy))
    ctx.fillStyle = paper
    ctx.fillRect(moonX - half, moonY + dy, half * 2 + 1, 1)
    if (dy > 2 && dy % 3 === 0) {
      ctx.fillStyle = '#a2a2a2'
      ctx.fillRect(moonX, moonY + dy, half, 1)
    }
  }

  drawRidge(ctx, mountains[0], '#292929', horizontalScale, elevationScale)
  drawRidge(ctx, mountains[1], '#191919', horizontalScale, elevationScale)

  ctx.fillStyle = '#080808'
  for (const [position, treeHeight] of trees) {
    const treeX = Math.round(position * horizontalScale)
    for (let row = 0; row < treeHeight - 3; row++) {
      const tier = Math.floor(row / 5)
      const spread = tier + row % 5
      ctx.fillRect(treeX - spread, 119 - treeHeight + row, spread * 2 + 1, 1)
    }
    ctx.fillRect(treeX - 1, 115, 3, 4)
  }

  const rippleCount = Math.round(47 * horizontalScale)
  for (let i = 0; i < rippleCount; i++) {
    const drift = reducedMotion ? 0 : Math.floor(time / (140 + i * 7))
    const lineX = (i * 37 + drift) % (width - 15)
    ctx.fillStyle = i % 5 === 0 ? '#b2b2b2' : '#525252'
    ctx.fillRect(lineX, 119 + (i * 11) % waterDepth, 3 + (i * 7) % 12, 1)
  }

  for (let i = 0; i < 9; i++) {
    const shimmer = reducedMotion ? 0 : Math.floor(time / 200 + i) % 4
    const length = 4 + i * 2
    ctx.fillStyle = i % 3 === 0 ? '#b2b2b2' : '#707070'
    const reflectionY = 124 + Math.round(i * Math.min(3, (waterDepth - 6) / 9))
    ctx.fillRect(moonX - Math.floor(length / 2) + shimmer - 2, reflectionY, length, 1)
  }

  ctx.fillStyle = '#333333'
  ctx.fillRect(0, 120, width, 4)
  ctx.fillStyle = paper
  ctx.fillRect(0, 119, width, 1)

  if (pointer) {
    const { x: px, y: py } = pointer
    ctx.fillRect(px - 3, py - offset, 7, 1)
    ctx.fillRect(px, py - offset - 3, 1, 7)
  }

  const moving = Math.abs(target - x) > 1
  const bob = reducedMotion ? 0 : moving ? Math.floor(time / 85) % 2 : Math.floor(time / 480) % 2
  const originX = Math.round(x) - 8
  const originY = 107 - lift - bob
  const facing = target < x ? -1 : 1

  ctx.fillStyle = paper
  cat.forEach((row, y) => {
    for (let col = 0; col < row.length; col++) {
      if (row[col] === '#') {
        ctx.fillRect(originX + (facing < 0 ? row.length - 1 - col : col), originY + y, 1, 1)
      }
    }
  })
  const tailX = originX + (facing < 0 ? 2 : 13)
  ctx.fillRect(tailX, originY + 9, 4, 1)
  ctx.fillRect(tailX + (facing < 0 ? 0 : 3), originY + 6 + bob, 1, 3 - bob)
  ctx.restore()
}

export default function PixelScene() {
  const canvas = useRef(null)
  const scene = useRef({ x: 119, target: 119, pointer: null, jumpTime: null })

  useEffect(() => {
    const element = canvas.current
    const context = element.getContext('2d')
    if (!context) return
    const resize = new ResizeObserver(([entry]) => {
      const { width: displayWidth, height: displayHeight } = entry.contentRect
      if (displayWidth > 0 && displayHeight > 0) {
        const pixelSize = Math.min(displayWidth / baseWidth, displayHeight / 100)
        const width = Math.round(displayWidth / pixelSize)
        const height = Math.round(displayHeight / pixelSize)
        if (width === element.width && height === element.height) return

        const state = scene.current
        const widthRatio = width / element.width
        state.x = Math.max(16, Math.min(width - 16, state.x * widthRatio))
        state.target = Math.max(16, Math.min(width - 16, state.target * widthRatio))
        state.pointer = null
        element.width = width
        element.height = height
      }
    })
    resize.observe(element)

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame
    let previousTime

    function animate(time) {
      const state = scene.current
      const elapsed = Math.min(time - (previousTime ?? time), 50)
      previousTime = time
      state.x += (state.target - state.x) * (motion.matches ? 1 : 1 - Math.exp(-elapsed / 125))

      const jumpProgress = state.jumpTime === null ? 1 : Math.max(0, Math.min(1, (time - state.jumpTime) / 510))
      const lift = motion.matches
        ? (jumpProgress < 0.5 ? 12 : 0)
        : Math.round(Math.sin(jumpProgress * Math.PI) * 23)
      drawScene(context, motion.matches ? 0 : time, state.x, state.target, lift, state.pointer, motion.matches)
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => {
      resize.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  function followPointer(event) {
    const element = canvas.current
    const bounds = element.getBoundingClientRect()
    const { width, height } = element
    const x = Math.round((event.clientX - bounds.left) / bounds.width * width)
    const y = Math.round((event.clientY - bounds.top) / bounds.height * height)
    scene.current.pointer = { x, y }
    scene.current.target = Math.max(16, Math.min(width - 16, x))
  }

  return (
    <figure className="scene">
      <button
        className="scene-control"
        aria-label="Pixel cat at a moonlit lake. Use the arrow keys to move the cat, or activate to make it jump."
        onPointerMove={followPointer}
        onPointerLeave={() => { scene.current.pointer = null }}
        onClick={(event) => {
          if (event.detail > 0) followPointer(event)
          scene.current.jumpTime = performance.now()
        }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          event.preventDefault()
          const step = event.key === 'ArrowLeft' ? -20 : 20
          scene.current.target = Math.max(16, Math.min(canvas.current.width - 16, scene.current.target + step))
        }}
      >
        <canvas ref={canvas} width={baseWidth} height={baseHeight} aria-hidden="true" />
      </button>
    </figure>
  )
}
