import socket, { SocketIFace } from '../../socket'
import router from '../../router'
import { acceptChallenge, declineChallenge, cancelChallenge, getChallenge } from '../../xhr'
import { ChallengeData, Challenge } from '../../lichess/interfaces/challenge'
import challengesApi from '../../lichess/challenges'

export default class ChallengeCtrl {

  public challenge: Challenge

  private socket?: SocketIFace
  private pingTimeoutId!: number

  constructor(readonly data: ChallengeData) {
    this.challenge = data.challenge
    this.socket = socket.createChallenge(data.challenge.id, data.socketVersion, this.onSocketOpen, {
      reload: this.reloadChallenge
    })
  }

  public joinChallenge = () => {
    const c = this.challenge
    if (c) {
      return acceptChallenge(c.id)
      .then(d => {
        clearTimeout(this.pingTimeoutId)
        router.set('/game' + d.url.round, true)
      })
      .then(() => challengesApi.remove(c.id))
    }
    return Promise.reject('no challenge')
  }

  public declineChallenge = () => {
    const c = this.challenge
    if (c) {
      return declineChallenge(c.id)
      .then(() => {
        clearTimeout(this.pingTimeoutId)
        challengesApi.remove(c.id)
      })
      .then(router.backHistory)
    }
    return Promise.reject('no challenge')
  }

  public cancelChallenge = () => {
    const c = this.challenge
    if (c) {
      return cancelChallenge(c.id)
      .then(() => {
        clearTimeout(this.pingTimeoutId)
        challengesApi.remove(c.id)
      })
      .then(router.backHistory)
    }
    return Promise.reject('no challenge')
  }

  public unload = () => {
    clearTimeout(this.pingTimeoutId)
  }

  private reloadChallenge = () => {
    const c = this.challenge
    if (c) {
      getChallenge(c.id)
      .then(d => {
        this.challenge = d.challenge
        switch (d.challenge.status) {
          case 'accepted':
            router.set(`/game/${d.challenge.id}`, true)
            break
          case 'declined':
            router.backHistory()
            break
        }
      })
    }
  }

  private pingNow = () => {
    clearTimeout(this.pingTimeoutId)
    this.pingTimeoutId = setTimeout(this.pingNow, 2000)
    if (this.socket) this.socket.send('ping')
  }

  private onSocketOpen = () => {
    // reload on open in case the reload msg has not been received
    this.reloadChallenge()
    this.pingNow()
  }

}
