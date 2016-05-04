import { noop } from '../../utils';


var animating = false;

// Author Barney Caroll
// taken from https://gist.github.com/barneycarroll/c69fbe0786e37c941baf

// Define an animator consisting of optional incoming and outgoing animations.
// alwaysAnimate is false unless specified as true: false means an incoming animation will only trigger if an outgoing animation is also in progress.
// forcing dontClone to true means the outward animation will use the original element rather than a clone. This could improve performance by recycling elements, but can lead to trouble: clones have the advantage of being stripped of all event listeners.
export default function animator(incoming, outgoing, alwaysAnimate, dontClone) {
  // The resulting animator can be applied to any number of components
  return function animate( x, y, z ){
    var config;
    var parent;
    var next;

    // When used as a config function
    if ( x.nodeType ) {
      return animationConfig(x, y, z);
    }
    // When passed a virtual DOM node (the output of m)
    else if ( x.attrs ) {
      return bindConfigTo( x );
    }
    // When applied to a Mithril module / component
    else if ( x.view ) {
      return {
        controller: x.controller || noop,
        view: function animatedView(ctrl){
          return bindConfigTo(x.view(ctrl));
        }
      };
    }

    function bindConfigTo( node ){
      if (!node) return null;

      config = node.attrs.config;

      node.attrs.config = animationConfig;

      return node;
    }

    function animationConfig(el, init, context){
      var output;
      var onunload;

      if (config){
        output = config(el, init, context);
        // If the root element already has a config, it may also have an onunload which we should take care to preserve
        onunload = context.onunload;
      }

      if ( !init ){
        if (incoming && alwaysAnimate || animating) {
          incoming(el, noop, context);
        }

        context.onunload = outgoing ? onunload ? function onunloadWrapper() {
          teardown();
          onunload();
        } : teardown : onunload;

        parent = el.parentElement;
        next = el.nextSibling;
      }

      return output;

      function teardown() {
        var insertion = dontClone ? el : el.cloneNode( true );
        var reference = null;

        if ( next && parent && next.parentNode === parent ){
          reference = next;
        }

        animating = true;

        setTimeout( function resetAnimationFlag(){
          animating = false;
        }, 0 );

        parent.insertBefore( insertion, reference );

        outgoing( insertion, function destroy(){
          if ( parent.contains( insertion ) ){
            parent.removeChild( insertion );
          }
        }, context );
      }
    }
  };
}
