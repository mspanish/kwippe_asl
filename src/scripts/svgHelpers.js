import { pathBounds } from './pather.js';

const TAU = Math.PI * 2

const mapToEllipse = ({ x, y }, rx, ry, cosphi, sinphi, centerx, centery) => {
  x *= rx
  y *= ry

  const xp = cosphi * x - sinphi * y
  const yp = sinphi * x + cosphi * y

  return {
    x: xp + centerx,
    y: yp + centery
  }
}

const approxUnitArc = (ang1, ang2) => {
  // See http://spencermortensen.com/articles/bezier-circle/ for the derivation
  // of this constant.
  const c = 0.551915024494

  const x1 = Math.cos(ang1)
  const y1 = Math.sin(ang1)
  const x2 = Math.cos(ang1 + ang2)
  const y2 = Math.sin(ang1 + ang2)

  return [
    {
      x: x1 - y1 * c,
      y: y1 + x1 * c
    },
    {
      x: x2 + y2 * c,
      y: y2 - x2 * c
    },
    {
      x: x2,
      y: y2
    }
  ]
}

const vectorAngle = (ux, uy, vx, vy) => {
  const sign = (ux * vy - uy * vx < 0) ? -1 : 1
  const umag = Math.sqrt(ux * ux + uy * uy)
  const vmag = Math.sqrt(ux * ux + uy * uy)
  const dot = ux * vx + uy * vy

  let div = dot / (umag * vmag)

  if (div > 1) {
    div = 1
  }

  if (div < -1) {
    div = -1
  }

  return sign * Math.acos(div)
}

const getArcCenter = (
  px,
  py,
  cx,
  cy,
  rx,
  ry,
  largeArcFlag,
  sweepFlag,
  sinphi,
  cosphi,
  pxp,
  pyp
) => {
  const rxsq = Math.pow(rx, 2)
  const rysq = Math.pow(ry, 2)
  const pxpsq = Math.pow(pxp, 2)
  const pypsq = Math.pow(pyp, 2)

  let radicant = (rxsq * rysq) - (rxsq * pypsq) - (rysq * pxpsq)

  if (radicant < 0) {
    radicant = 0
  }

  radicant /= (rxsq * pypsq) + (rysq * pxpsq)
  radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1)

  const centerxp = radicant * rx / ry * pyp
  const centeryp = radicant * -ry / rx * pxp

  const centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2
  const centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2

  const vx1 = (pxp - centerxp) / rx
  const vy1 = (pyp - centeryp) / ry
  const vx2 = (-pxp - centerxp) / rx
  const vy2 = (-pyp - centeryp) / ry

  let ang1 = vectorAngle(1, 0, vx1, vy1)
  let ang2 = vectorAngle(vx1, vy1, vx2, vy2)

  if (sweepFlag === 0 && ang2 > 0) {
    ang2 -= TAU
  }

  if (sweepFlag === 1 && ang2 < 0) {
    ang2 += TAU
  }

  return [ centerx, centery, ang1, ang2 ]
}

const arcToBezier = ({
  px,
  py,
  cx,
  cy,
  rx,
  ry,
  xAxisRotation = 0,
  largeArcFlag = 0,
  sweepFlag = 0
}) => {
  const curves = []

  if (rx === 0 || ry === 0) {
    return []
  }

  const sinphi = Math.sin(xAxisRotation * TAU / 360)
  const cosphi = Math.cos(xAxisRotation * TAU / 360)

  const pxp = cosphi * (px - cx) / 2 + sinphi * (py - cy) / 2
  const pyp = -sinphi * (px - cx) / 2 + cosphi * (py - cy) / 2

  if (pxp === 0 && pyp === 0) {
    return []
  }

  rx = Math.abs(rx)
  ry = Math.abs(ry)

  const lambda =
    Math.pow(pxp, 2) / Math.pow(rx, 2) +
    Math.pow(pyp, 2) / Math.pow(ry, 2)

  if (lambda > 1) {
    rx *= Math.sqrt(lambda)
    ry *= Math.sqrt(lambda)
  }

  let [ centerx, centery, ang1, ang2 ] = getArcCenter(
    px,
    py,
    cx,
    cy,
    rx,
    ry,
    largeArcFlag,
    sweepFlag,
    sinphi,
    cosphi,
    pxp,
    pyp
  )

  const segments = Math.max(Math.ceil(Math.abs(ang2) / (TAU / 4)), 1)

  ang2 /= segments

  for (let i = 0; i < segments; i++) {
    curves.push(approxUnitArc(ang1, ang2))
    ang1 += ang2
  }

  return curves.map(curve => {
    const { x: x1, y: y1 } = mapToEllipse(curve[ 0 ], rx, ry, cosphi, sinphi, centerx, centery)
    const { x: x2, y: y2 } = mapToEllipse(curve[ 1 ], rx, ry, cosphi, sinphi, centerx, centery)
    const { x, y } = mapToEllipse(curve[ 2 ], rx, ry, cosphi, sinphi, centerx, centery)

    return { x1, y1, x2, y2, x, y }
  })
}



