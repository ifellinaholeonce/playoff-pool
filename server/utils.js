const request = require('request');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const LINKS = [
  "http://www.onlinepools.com/hockey/index.php/h/263816/d3Rrvr5F/report/team?team_id=1917942&",
  "http://www.onlinepools.com/hockey/index.php/h/263816/d3Rrvr5F/report/team?team_id=1914812&",
  "http://www.onlinepools.com/hockey/index.php/h/263816/d3Rrvr5F/report/team?team_id=1919654&",
  "http://www.onlinepools.com/hockey/index.php/h/263816/d3Rrvr5F/report/team?team_id=1917902&",
  "http://www.onlinepools.com/hockey/index.php/h/263816/d3Rrvr5F/report/team?team_id=1917313&",
  "http://www.onlinepools.com/hockey/index.php/h/263816/d3Rrvr5F/report/team?team_id=1914990&",
  "http://www.onlinepools.com/hockey/index.php/h/263816/d3Rrvr5F/report/team?team_id=1915939&",
  "http://www.onlinepools.com/hockey/index.php/h/263816/d3Rrvr5F/report/team?team_id=1917875&",
];
let GAMES = [];
let TEAMS = [];
let PLAYERS = [];


const abvCorrection = (team) => {
  switch (team) {
    case "NAS":
      team = "NSH"
    break;
    case "SAN":
      team = "SJS"
    break;
    case "WAS":
      team = "WSH"
    break;
    case "TAM":
      team = "TBL"
    break;
  }
  return team
}

const checkPlaying = (team) => {
  let status = "false"
  GAMES.forEach((game) => {
    if (game.gameData.teams.away.abbreviation == team || game.gameData.teams.home.abbreviation == team) {
      status = game.gameData.status.detailedState
    }
  })
  console.log(`${team} is ${status}`)
  return status
}

const checkPlays = () => {
  PLAYERS.forEach((player) => {
    player.goals = 0;
    player.assists = 0
  })
  GAMES.forEach((game) => {
    game.liveData.plays.scoringPlays.forEach((scoringPlay) => {
      let play = game.liveData.plays.allPlays[scoringPlay]
      let scorer = play.players[0].player.fullName
      let primaryAssist;
      let secondaryAssist;
      if (play.players[1] && play.players[1].playerType == "Assist") {
        primaryAssist = play.players[1].player.fullName
      }
      if (play.players[2] && play.players[2].playerType == "Assist") {
        secondaryAssist = play.players[2].player.fullName
      }
      PLAYERS.forEach(player => {
        if (player.name.substring(0, player.name.indexOf(",")).length > 0) {
          if (
            scorer &&
            scorer.includes(player.name.substring(0, player.name.indexOf(",")))
          ) {
            player.goals = Number(player.goals) + 1;
          } else if (
            primaryAssist &&
            primaryAssist.includes(
              player.name.substring(0, player.name.indexOf(","))
            )
          ) {
            player.assists = Number(player.assists) + 1;
          } else if (
            secondaryAssist &&
            secondaryAssist.includes(
              player.name.substring(0, player.name.indexOf(","))
            )
          ) {
            player.assists = Number(player.assists) + 1;
          }
        }
      })
    })
  })
}

const getGame = (link) => {
  return new Promise(function(resolve, reject) {
  fetch(`http://statsapi.web.nhl.com/${link}`)
    .then(res => res.json())
    .then(json => {
      resolve(json)
    })
  })
}

const getTeamName = (link) => {
  return new Promise((resolve, reject) => {
    request(link, (error, response, html) => {
      let $ = cheerio.load(html);
      let teamName = $('.breadcrumbs-container').children().last().text()
      resolve(teamName)
    })
  })
}

let getPlayers = function (link) {
  let players = []
  return new Promise((resolve, reject) => {
    request(link, function (error, response, html) {
      let $ = cheerio.load(html);
      for (let i = 1; i < $('.name').length; i++) {
        if ($('.name').eq(i).text() !== "Goalies") {
          i == $('.name').length - 1? j = i + 1 : j = i //this is because the goalie score is off by one. Should probably look for siblings instead of index count
          let player = {
            name: $('.name').eq(i).text(),
            team: abvCorrection($('.team').eq(i).text()),
            score: $('.score').eq(j).text(),
            playing: checkPlaying(abvCorrection($('.team').eq(i).text())),
            goals: 0,
            assists: 0
          }
          players.push(player)
        }
      }
      resolve(players)
    })
  })
}

const getSchedule = () => {
  return new Promise((resolve, reject) => {
    fetch(`http://statsapi.web.nhl.com/api/v1/schedule`)
      .then(res => res.json())
      .then(json => {
        resolve(json)
      })
  })
}

let getGames = async function () {
  let schedule = await getSchedule()
  let games = []
  schedule.dates[0].games.forEach((game) => {
    games.push(getGame(game.link))
  })
  return new Promise((resolve, reject) => {
    Promise.all(games).then(games => {
      resolve(games)
    })
  })
}

let init = async function (ws) {
  await checkPlays();
  let message = {
    type: "init",
    body: {
      players: PLAYERS,
      games: GAMES,
      teams: TEAMS
    }
  }
  ws.send(JSON.stringify(message))
}

let startServer = async () => {
  let teams = []
  let games = await getGames()
  GAMES = games
  for (team of LINKS) {
    teams.push(
      getPlayers(team)
    )
  }
  Promise.all(teams).then(async teams => {
    teams.forEach(async (team, i) => {
      let teamName = await getTeamName(LINKS[i])
      TEAMS.push({
        teamName: teamName,
        players: team
      })
      team.forEach(player => {
        if (!(PLAYERS.some(el => el.name === player.name))) {
          PLAYERS.push(player)
        }
      })
    })
    await checkPlays();
  })
}

let updateConditions = (game, i) => {
  if (
    game.liveData.plays.scoringPlays.length > GAMES[i].liveData.plays.scoringPlays.length ||
    game.gameData.status.detailedState !==  GAMES[i].gameData.status.detailedState
  ) {
    return true
  } else {
    return false
  }
}

let update = async (clients) => {
  let needUpdate = false;
  let games = await getGames();
  games.forEach((game, i) =>{
    if (updateConditions(game, i)) {
      needUpdate = true;
    }
  })
  GAMES = games
  if (needUpdate) {
    PLAYERS.forEach((player, i) => {
      PLAYERS[i].playing = checkPlaying(player.team)
      console.log("team", player.team)
      console.log("PLAYER", PLAYERS[i].playing)
    })
    checkPlays()
  }
  let message = {
    type: "update",
    body: {
      players: PLAYERS,
      games: GAMES,
      teams: TEAMS
    }
  }
  return message
}

module.exports = {
  getPlayers,
  getGames,
  init,
  startServer,
  update
}
