import h from 'mithril/hyperscript'
import { linkify } from '~/utils/html'

interface Attrs {
  text: string
}

const RichText: Mithril.Component<Attrs> = {
  view({attrs: {text}}): Mithril.Children {
    return text.split('\n').map(line => h.fragment({}, [h.trust(linkify(line)), h('br')]))
  }
}

export default RichText