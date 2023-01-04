import './cv-report-widget.js'

export class ReportWidget {
  constructor(element, report) {
    this._element = element
    this._originalTarget = this._element.target

    this._widget = document.createElement('cv-report-widget')
    this._widget.setAttribute('report-id', report._id)
    this._widget.setAttribute('action', report.action)
    if (this._element.nodeName === 'IMG') {
      this._widget.linkType = this._element.nodeName
    }
    this._widget.report = report

    this._element.setAttribute('target', '_visualisation')
    this._element.dataset.cvReportWidget = ''
    this._element.replaceWith(this._widget)
    this._widget.append(this._element)
  }

  dispose() {
    this._widget.dispose()
    delete this._element.dataset.cvReportWidget
    this._originalTarget ? this._element.setAttribute('target', this._originalTarget) : this._element.removeAttribute('target')
    this._widget.replaceWith(this._element)
  }
}
