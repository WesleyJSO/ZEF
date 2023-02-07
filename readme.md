# ZEF app

## Setup

In order to run the project execute the following commands

- `npm install`
- `npm run db_dev`
- `npm run dev`

Afetr that the deplendecies and database should be configured and the system up running.
The file `./requests.http` have some examples of the requests that could be made. To run the queries from the `./requests.http` file install [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) in VS Code

To restart the dev database run:

- `npm run db_test`
- `npm run test`

Considering that `npm install` commando was already executed, the tests should be fired. \

To check the database install [SQLite](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite) in VS Code

# 🤞 Requirements

✔️ Members can join ZEF \
✔️ Members can check their ZEF kuna balances \
❌ Members can send ZEF kunas \
✔️ Members can create new projects \
✔️ Members can invest in projects

# 🧱 User stories

✔️ create a new currency (Domain owner) \
✔️ issue currency (Domain owner) \
✔️ create an account (Member) \
✔️ see my account balance (Member) \
✔️ exchange currency (Member) \
✔️ create a new currency (Member) \
❌ return currency to Domain owner (Member)

## Frameworks and libraries

- [NodeJS](https://nodejs.org/en/about/)
- [Express](https://www.npmjs.com/package/express)
- [Sqlite3 database](https://www.npmjs.com/package/sqlite3)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
