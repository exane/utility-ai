class Action {

  constructor(description, callback) {
    this.description = description
    this.scores = []
    this._condition = () => true

    callback(this)
  }

  condition(callback) {
    if (!callback) {
      throw Error("UtilityAi#Action#condition: Missing callback")
    }

    this._condition = callback
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
    if (!this._condition(data)) return -Infinity

    return this.scores
      .map(score => score.callback(data))
      .reduce((acc, score) => acc + score, 0)
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
      .map(action => ({
        action: action.description,
        score: action.evaluate(data)
      }))
      .reduce((acc, action) => acc.score !== undefined && acc.score > action.score ? acc : action, {})
  }

}
