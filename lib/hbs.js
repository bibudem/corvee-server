import { create as _create } from 'express-handlebars'
import frontmatter from 'front-matter'
import { extend } from 'underscore'

export function create(options) {
  const hbs = _create(options)

  hbs._compileTemplate = function (template, options) {
    const content = frontmatter(template)
    const compiled = this.handlebars.compile(content.body, options)
    compiled._attributes = content.attributes
    return compiled
  }

  hbs._precompileTemplate = function (template, options) {
    const content = frontmatter(template)
    const compiled = this.handlebars.compile(content.body, options)
    compiled._attributes = content.attributes
    return compiled
  }

  hbs._renderTemplate = function (template, context) {
    context = extend(context, template._attributes)
    return template(context, options)
  }
  return hbs
}
