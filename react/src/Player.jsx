import React, {Component} from 'react';
import {Table} from 'react-bootstrap'


class Team extends Component {
  constructor(props) {
    super(props)
  }
  render(){
    let teamPlayers = this.props.team.players.map((team, i) => {
      let player = this.props.players.find(p => {
        return p.name === team.name
      })
      return(
        <tr key={i}>
          <th>{player.playing !== "false"? player.playing : i}</th>
          <td>{player.name}</td>
          <td>{player.team}</td>
          <td>{player.score}</td>
          <td>{player.playing !== "false"? player.goals : "-"}</td>
          <td>{player.playing !== "false"? player.assists : "-"}</td>
          <td>{player.playing !== "false"? Number(player.score) + Number(player.goals) + Number(player.assists) : player.score}</td>
        </tr>
      )
    })
    return(
      <div>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Team</th>
              <th>Score</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {teamPlayers}
          </tbody>
        </Table>
      </div>
    )
  }
}
export default Team;
