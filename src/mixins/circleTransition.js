export default {
  data() {
    return {
      innerColor: 'rgba(53, 73, 90, 0.6)',
      outerColor: 'var(--primary)',
      left: 0,
      top: 0,
      doingTransition: false,
      showCircle: false,
      isTouching: false,
    }
  },
  methods: {
    touchStart() {

    },
    clickTrans(evt) {
      this.innerColor = 'rgba(53, 73, 90, 0.6)'
      this.outerColor = 'var(--primary)'
      this.left = (evt.offsetX + 35) + 'px'
      this.top = (evt.offsetY + 0) + 'px'
      this.showCircle = true
    },
    touchEnd() {

    },
    circleEnter(e) {

    },
  }
}