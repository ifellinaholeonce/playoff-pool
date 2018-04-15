import React, {Component} from 'react';

class Team extends Component {
  constructor(props) {
    super(props)
  }
  render(){
    let Teamplayers = this.props.team.map((team, i) => {
      let player = this.props.players.find(p => {
        return p.name === team.name
      })
      return(
        <tr key={i}>
          <th>{player.playing !== "false"? player.playing : i}</th>
          <td>{player.name}</td>
          <td>{player.team}</td>
          <td>{player.score}</td>
          <td></td>
          <td>{player.playing !== "false"? player.goals : "-"}</td>
          <td>{player.playing !== "false"? player.assists : "-"}</td>
          <td>{player.playing !== "false"? Number(player.score) + Number(player.goals) + Number(player.assists) : player.score}</td>
        </tr>
      )
    })
    return(
      <div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Team</th>
              <th>Score Before Today</th>
              <th></th>
              <th>Goals Today</th>
              <th>Assists Today</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {Teamplayers}
          </tbody>
        </table>
      </div>
    )
  }
}
export default Team;
