module.exports = {
  handleError(err) {
    console.log(err)
  },
  getPreferedLang(req, langs) {
    if (req.cookies.lang !== undefined)
      return req.cookies.lang
    
    let acc = req.acceptsLanguages()
    let length = acc.length
    for (let i=0;i<length;i++)
      if (langs.includes(acc[i]))
        return acc[i]
    return 'en'
  },
  parseLangToFileName(lang) {
    let str = ''
    let len = lang.length
    for (let i=0;i<len;i++)
      if (lang[i] === '-')
        str += '_'
      else str += lang[i]
    return str
  },
  getRenderObject(req) {
    this.hasSavedLang(req)
    return {
      theme: req.cookies.theme,
      lang: this.parseLangToFileName(this.getPreferedLang(req, ['en', 'pt-BR']))
    }
  }
}
