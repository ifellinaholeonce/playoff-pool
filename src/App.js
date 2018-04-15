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
      games: []
    }
  }
  componentDidMount = () => {
    this.connection = new WebSocket("ws://127.0.0.1:3030");
    this.connection.onmessage = (event) => {
      let message = JSON.parse(event.data)
      console.log(message)
      switch (message.type) {
        case "init":
          this.setState({
            players: message.body.players,
            games: message.body.games
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
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          Team
        </p>
        {this.state.players.length > 0 &&
          < Team
            players={this.state.players}
           />
        }
        <p className="App-intro">
          Games
        </p>
        < Game games={this.state.games} />
      </div>
    );
  }
}

export default App;
