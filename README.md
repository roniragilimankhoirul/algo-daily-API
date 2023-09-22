# Algo-Daily-API

The AlgoDaily API is a backend application developed as part of an internship project at Algostudio. It serves as the backbone for the AlgoDaily mobile app, specifically designed to handle worker attendance tracking and management

## Table of Contents

- [Installation](#installation)

## Installation

1. Clone the repository:

```shell
git clone https://github.com/roniragilimankhoirul/algo-daily-API.git
```

2. Navigate to the Project Directory:

```shell
cd algo-daily-API
```

3. Set Up Environment Variables:

Create a .env file in the project root and configure your environment variables.

```
DATABASE_URL='postgres://postgres:password@localhost:5432/algostudio'
PORT=8080
JWT_SECRET= "xxx";
```

4. Install dependencies:

```shell
npm install
```
5. Database migration:

```shell
npx prisma migrate deploy
```

6. Start the server:

```shell
npm start
```

The application should now be running on http://localhost:8080.
