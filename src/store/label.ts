
import { Label } from '@/interfaces/app'

interface States {
  labels: Label[] | undefined
}

export default {
  namespaced: true,
  state: {
    labels: undefined,
  } as States,
}