const normalize = (path) =>{
  // init state
  var prev
  var result = []
  var bezierX = 0
  var bezierY = 0
  var startX = 0
  var startY = 0
  var quadX = null
  var quadY = null
  var x = 0
  var y = 0

  for (var i = 0, len = path.length; i < len; i++) {
    var seg = path[i]
    var command = seg[0]

    switch (command) {
      case 'M':
        startX = seg[1]
        startY = seg[2]
        break
      case 'A':
        var curves = arcToBezier({
          px: x,
          py: y,
          cx: seg[6],
          cy:  seg[7],
          rx: seg[1],
          ry: seg[2],
          xAxisRotation: seg[3],
          largeArcFlag: seg[4],
          sweepFlag: seg[5]
        })

        // null-curves
        if (!curves.length) continue

        for (var j = 0, c; j < curves.length; j++) {
          c = curves[j]
          seg = ['C', c.x1, c.y1, c.x2, c.y2, c.x, c.y]
          if (j < curves.length - 1) result.push(seg)
        }

        break
      case 'S':
        // default control point
        var cx = x
        var cy = y
        if (prev == 'C' || prev == 'S') {
          cx += cx - bezierX // reflect the previous command's control
          cy += cy - bezierY // point relative to the current point
        }
        seg = ['C', cx, cy, seg[1], seg[2], seg[3], seg[4]]
        break
      case 'T':
        if (prev == 'Q' || prev == 'T') {
          quadX = x * 2 - quadX // as with 'S' reflect previous control point
          quadY = y * 2 - quadY
        } else {
          quadX = x
          quadY = y
        }
        seg = quadratic(x, y, quadX, quadY, seg[1], seg[2])
        break
      case 'Q':
        quadX = seg[1]
        quadY = seg[2]
        seg = quadratic(x, y, seg[1], seg[2], seg[3], seg[4])
        break
      case 'L':
        seg = line(x, y, seg[1], seg[2])
        break
      case 'H':
        seg = line(x, y, seg[1], y)
        break
      case 'V':
        seg = line(x, y, x, seg[1])
        break
      case 'Z':
        seg = line(x, y, startX, startY)
        break
    }

    // update state
    prev = command
    x = seg[seg.length - 2]
    y = seg[seg.length - 1]
    if (seg.length > 4) {
      bezierX = seg[seg.length - 4]
      bezierY = seg[seg.length - 3]
    } else {
      bezierX = x
      bezierY = y
    }
    result.push(seg)
  }

  return result
}

function line(x1, y1, x2, y2){
  return ['C', x1, y1, x2, y2, x2, y2]
}

function quadratic(x1, y1, cx, cy, x2, y2){
  return [
    'C',
    x1/3 + (2/3) * cx,
    y1/3 + (2/3) * cy,
    x2/3 + (2/3) * cx,
    y2/3 + (2/3) * cy,
    x2,
    y2
  ]
}


/**
 * expected argument lengths
 * @type {Object}
 */

var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0}

/**
 * segment pattern
 * @type {RegExp}
 */

var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig

/**
 * parse an svg path data string. Generates an Array
 * of commands where each command is an Array of the
 * form `[command, arg1, arg2, ...]`
 *
 * @param {String} path
 * @return {Array}
 */

const parse = (path) => {
	var data = []
	path.replace(segment, function(_, command, args){
		var type = command.toLowerCase()
		args = parseValues(args)

		// overloaded moveTo
		if (type == 'm' && args.length > 2) {
			data.push([command].concat(args.splice(0, 2)))
			type = 'l'
			command = command == 'm' ? 'l' : 'L'
		}

		while (true) {
			if (args.length == length[type]) {
				args.unshift(command)
				return data.push(args)
			}
			if (args.length < length[type]) throw new Error('malformed path data')
			data.push([command].concat(args.splice(0, length[type])))
		}
  })
 // console.log('data for parser is now '+JSON.stringify(data))
	return data
}

var number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig

function parseValues(args) {
	var numbers = args.match(number)
	return numbers ? numbers.map(Number) : []
}


/**
 * redefine `path` with absolute coordinates
 *
 * @param {Array} path
 * @return {Array}
 */

