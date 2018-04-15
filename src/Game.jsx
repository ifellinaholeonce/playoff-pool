import React, {Component} from 'react';

class Game extends Component {
  constructor(props) {
    super(props)
  }
  render(){
    let games = this.props.games.map((game, i) => {
      return(
        <tr>
          <td>{game.gameData.game.pk.toString().substr(6, 2)}</td>
          <th>{game.gameData.game.pk.toString().substr(9, 2)}</th>
          <td>{game.gameData.teams.home.abbreviation}({game.liveData.boxscore.teams.home.teamStats.teamSkaterStats.goals})</td>
          <td>vs</td>
          <td>{game.gameData.teams.away.abbreviation}({game.liveData.boxscore.teams.away.teamStats.teamSkaterStats.goals})</td>
          <td>{game.gameData.status.detailedState}</td>
        </tr>
      )
    })
    return(
      <div>
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th>Game</th>
              <th>Home</th>
              <th></th>
              <th>Away</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {games}
          </tbody>
        </table>
      </div>
    )
  }
}
export default Game;
