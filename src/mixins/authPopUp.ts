
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component
export default class AuthPopUpMixin extends Vue {
  @Getter('isDesktop') public readonly isDesktop!: boolean
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
