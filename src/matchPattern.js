const {
  equals,
  hasVertex,
  getSymmetries,
  getBoardSymmetries
} = require('./helper')

module.exports = function*(data, anchor, pattern) {
  let height = data.length
  let width = data.length === 0 ? 0 : data[0].length
  if (!hasVertex(anchor, width, height)) return
  if (pattern.size != null && (width !== height || width !== +pattern.size))
    return

  let [x, y] = anchor
  let sign = data[y][x]
  if (sign === 0) return

  let equalsVertex = equals(anchor)

  for (let [[ax, ay], as] of pattern.anchors || []) {
    if (
      pattern.type === 'corner' &&
      !getBoardSymmetries([ax, ay], width, height).some(equalsVertex)
    )
      continue

    // Hypothesize [x, y] === [ax, ay]

    let hypotheses = Array(8).fill(true)

    for (let [[vx, vy], vs] of pattern.vertices) {
      let diff = [vx - ax, vy - ay]
      let symm = getSymmetries(diff)

      for (let k = 0; k < symm.length; k++) {
        if (!hypotheses[k]) continue
        let [wx, wy] = [x + symm[k][0], y + symm[k][1]]

        if (
          !hasVertex([wx, wy], width, height) ||
          data[wy][wx] !== vs * sign * as
        ) {
          hypotheses[k] = false
        }
      }

      if (!hypotheses.includes(true)) break
    }

    for (let i = 0; i < hypotheses.length; i++) {
      if (!hypotheses[i]) continue

      let transform = ([vx, vy]) =>
        getSymmetries([vx - ax, vy - ay])[i].map((d, j) => anchor[j] + d)

      yield {
        symmetryIndex: i,
        invert: sign !== as,
        anchors: pattern.anchors.map(([vertex, _]) => transform(vertex)),
        vertices: pattern.vertices.map(([vertex, _]) => transform(vertex))
      }
    }
  }
}
