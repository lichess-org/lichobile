import { Study } from '../../../lichess/interfaces/study'

export default class StudyCtrl {
  public data: Study

  constructor(data: Study) {
    this.data = data
  }
}
