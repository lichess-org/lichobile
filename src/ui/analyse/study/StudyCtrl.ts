import { StudyData } from '../../../lichess/interfaces/study'

export default class StudyCtrl {
  public data: StudyData

  constructor(data: StudyData) {
    this.data = data
  }
}
