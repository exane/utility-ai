class Action {

  constructor(description, callback) {
    this.description = description
    this._scores = []
    this._condition = () => true

    callback(this)
  }

  condition(callback) {
    if (!callback) {
      throw Error("UtilityAi#Action#condition: Missing callback")
    }

    this._condition = callback
  }

  score(description, callback) {

    if (!description) {
      throw Error("UtilityAi#Action#score: Missing description")
    }
    if (!callback) {
      throw Error("UtilityAi#Action#score: Missing callback")
    }

    this._scores.push({
      description,
      callback
    })

  }

  _validateScore(score) {
    if (!isNaN(score) && typeof score === "number") {
      return score
    }
    return 0
  }

  evaluate(data) {
    if (!this._condition(data)) return -Infinity

    return this._scores
      .map(score => this._validateScore(score.callback(data)))
      .reduce((acc, score) => acc + score, 0)
  }

}

module.exports = class UtilityAi {

  constructor() {
    this._actions = []
  }

  addAction(description, callback) {
    if (!description) {
      throw Error("UtilityAi#addAction: Missing description")
    }
    if (!callback) {
      throw Error("UtilityAi#addAction: Missing callback")
    }

    const action = new Action(description, callback)

    this._actions.push(action)
  }

  evaluate(data) {
    return this._actions
      .map(action => ({
        action: action.description,
        score: action.evaluate(data)
      }))
      .reduce((acc, action) => acc.score !== undefined && acc.score > action.score ? acc : action, {})
  }

}
