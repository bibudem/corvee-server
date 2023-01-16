// Inspired from : https://stackoverflow.com/a/48953209/3390182

export function getBoxShadowWidths(boxShadowValues) {
  const regEx = /(\d(?=(px|\s)))/g
  const widths = { top: 0, right: 0, bottom: 0, left: 0 }

  boxShadowValues.split(/\s*,\s*/).forEach(boxShadowValue => {
    const matches = []

    // box-shadow can have anywhere from 2-4 values, including horizontal offset, vertical offset, blur, and spread.
    // Below finds each one and pushes it into an array (regEx.exec when used in succession with a global regex will find each match.
    let match = regEx.exec(boxShadowValue)
    while (match != null) {
      matches.push(match[0])
      match = regEx.exec(boxShadowValue)
    }

    // default blur & spread to zero px if not found by the regex
    const [hOffset = 0, vOffset = 0, blur = 0, spread = 0] = matches.map(parseFloat)

    // calculate approximate widths by the distance taken up by each side of the box shadow after normalizing
    // the offsets with the spread and accounting for the added distance resulting from the blur
    // See https://msdn.microsoft.com/en-us/hh867550.aspx - "the blurring effect should approximate the
    // Gaussian blur with a standard deviation equal to HALF of the blur radius"
    const actualWidths = {
      top: spread - vOffset + 0.5 * blur,
      right: spread + hOffset + 0.5 * blur,
      bottom: spread + vOffset + 0.5 * blur,
      left: spread - hOffset + 0.5 * blur,
    }

    Object.keys(actualWidths).forEach(side => {
      widths[side] = Math.max(widths[side], actualWidths[side])
    })
  })

  return widths
}
