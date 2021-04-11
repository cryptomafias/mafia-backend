# Mafia Backend

This is a REST API service which handles gameplay.


## Usage

### How to use it?
- Create a new game room by **POST** request to `/rooms` endpoint.
- Join an existing game room by **PUT** request to `/rooms/{roomId}` endpoint.
- You can register a vote for ejecting a player during discussion phase by **PUT** request to `/rooms/{roomId}/vote` endpoint.
- You can register a vote for killing a player during night phase if you are a mafia by **PUT** request to `/rooms/{roomId}/killVote` endpoint.
- You can heal a player during night phase if you are a doctor by **PUT** request to `/rooms/{roomId}/heal` endpoint.

 
## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. If you want to use it in production you can skip to the deployment section.

### Prerequisites

- nodejs
- yarn

### Installing
After cloning/downloading this repository you have to install necessary packages from package.json with following command

```console
yarn install
```

This will install all dependencies needed to run the server.

### Starting server

After installation you just need to run following command to start server.

```console
yarn start
```
Runs the api in the development mode.<br />
Server will run on [http://localhost:5000](http://localhost:5000).

The page will reload if you make edits.<br />
You will also see errors and logs in the console.

> You can stop server by pressing ctrl+c.

