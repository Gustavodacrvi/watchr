
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component
export default class AuthPopUpMixin extends Vue {
  @Getter('isDesktop') isDesktop!: boolean
  passwordType: string = 'password'

  public togglePassword() {
    if (this.passwordType === 'password')
      this.passwordType = 'text'
    else
      this.passwordType = 'password'
  }

  inputHasError(str: string | null, max: number): boolean {
    if (str !== null)
      if (str.length === 0 || str.length > max)
        return true
    return false
  }
}
