

export default {
  methods: {
    round(num, toRound) {
      while ((Math.floor(toRound) % num) !== 0) {
        toRound = Math.floor(toRound) - 1
      }
      return Math.floor(toRound)
    },
  },
}
