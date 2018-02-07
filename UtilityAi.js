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

  log(...msg) {
    if (!this._print_debug) return
    console.log(...msg)
  }

  evaluate(data, debug = false) {
    this._print_debug = debug

    this.log("Evaluate Action: ", this.description)
    if (!this._condition(data)) {
      this.log("Condition not fulfilled")
      return -Infinity
    }

    const score = this._scores
      .map(score => {
        const _score = this._validateScore(score.callback(data))
        this.log("- ", score.description, _score)
        return _score
      })
      .reduce((acc, score) => acc + score, 0)

    this.log("Final Score: ", score)

    return score
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

  evaluate(data, debug = false) {
    return this._actions
      .map(action => ({
        action: action.description,
        score: action.evaluate(data, debug)
      }))
      .reduce((acc, action) => acc.score !== undefined && acc.score > action.score ? acc : action, {})
  }

}
