import React, {Component} from 'react';
import {PanelGroup, Panel} from 'react-bootstrap'
import Player from './Player'

class Teams extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      activeKey: '1'
    };
  }

  handleSelect(activeKey) {
    this.setState({ activeKey });
  }

  render() {
    let teams = this.props.teams
      .sort((a, b) => { return b.totalScore - a.totalScore})
      .map((team, i) => {
      return (
        <Panel eventKey={i} key={i}>
          <Panel.Heading>
            <Panel.Title toggle>{i+1}: {team.teamName} ({team.totalScore})</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <Player team={team} players={this.props.players} />
            <p>Team Total: {team.totalScore}</p>
          </Panel.Body>
        </Panel>
      )
    })
    return (
      <PanelGroup
        accordion
        id="accordion-controlled-example"
        activeKey={this.state.activeKey}
        onSelect={this.handleSelect}
      >
        {teams}
      </PanelGroup>
    );
  }
}

export default Teams;
