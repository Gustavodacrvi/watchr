export interface Alert {
  name: string
  duration: number
  type: 'error' | 'normal' | 'success' | 'fail' | 'warning'
}
