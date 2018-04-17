import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Team from './Team.jsx'
import Game from './Game.jsx'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      players: [],
      games: [],
      teams: []
    }
  }

  componentDidMount = () => {
    this.connection = new WebSocket(location.origin.replace(/^http/, 'ws'));
    this.connection.onmessage = (event) => {
      let message = JSON.parse(event.data)
      console.log(message)
      switch (message.type) {
        case "init":
          this.setState({
            players: message.body.players,
            games: message.body.games,
            teams: message.body.teams
          })
        break;
        case "update":
          this.setState({
            players: message.body.players,
            games: message.body.games
          })
        break;
      }
    }
  }
  render() {
    let teams = this.state.teams.map((team, i) => {
      return (
        <div key={i}>
          <p className="App-intro">
            {team.teamName}
          </p>
          <Team team={team} players={this.state.players} />
          <p>Team Total: </p>
        </div>
      )
    })
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        {teams}
        <p className="App-intro">
          Games
        </p>
        < Game games={this.state.games} />
      </div>
    );
  }
}

export default App;
