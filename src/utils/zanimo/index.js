// Zanimo.js - Promise based CSS3 transitions
// (c) 2011-2014 Paul Panserrieu
// modified here for lichobile

const transition = 'transition', transitionend = 'transitionend',

/**
* Zanimo(el | promise[el])
* > Returns a Promise of el.
*
* Zanimo(el | promise[el], attr, value)
* > Sets el.style[attr]=value and returns the promise of el.
*
* Zanimo(el | promise[el], attr, value, duration, [easing])
* > Performs a transition.
*/
export default function Zanimo(el, attr, value, duration, easing) {
  var args = arguments,
  arity = arguments.length
  if (arity === 0 || arity === 2 || arity > 5) {
    return Promise.reject(new Error('Zanimo invalid arguments'))
  }
  if (el instanceof Promise) {
    return el.then(function (val) {
      return Zanimo.apply(this, [val].concat(Array.prototype.slice.call(args, 1)))
    })
  }
  if (!isDOM(el)) {
    return Promise.reject(new Error('Zanimo require an HTMLElement, or a promise of an HTMLElement'))
  }
  if (arity === 1) {
    return Promise(el)
  }
  if (arity === 3) {
    return css(el, attr, value)
  }
  if(window.isNaN(parseInt(duration, 10))) {
    return Promise.reject(new Error('Zanimo transition: duration must be an integer!'))
  }
  return animate(el, attr, value, duration, easing)
}

function shorthand(v, d, t) {
  return v + ' ' + d + 'ms ' + (t || 'linear')
}

function isDOM(el) {
  try {
    return el && el.nodeType
  } catch(err) {
    return false
  }
}

function addTransition(elt, attr, value, duration, easing) {
  var currentValue = elt.style[transition]
  if (currentValue) {
    elt.style[transition] = currentValue + ', ' + shorthand(attr, duration, easing)
  }
  else {
    elt.style[transition] = shorthand(attr, duration, easing)
  }
  elt.style[attr] = value
}

function removeTransition(el, attr) {
  el.style[transition] = el.style[transition]
  .split(',').filter(function(t) {
    return !t.match(attr)
  }).join(',')
}

function applycss(el, attr, value) {
  requestAnimationFrame(function(){
    el.style[attr] = value
  })
  return Promise(el)
}

function css(el, attr, value) {
  if(el._zanimo && Object.prototype.hasOwnProperty.call(el._zanimo, attr)) {
    console.warn(
      'Zanimo transition with transform=' +
        el._zanimo[attr].value +
        ' stopped by transform=' + value
    )
  }
  return applycss(el, attr, value)
}

function animate(el, attr, value, duration, easing) {
  var prefixed = attr,
  timeout

  var promise = new Promise(function(resolve, reject) {

    function cbTransitionend(evt) {
      if(evt.propertyName === prefixed) {
        cb(true)
        resolve(el)
      }
    }

    function cb(clear) {
      if (timeout) { clearTimeout(timeout); timeout = null }
      removeTransition(el, attr)
      el.removeEventListener(transitionend, cbTransitionend)
      if (clear) { delete el._zanimo[attr] }
    }

    el.addEventListener(transitionend, cbTransitionend)

    requestAnimationFrame(function () {
      addTransition(el, attr, value, duration, easing)
      timeout = setTimeout(function () {
        // var rawVal = el.style.getPropertyValue(prefixed),
        // domVal = rawVal,
        // givenVal = value;

        cb(true)
        resolve(el)
        // if (domVal !== givenVal) {
          //     console.warn('Zanimo transition: with '
            //         + attr + ' = ' + givenVal + ', DOM value=' + domVal
      //     );
      // }
      }, duration + 20 )

      el._zanimo = el._zanimo || { }
      if(el._zanimo[attr]) {
        console.warn(
          'Zanimo transition with ' +
            attr + '=' + el._zanimo[attr].value +
            ' stopped by transition with ' + attr + '=' + value
        )
      }
      el._zanimo[attr] = {value: value}
    })
  })

  return promise
}
