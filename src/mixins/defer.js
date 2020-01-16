
export default function (watchViewName = false, count = 10) {
  const watch = {}
  if (watchViewName)
    watch['viewName'] = function() {
      this.displayPriority = 0
      this.runDisplayPriority()
    }
  
  return {
    data() {
      return {
        displayPriority: 0,
      }
    },
    mounted() {
      this.runDisplayPriority()
    },
    methods: {
      runDisplayPriority() {
        const step = () => {
          requestAnimationFrame(() => {
            this.displayPriority++
            if (this.displayPriority < count)
              step()
          })
        }
        step()
      },
      defer(priority) {
        return this.displayPriority >= priority 
      },
    },
    watch,
  }
}
