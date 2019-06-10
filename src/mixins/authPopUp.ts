
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AuthPopUpMixin extends Vue {
  public passwordType: string = 'password'

  public togglePassword(): void {
    if (this.passwordType === 'password') {
      this.passwordType = 'text'
    } else {
      this.passwordType = 'password'
    }
  }

  public inputHasError(str: string | null, max: number): boolean {
    if (str !== null) {
      if (str.length === 0 || str.length > max) {
        return true
      }
    }
    return false
  }
}
