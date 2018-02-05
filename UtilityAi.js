class Action {

  constructor(description, callback) {
    this.description = description
    this.scores = []

    callback(this)
  }

  addScorer(description, callback) {

    if (!description) {
      throw Error("UtilityAi#Action#addScorer: Missing description")
    }
    if (!callback) {
      throw Error("UtilityAi#Action#addScorer: Missing callback")
    }

    this.scores.push({
      description,
      callback
    })

  }

  evaluate(data) {
    return this.scores
      .map(score => {
        return score.callback(data)
      })
      .reduce((acc, score) => {
        return acc + score
      }, 0)
  }

}

module.exports = class UtilityAi {

  constructor() {
    this.actions = []
  }

  addAction(description, callback) {
    if (!description) {
      throw Error("UtilityAi#addAction: Missing description")
    }
    if (!callback) {
      throw Error("UtilityAi#addAction: Missing callback")
    }

    const action = new Action(description, callback)

    this.actions.push(action)
  }

  evaluate(data) {
    return this.actions
      .map(action => {
        const res = {
          action: action.description,
          score: action.evaluate(data)
        }

        return res
      })
      .reduce((acc, action) => {
        return acc.score !== undefined && acc.score > action.score ? acc : action
      }, {})
  }

}
