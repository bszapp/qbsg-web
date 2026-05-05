import { ref, computed } from 'vue'

// 模块级单例，AppLayout 和 Gujian.vue 共享同一份状态
const groups = ref([])
const searchQuery = ref('')
const activeProvider = ref(null)
const activeSize = ref(null)

const SIZE_BADGE = { '2.13H': 'size-213h', '2.13': 'size-213', '2.9': 'size-29', '4.2': 'size-42' }
const SIZE_TAG = { '2.13H': 'stag-213h', '2.13': 'stag-213', '2.9': 'stag-29', '4.2': 'stag-42' }

const allProviders = computed(() => {
    const s = new Set()
    groups.value.forEach(g => g.provider && s.add(g.provider))
    return [...s]
})

const allSizes = computed(() => {
    const s = new Set()
    groups.value.forEach(g => g.firmwares?.forEach(fw => fw.screen_size && s.add(fw.screen_size)))
    return [...s].sort()
})

const filteredGroups = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    return groups.value
        .filter(g => !activeProvider.value || g.provider === activeProvider.value)
        .map(g => {
            let fws = g.firmwares ?? []
            if (activeSize.value) fws = fws.filter(fw => fw.screen_size === activeSize.value)
            if (q) fws = fws.filter(fw =>
                (fw.name ?? '').toLowerCase().includes(q) ||
                (fw.firmware_id ?? '').toLowerCase().includes(q)
            )
            return { ...g, firmwares: fws }
        })
        .filter(g => g.firmwares.length > 0)
})

function toggleProvider(p) { activeProvider.value = activeProvider.value === p ? null : p }
function toggleSize(s) { activeSize.value = activeSize.value === s ? null : s }
function sizeClass(s) { return SIZE_BADGE[s] || 'size-213' }
function sizeTagClass(s) { return SIZE_TAG[s] || '' }

export function useGujianFilter() {
    return {
        groups,
        searchQuery,
        activeProvider,
        activeSize,
        allProviders,
        allSizes,
        filteredGroups,
        toggleProvider,
        toggleSize,
        sizeClass,
        sizeTagClass,
    }
}