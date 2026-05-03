<template>
    <div v-if="isVisible && isValid" class="confetti-container" :style="`--floor-height: ${stageHeight}px;`">
        <div v-for="{ color, degree } in particles" :key="degree" class="particle" :ref="el => setItemRef(el, degree)">
            <div :style="`--bgcolor: ${color};`"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
    particleCount: { type: Number, default: 150 },
    particleSize: { type: Number, default: 12 },
    duration: { type: Number, default: 3500 },
    colors: { type: Array, default: () => ['#FFC700', '#FF0000', '#2E3191', '#41BBC7'] },
    force: { type: Number, default: 0.5 },
    stageHeight: { type: Number, default: 800 },
    stageWidth: { type: Number, default: 1600 },
    shouldDestroyAfterDone: { type: Boolean, default: true },
})

// ---- 常量（照抄原始编译代码中的 o 和 s）----
const ROTATION_DUR_MIN = 200   // o = 200
const BEZIER_Y3 = 0.5   // s = 0.5（同时用作 y1 的随机范围）

// ---- 旋转向量表（照抄原始 g 数组，v = [0,0,1] 是最后一项）----
const ROTATION_VECTORS = [[1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 1]]
const REF_VECTOR = [0, 0, 1]  // v

// ---- 工具函数（照抄原始编译代码）----
function round(value, precision = 2) {
    return Math.round((value + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision)
}

// mapRange：线性插值，照抄 h 函数
function mapRange(value, fromMin, fromMax, toMin, toMax) {
    return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin
}

// addDegrees：度数相加，超出360则减去，照抄 f 函数
function addDegrees(a, b) {
    const r = a + b
    return r > 360 ? r - 360 : r
}

// coinFlip：照抄 c 函数
function coinFlip() {
    return Math.random() > 0.5
}

// arraysEqual：照抄原始匿名相等判断
function arraysEqual(a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
}

// ---- 状态 ----
const isVisible = ref(true)

// ---- 粒子生成（照抄原始 u 函数）----
const particles = computed(() => {
    const degreeIncrement = 360 / props.particleCount
    return Array.from({ length: props.particleCount }, (_, n) => ({
        color: props.colors[n % props.colors.length],
        degree: n * degreeIncrement,
    }))
})

// ---- 参数校验（照抄原始 i 计算属性逻辑）----
const isValid = computed(() => {
    const isSafeInt = Number.isSafeInteger
    const isUndef = v => v === undefined

    if (!isUndef(props.particleCount) && isSafeInt(props.particleCount) && props.particleCount < 0) return false
    if (!isUndef(props.duration) && isSafeInt(props.duration) && props.duration < 0) return false
    if (!isUndef(props.colors) && !Array.isArray(props.colors)) return false
    if (!isUndef(props.particleSize) && isSafeInt(props.particleSize) && props.particleSize < 0) return false
    if (!isUndef(props.force) && isSafeInt(props.force) && (props.force < 0 || props.force > 1)) return false
    if (!isUndef(props.stageHeight) && typeof props.stageHeight === 'number' && isSafeInt(props.stageHeight) && props.stageHeight < 0) return false
    if (!isUndef(props.stageWidth) && typeof props.stageWidth === 'number' && isSafeInt(props.stageWidth) && props.stageWidth < 0) return false
    return true
})

// ---- 粒子初始化（照抄原始 setItemRef 内部匿名函数，逐行对应）----
function setItemRef(el, degree) {
    if (el == null) return

    // n = degree
    // a = x 落点（照抄：mapRange(|addDegrees(n,90)-180|, 0,180, -stageWidth/2, stageWidth/2)）
    const xLandingPoint = mapRange(
        Math.abs(addDegrees(degree, 90) - 180),
        0, 180,
        -props.stageWidth / 2, props.stageWidth / 2
    )

    // i = 旋转持续时间（照抄：600 * random + 200）
    const rotationDuration = 600 * Math.random() + ROTATION_DUR_MIN

    // u = 旋转向量下标（照抄：round(random*(len-1))）
    const rotVecIdx = Math.round(Math.random() * (ROTATION_VECTORS.length - 1))

    // l = chaos 持续时间（照抄：duration - round(1000*random)）
    const chaosDuration = props.duration - Math.round(1000 * Math.random())

    // p = 是否 wobble（影响 x 方向贝塞尔）（照抄：random < 0.1）
    const isWobble = Math.random() < 0.1

    // m = 是否圆形（影响尺寸和 border-radius）
    // 照抄：(!arraysEqual(g[u], v)) && coinFlip()
    const isRound = (!arraysEqual(ROTATION_VECTORS[rotVecIdx], REF_VECTOR)) && coinFlip()

    // x 方向贝塞尔（照抄 y, E, w, C）
    const x1 = isWobble ? round(0.3 * Math.random(), 2) : 0
    const x2 = -1 * x1
    const x3 = x1
    const x4 = round(Math.abs(mapRange(Math.abs(addDegrees(degree, 90) - 180), 0, 180, -1, 1)), 4)

    // y 方向贝塞尔（照抄 M, R, b, S）
    const y1 = round(Math.random() * BEZIER_Y3, 4)
    const y2 = round(Math.random() * props.force * (coinFlip() ? 1 : -1), 4)
    const y3 = BEZIER_Y3   // = 0.5 (b = s)
    const y4 = round(Math.max(mapRange(Math.abs(degree - 180), 0, 180, props.force, -props.force), 0), 4)

    // 尺寸（照抄 --width / --height / --border-radius 判断）
    // m ? particleSize : round(4*random) + particleSize/2
    const width = isRound ? props.particleSize : Math.round(4 * Math.random()) + props.particleSize / 2
    // m ? particleSize : round(2*random) + particleSize
    const height = isRound ? props.particleSize : Math.round(2 * Math.random()) + props.particleSize

    // 写入 CSS 变量（照抄 N 函数调用顺序）
    const N = (name, val) => el.style.setProperty(name, val + '')
    N('--x-landing-point', `${xLandingPoint}px`)
    N('--duration-chaos', `${chaosDuration}ms`)
    N('--x1', x1)
    N('--x2', x2)
    N('--x3', x3)
    N('--x4', x4)
    N('--y1', y1)
    N('--y2', y2)
    N('--y3', y3)
    N('--y4', y4)
    N('--width', `${width}px`)
    N('--height', `${height}px`)
    N('--rotation', ROTATION_VECTORS[rotVecIdx].join())
    N('--rotation-duration', `${rotationDuration}ms`)
    N('--border-radius', isRound ? '50%' : '0')
}

// ---- 生命周期：duration 后自动销毁（照抄原始 onMounted async）----
onMounted(async () => {
    await new Promise(resolve => setTimeout(resolve, props.duration))
    if (props.shouldDestroyAfterDone) {
        isVisible.value = false
    }
})
</script>

<style scoped>
/* 照抄原始编译代码中注入的 CSS，keyframe 名去掉 scope 后缀 */

@keyframes ce-y-axis {
    to {
        transform: translate3d(0, var(--floor-height), 0);
    }
}

@keyframes ce-x-axis {
    to {
        transform: translate3d(var(--x-landing-point), 0, 0);
    }
}

@keyframes ce-rotation {
    to {
        transform: rotate3d(var(--rotation), 360deg);
    }
}

.confetti-container {
    width: 0;
    height: 0;
    overflow: visible;
    position: relative;
    transform: translate3d(var(--x, 0), var(--y, 0), 0);
    z-index: 1200;
}

.confetti-container>.particle {
    animation: ce-x-axis var(--duration-chaos) forwards cubic-bezier(var(--x1), var(--x2), var(--x3), var(--x4));
}

.confetti-container>.particle div {
    position: absolute;
    top: 0;
    left: 0;
    animation: ce-y-axis var(--duration-chaos) forwards cubic-bezier(var(--y1), var(--y2), var(--y3), var(--y4));
    width: var(--width);
    height: var(--height);
}

.confetti-container>.particle div::before {
    display: block;
    height: 100%;
    width: 100%;
    content: '';
    background-color: var(--bgcolor);
    animation: ce-rotation var(--rotation-duration) infinite linear;
    border-radius: var(--border-radius);
}
</style>