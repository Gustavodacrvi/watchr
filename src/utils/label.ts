
export default {
  getArrFromPath(path: string, ignoreLastTwoDots: boolean = true): string[] {
    if (ignoreLastTwoDots && path.slice(-1) === ':') {
      path = path.slice(0, path.length - 1)
    }
    return path.split(':').filter((el: string) => el !== '')
  },
}
