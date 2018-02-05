# Utility Ai

## A small Utility Ai Framework

### Usage

```js
  const UtilityAi = require("UtilityAi")

  utility_ai = new UtilityAi

  // define your actions e.g "Move to Enemy", "Fire at Enemy", "Move to Cover", "Reload Gun"
  utility_ai.addAction("Move to Enemy", action => {

    // each scorer expects a number as return value, the higher the better the action will be weighted
    action.addScorer("Distance to Enemy", ({ player, enemy }) => {
      return player.distanceTo(enemy)
    })

    action.addScorer("Gun is not loaded", ({ player }) => {
      return player.gunEmpty() && -100
    })

  })

  utility_ai.addAction("Fire at Enemy", action => {

    action.addScorer("Proximity to Enemy < 50", ({ player, enemy }) => {
      return player.distanceTo(enemy) < 50 && 75
    })

    action.addScorer("Cannot make it to cover", ({ player }) => {
      return player.nextCoverDistance() > 25 && 50
    })

    action.addScorer("Gun is not loaded", ({ player }) => {
      return player.gunEmpty() && -125
    })

  })

  utility_ai.addAction("Move to Cover", action => {

    action.addScorer("Is not in cover", ({ player }) => {
      return !player.isInCover() && 50
    })

    action.addScorer("Proximity to Cover < 50", ({ player }) => {
      return player.nextCoverDistance() < 50 && 50
    })

  })

  utility_ai.addAction("Reload Gun", action => {

    action.addScorer("Gun is not loaded", ({ player }) => {
      return player.gunEmpty() && 75
    })

    action.addScorer("Is in Cover", ({ player }) => {
      return player.isInCover() && 50
    })

    action.addScorer("Gun is loaded", ({ player }) => {
      return !player.gunEmpty() && -125
    })

  })

  const data = {
    player: {...},
    enemy: {...}
  }

  // starts the evaluation of a given world state and returns its best action
  const result = utility_ai.evaluate(data)
  // e.g. result = { action: "Move to Cover", score: 100 }
```
