import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createI18n } from 'vue-i18n'
import Aura from '@primeuix/themes/aura'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Tooltip from 'primevue/tooltip'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import ToggleButton from 'primevue/togglebutton'
import SelectButton from 'primevue/selectbutton'

import 'primeicons/primeicons.css'
import './styles/variables.css'
import './styles/theme-dark.css'
import './styles/theme-light.css'
import './styles/glassmorphism.css'
import App from './App.vue'

// Import i18n messages
import zhTW from './i18n/zh-TW.json'
import en from './i18n/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    'en': en
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(i18n)
app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.theme-dark',
      cssLayer: false
    }
  }
})

// Global Component Registration
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Dialog', Dialog)
app.component('Message', Message)
app.component('Toast', Toast)
app.component('Tag', Tag)
app.component('ProgressBar', ProgressBar)
app.component('ToggleButton', ToggleButton)
app.component('SelectButton', SelectButton)
app.directive('tooltip', Tooltip)

app.mount('#app')
