const { expect } = require("chai")
const UtilityAi = require("./UtilityAi")

describe("UtilityAi", () => {

  it("is a function", () => {
    expect(UtilityAi).to.be.a("function")
    expect(new UtilityAi).to.be.an("object")
  })

  describe("#addAction", () => {

    let utility_ai
    beforeEach(() => {
      utility_ai = new UtilityAi
    })

    it("is a function", () => {
      expect(utility_ai.addAction).to.be.a("function")
    })

    it("requires a description and callback", () => {
      expect(() => utility_ai.addAction()).to.throw(/missing description/i)
      expect(() => utility_ai.addAction("test")).to.throw(/missing callback/i)
      expect(() => utility_ai.addAction("test", () => {})).to.not.throw()
    })

    it("registers actions", () => {
      expect(utility_ai._actions).to.be.an("array").that.has.lengthOf(0)

      utility_ai.addAction("test", () => {})

      expect(utility_ai._actions).to.be.an("array").that.has.lengthOf(1)
      const [action] = utility_ai._actions
      expect(action).to.be.an("object")
      expect(action).to.have.a.property("description", "test")

      utility_ai.addAction("test2", () => {})

      expect(utility_ai._actions).to.be.an("array").that.has.lengthOf(2)
      const [,action2] = utility_ai._actions
      expect(action2).to.be.an("object")
      expect(action2).to.have.a.property("description", "test2")
    })

    it("calls callback with action param", () => {
      let cb_called = false

      utility_ai.addAction("test", action => {
        expect(action).to.be.an("object").with.property("score")
        cb_called = true
      })

      utility_ai.evaluate()
      expect(cb_called).to.be.true
    })

    describe("Action", () => {

      let action
      beforeEach(() => {
        utility_ai.addAction("test", a => action = a)
      })

      describe("#score", () => {

        it("is a function", () => {
          expect(action.score).to.be.a("function")
        })

        it("requires a description, score and callback", () => {
          expect(() => action.score()).to.throw(/missing description/i)
          expect(() => action.score("test")).to.throw(/missing callback/i)
          expect(() => action.score("test", () => {})).to.not.throw()
        })

      }) // # score

      describe("#condition", () => {

        it("is a function", () => {
          expect(action.condition).to.be.a("function")
        })

        it("expects a callback as param", () => {
          expect(() => action.condition()).to.throw(/missing callback/i)
          expect(() => action.condition(() => {})).to.not.throw()
        })

        it("does not execute scorers if condition fails", () => {
          action.score("test", () => 20)

          expect(action.evaluate()).to.be.eq(20)

          action.condition(data => {
            return data.is_true === true
          })

          expect(action.evaluate({ is_true: true })).to.be.eq(20)
          expect(action.evaluate({ is_true: false })).to.be.eq(-Infinity)
        })

      }) // #condition

      describe("#evaluate", () => {

        it("evaluates score", () => {

          let action
          utility_ai.addAction("attack", _action => {
            action = _action

            _action.score("can attack", (entity) => {
              return entity.can_attack && 20
            })

            _action.score("can kill enemy", (entity) => {
              return entity.can_kill_enemy && 40
            })

            _action.score("has low health", (entity) => {
              return entity.has_low_health && -20
            })

          })

          const entity = {
            can_attack: true,
            can_kill_enemy: true,
            has_low_health: false
          }

          const result = action.evaluate(entity)
          expect(result).to.be.a("number")
          expect(result).to.be.eq(60)

          entity.has_low_health = true
          expect(action.evaluate(entity)).to.be.eq(40)

          entity.can_kill_enemy = false
          expect(action.evaluate(entity)).to.be.eq(0)
        })

      }) // # evaluate

    }) // # Action

  }) // #addAction

  describe("#evaluate", () => {

    let utility_ai
    beforeEach(() => {
      utility_ai = new UtilityAi
    })

    it("is a function", () => {
      expect(utility_ai.evaluate).to.be.a("function")
    })

    it("evaluates actions", () => {
      const data = {
        entity: {
          can_attack: true,
          can_heal: true,
          can_kill_enemy: true,
          is_full_hp: true,
          has_low_health: false
        }
      }

      utility_ai.addAction("attack", action => {

        action.score("can attack", ({ entity }) => {
          return entity.can_attack && 20
        })

        action.score("can kill enemy", ({ entity }) => {
          return entity.can_kill_enemy && 40
        })

        action.score("has low health", ({ entity }) => {
          return entity.has_low_health && -20
        })

      })

      utility_ai.addAction("heal", action => {

        action.score("can heal", ({ entity }) => {
          return entity.can_heal && 20
        })

        action.score("is full hp", ({ entity }) => {
          return entity.is_full_hp && -60
        })

        action.score("has low health", ({ entity }) => {
          return entity.has_low_health && 40
        })

      })

      const result = utility_ai.evaluate(data)
      expect(result).to.be.an("object")
      expect(result).to.have.property("action", "attack")
      expect(result).to.have.property("score", 60)
    })

  }) // #evaluate

}) // #UtilityAi
