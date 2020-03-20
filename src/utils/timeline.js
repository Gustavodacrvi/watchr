
import mom from 'moment'

export default {
  convertOffsetToMin(offset, height) {
    return offset * 1440 / height
  },
  convertMinToOffset(min, height) {
    return height * min / 1440
  },
  formatMin(min, autoTimeStyleFormat = true) {
    return mom(`${Math.floor(min / 60)}-${min % 60}`, 'HH:mm').format(
      autoTimeStyleFormat ? this.format : 'HH:mm',
    )
  },
  getFullMin(str) {
    const split = str.split(':')
    return (parseInt(split[0], 10) * 60) + parseInt(split[1], 10)
  },
}