const absolutize = function(path) {
	var startX = 0
	var startY = 0
	var x = 0
	var y = 0

	return path.map(function(seg){
		seg = seg.slice()
		var type = seg[0]
		var command = type.toUpperCase()

		// is relative
		if (type != command) {
			seg[0] = command
			switch (type) {
				case 'a':
					seg[6] += x
					seg[7] += y
					break
				case 'v':
					seg[1] += y
					break
				case 'h':
					seg[1] += x
					break
				default:
					for (var i = 1; i < seg.length;) {
						seg[i++] += x
						seg[i++] += y
					}
			}
		}

		// update cursor state
		switch (command) {
			case 'Z':
				x = startX
				y = startY
				break
			case 'H':
				x = seg[1]
				break
			case 'V':
				y = seg[1]
				break
			case 'M':
				x = startX = seg[1]
				y = startY = seg[2]
				break
			default:
				x = seg[seg.length - 2]
				y = seg[seg.length - 1]
		}

		return seg
	})
}


// Taken from the SVG specification: https://www.w3.org/TR/SVG/paths.html
// Uppercase instructions refer to absolute coordinates whilst lowercase
// instructions use coordinates relative to the last instruction.
const INSTRUCTIONS = [
  'M', 'm',
  'L', 'l',
  'H', 'h',
  'V', 'v',
  'C', 'c',
  'S', 's',
  'Q', 'q',
  'T', 't',
  'A', 'a',
  'Z', 'z'
]

const XMIN = 0
const YMIN = 1
const XMAX = 2
const YMAX = 3

// The viewBox string may be specified using spaces or commas as delimiters.
// The order is: xmin, ymin, xmax, ymax
const extractViewBox = function(viewBoxStr) {
  const parts = viewBoxStr.split(/\s*,\s*|\s+/)
  return [
    parseFloat(parts[0]),
    parseFloat(parts[1]),
    parseFloat(parts[2]),
    parseFloat(parts[3])
  ]
}

// Normalize an SVG path to between a specified min and max.
// Throws an error on invalid parameters.
const fitToView = function({viewBox, path, min = 0, max = 1, precision = 4, asList}) {
  let bounds
  switch (typeof viewBox) {
    case 'string':
      bounds = extractViewBox(viewBox)
      break

    case 'object':
      bounds = viewBox
      if (!Array.isArray(bounds)) {
        bounds = [bounds.xmin, bounds.ymin, bounds.xmax, bounds.ymax]
      }
      break

    case 'undefined':
      bounds = pathBounds(path)
      break

    default:
      throw Error('Unknown viewBox format')
      break
  }

  const normalized = parse(path).map(feature => {
    const instruction = feature[0]
    if (INSTRUCTIONS.indexOf(instruction) === -1) {
      throw Error(`Unknown instruction ${instruction} in path`)
    }

    const remaining = feature.slice(1)

    // Transform into IR
    let intermediates = [];
    if (instruction === 'A' || instruction === 'a') {
      const [rx, ry, xrot, largearc, sweep, x, y] = remaining
      intermediates = [
        {value: rx, x: true},
        {value: ry},
        {value: xrot, skip: true},
        {value: largearc, skip: true},
        {value: sweep, skip: true},
        {value: x, x: true},
        {value: y}
      ]
    } else if (instruction === 'H' || instruction === 'h') {
      const [xplus] = remaining
      intermediates = [{value: xplus, x: true}]
    } else if (instruction === 'V' || instruction === 'v') {
      const [yplus] = remaining
      intermediates = [{value: yplus}]
    } else {
      // X coordinates are at even positions whilst Y coordinates are at odd.
      intermediates = remaining.map((value, i) => ({
        value,
        x: i % 2 === 0,
      }))
    }

    // Normalize the values of each coordinate.
    const coords = intermediates.reduce((processed, {value, skip, x}) => {
      if (skip) {
        return processed.concat(value)
      }

      const norm = normalizeCoord({
        value,
        min,
        max,
        bounds,
        x
      }).toFixed(precision)
      return processed.concat(norm)
    }, [])

    // Return as segmented list?
    if (asList) {
      coords.unshift(instruction)
      return coords
    }
    return instruction + coords.join(' ')
  })
  return asList ? normalized : normalized.join('')
}

const normalizeCoord = function({value, x, bounds, min, max}) {
  const float = parseFloat(value)
  if (isNaN(float)) {
    throw Error(`Invalid coordinate ${value} in path`)
  }
  const oldMax = x ? bounds[XMAX] : bounds[YMAX]
  const oldMin = x ? bounds[XMIN] : bounds[YMIN]
  return scale(max, min, oldMax, oldMin, float)
}

// Scale a value in range [oldMin, oldMax] to the scale
// [newMin, newMax].
// See https://stackoverflow.com/a/5295202/6413814
const scale = function(newMax, newMin, oldMax, oldMin, x) {
  const scalar = newMax - newMin
  return ((scalar * (x - oldMin)) / (oldMax - oldMin)) + newMin
}

export { fitToView, absolutize, normalize, parse }