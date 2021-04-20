import {
  ref,
  Ref,
  watch,
  reactive,
  nextTick,
  onMounted,
  onActivated,
  defineComponent,
  SetupContext,
} from 'vue'
import { extend } from '@vue/shared'

export default /*#__PURE__*/ defineComponent({
  name: 'ResizeSensor',
  props: {
    initial: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['resize'],
  setup(props, { emit }) {
    const rootRef = ref<HTMLElement | null>(null)
    const reset = useResizeSensorReset(rootRef)
    const update = useResizeSensorUpdate(rootRef, emit, reset)
    useResizeSensorLifecycle(rootRef, props, update, reset)
    return () => (
      <uni-resize-sensor ref={rootRef} onAnimationstart={update}>
        <div onScroll={update}>
          <div />
        </div>
        <div onScroll={update}>
          <div />
        </div>
      </uni-resize-sensor>
    )
  },
})

function useResizeSensorUpdate(
  rootRef: Ref<HTMLElement | null>,
  emit: SetupContext<['resize']>['emit'],
  reset: () => void
) {
  const size = reactive({ width: -1, height: -1 })
  watch(
    () => extend({}, size),
    (value: typeof size) => emit('resize', value)
  )
  return () => {
    const { offsetWidth, offsetHeight } = rootRef.value!
    size.width = offsetWidth
    size.height = offsetHeight
    reset()
  }
}

function useResizeSensorReset(rootRef: Ref<HTMLElement | null>) {
  return () => {
    const { firstElementChild, lastElementChild } = rootRef.value!
    firstElementChild!.scrollLeft = 100000
    firstElementChild!.scrollTop = 100000
    lastElementChild!.scrollLeft = 100000
    lastElementChild!.scrollTop = 100000
  }
}

function useResizeSensorLifecycle(
  rootRef: Ref<HTMLElement | null>,
  props: { initial: boolean },
  update: () => void,
  reset: () => void
) {
  onActivated(reset)
  onMounted(() => {
    if (props.initial) {
      nextTick(update)
    }
    const rootEl = rootRef.value!
    if (rootEl.offsetParent !== rootEl.parentElement) {
      rootEl.parentElement!.style.position = 'relative'
    }
    if (!('AnimationEvent' in window)) {
      reset()
    }
  })
}