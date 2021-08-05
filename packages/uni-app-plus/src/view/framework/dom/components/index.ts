import { ComponentPublicInstance, defineComponent, h } from 'vue'
import { UniComment } from '../elements/UniComment'
import { UniTextElement } from '../elements/UniTextElement'
import { UniTextNode } from '../elements/UniTextNode'
import { UniViewElement } from '../elements/UniViewElement'
import { UniAd } from './UniAd'
import { UniAudio } from './UniAudio'
import { UniButton } from './UniButton'
import { UniCamera } from './UniCamera'
import { UniCanvas } from './UniCanvas'
import { UniCheckbox } from './UniCheckbox'
import { UniCheckboxGroup } from './UniCheckboxGroup'
import { UniCoverImage } from './UniCoverImage'
import { UniCoverView } from './UniCoverView'
import { UniEditor } from './UniEditor'
import { UniForm } from './UniForm'
import { UniFunctionalPageNavigator } from './UniFunctionalPageNavigator'
import { UniIcon } from './UniIcon'
import { UniImage } from './UniImage'
import { UniInput } from './UniInput'
import { UniLabel } from './UniLabel'
import { UniLivePlayer } from './UniLivePlayer'
import { UniLivePusher } from './UniLivePusher'
import { UniMap } from './UniMap'
import { UniMovableArea } from './UniMovableArea'
import { UniMovableView } from './UniMovableView'
import { UniNavigator } from './UniNavigator'
import { UniOfficialAccount } from './UniOfficialAccount'
import { UniOpenData } from './UniOpenData'
import { UniPicker } from './UniPicker'
import { UniPickerView } from './UniPickerView'
import { UniPickerViewColumn } from './UniPickerViewColumn'
import { UniProgress } from './UniProgress'
import { UniRadio } from './UniRadio'
import { UniRadioGroup } from './UniRadioGroup'
import { UniRichText } from './UniRichText'
import { UniScrollView } from './UniScrollView'
import { UniSlider } from './UniSlider'
import { UniSwiper } from './UniSwiper'
import { UniSwiperItem } from './UniSwiperItem'
import { UniSwitch } from './UniSwitch'
import { UniTextarea } from './UniTextarea'
import { UniVideo } from './UniVideo'
import { UniWebView } from './UniWebView'

export interface UniCustomElement extends Element {
  __id: number
  __vueParentComponent: ComponentPublicInstance
  __listeners: Record<string, (evt: Event) => void>
}

export const BuiltInComponents = {
  '#text': UniTextNode,
  '#comment': UniComment,
  VIEW: UniViewElement,
  IMAGE: UniImage,
  TEXT: UniTextElement,
  NAVIGATOR: UniNavigator,
  FORM: UniForm,
  BUTTON: UniButton,
  INPUT: UniInput,
  LABEL: UniLabel,
  RADIO: UniRadio,
  CHECKBOX: UniCheckbox,
  'CHECKBOX-GROUP': UniCheckboxGroup,
  AD: UniAd,
  AUDIO: UniAudio,
  CAMERA: UniCamera,
  CANVAS: UniCanvas,
  'COVER-IMAGE': UniCoverImage,
  'COVER-VIEW': UniCoverView,
  EDITOR: UniEditor,
  'FUNCTIONAL-PAGE-NAVIGATOR': UniFunctionalPageNavigator,
  ICON: UniIcon,
  'RADIO-GROUP': UniRadioGroup,
  'LIVE-PLAYER': UniLivePlayer,
  'LIVE-PUSHER': UniLivePusher,
  MAP: UniMap,
  'MOVABLE-AREA': UniMovableArea,
  'MOVABLE-VIEW': UniMovableView,
  'OFFICIAL-ACCOUNT': UniOfficialAccount,
  'OPEN-DATA': UniOpenData,
  PICKER: UniPicker,
  'PICKER-VIEW': UniPickerView,
  'PICKER-VIEW-COLUMN': UniPickerViewColumn,
  PROGRESS: UniProgress,
  'RICH-TEXT': UniRichText,
  'SCROLL-VIEW': UniScrollView,
  SLIDER: UniSlider,
  SWIPER: UniSwiper,
  'SWIPER-ITEM': UniSwiperItem,
  SWITCH: UniSwitch,
  TEXTAREA: UniTextarea,
  VIDEO: UniVideo,
  'WEB-VIEW': UniWebView,
} as const

export type WrapperComponent = ReturnType<typeof createWrapper>

export function createWrapper(
  component: ReturnType<typeof defineComponent>,
  props: Record<string, any>
) {
  return () => h(component, props)
}