# IsenBot - MongoDB

This is a Discord bot that has been developed using Node.js. It is intended for use in ISEN engineering school communities.

## Make sure to read the [wiki](https://github.com/IsenBot/IsenBot-MongoDB/wiki) for complete informations
## Releases
This project as intended to replace an ancient version of IsenBot, used by some clubs and classes of ISEN Nantes school, with a MongoDB database and a cleaner code.

This bot is still in active developpment. Safe releases will be published soon.

## Features
- Role assigment
- Club hours counter
- Music player

## Getting Started
1. Make sure to have Node.js >= 16.9.0 installed
2. Clone the repository: `git clone https://github.com/IsenBot/IsenBot-MongoDB.git`
3. Install the dependencies: `npm install`
4. Create a new bot on Discord's developer portal and get its token.
5. Create a MongoDB instance an get its URI.
6. Add the token & URI to a `.env` file by renaming the `hidden.env` file.
7. Start the bot: `npm start`

## Usage
Generate an authorization URL on the discord developper portal & add the bot to your personnal server with Administrator priviledges.

The commands are registered usinng discord slashcommands and can be used with prefix `/`

## Contributing
If you would like to contribute to this project, please fork the repository and create a pull request with your proposed changes.

## License
This project is licensed under the GNUv3.0 public License.