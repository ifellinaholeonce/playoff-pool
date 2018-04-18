import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Teams from './Teams.jsx'
import Game from './Game.jsx'
import {Grid, Row, Col } from 'react-bootstrap'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      players: [],
      games: [],
      teams: []
    }
  }
  getTeamTotalScore = (team) => {
    let score = 0
    team.players.forEach(player => {
      score += Number(player.score) + Number(player.goals) + Number(player.assists)
    })
    return score
  }

  updateTeamRoster = (teamRoster, playersList) => {
    teamRoster.players.forEach((player, i) => {
      playersList.forEach(p => {
        if (p.name === player.name) {
          teamRoster.players[i].goals = p.goals
          teamRoster.players[i].assists = p.assists
        }
      })
    })
    return teamRoster
  }
  componentDidMount = () => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      this.connection = new WebSocket("ws://127.0.0.1:3030")
    } else {
      this.HOST = window.location.origin.replace(/^http/, 'ws')
      this.connection = new WebSocket(this.HOST);
    }
    this.connection.onmessage = (event) => {
      let message = JSON.parse(event.data)
      let updatedRosters = []
      message.body.teams.forEach(team => {
        updatedRosters.push(this.updateTeamRoster(team, message.body.players))
        team.totalScore = this.getTeamTotalScore(team)
      })
      switch (message.type) {
        case "init":
          this.setState({
            players: message.body.players,
            games: message.body.games,
            teams: updatedRosters
          })
        break;
        case "update":
          this.setState({
            players: message.body.players,
            games: message.body.games,
            teams: updatedRosters
          })
        break;
      }
    }
  }
  render() {
    return (
      <div className="App container">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">KTOBA PLAYOFFS: 2018</h1>
        </header>
        <Grid>
          <Row>
            <Col xs={11} md={8}>
              <p className="App-intro">
                Teams
              </p>
              < Teams teams={this.state.teams} players={this.state.players}/>
            </Col>
            <Col xs={7} md={4}>
              <p className="App-intro">
                Games Tonight
              </p>
              < Game games={this.state.games} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
