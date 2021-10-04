class Transformer {
  constructor (upstreamRecord, onTransform) {
    this._upstreamRecord = upstreamRecord
    this._onTransform = onTransform
  }

  transform (downstreamRecord) {
    if (this._onTransform) {
      this._onTransform.call(this._upstreamRecord, downstreamRecord, this._upstreamRecord)
    }
  }
}

module.exports = Transformer
