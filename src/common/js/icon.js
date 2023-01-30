export class Icon {
  #$
  constructor(svg) {
    this.#$ = {}
    this.title = undefined

    const svgAttributes = /<svg([^>]+)>/i.exec(svg)[1]
    const reAttributes = new RegExp('[\\s\\r\\t\\n]*([a-z0-9\\-_]+)[\\s\\r\\t\\n]*=[\\s\\r\\t\\n]*([\'"])((?:\\\\\\2|(?!\\2).)*)\\2', 'ig')
    let match
    while ((match = reAttributes.exec(svgAttributes))) {
      this.#$[match[1]] = match[3]
    }

    this.content = /<svg[^>]+>([\s\S]+)<\/svg>/i.exec(svg)[1]
  }

  setAttribute(attr, value) {
    this.#$[attr] = value
  }

  removeAttribute(name) {
    Reflect.deleteProperty(this.#$, name)
  }

  get svg() {
    return `<svg ${Object.entries(this.#$)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')}>${this.title ? `<title>${this.title}</title>` : ``}${this.content}</svg>`
  }
}
