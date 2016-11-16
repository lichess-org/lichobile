/**
* Global object universalLinks.
*/
interface Window {
    universalLinks: UniversalLinks;
}

interface EventData {
  url: string
  scheme: string
  host: string
  path: string
  params: string
  hash: string
}

/**
* The universalLinks object allows us to subscribe to users entering the app via different links.
*/
interface UniversalLinks {
  subscribe: (event: string, action: (eventData: EventData) => void) => void
}

declare var StatusBar: StatusBar;
