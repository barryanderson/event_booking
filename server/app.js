const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const isAuth = require("./middleware/is-auth");
const graphqlSchema = require("./graphql/schema/index");
const graphqlResolvers = require("./graphql/resolvers/index");

const app = express();
app.use(bodyParser.json()); // Json body parser middleware.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(isAuth);

// GraphQL endpoint.
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true // Enable graphiql front end for development.
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@project0-trdi4.azure.mongodb.net/${
      process.env.MONGO_DB
    }?retryWrites=true`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(8000);
  })
  .then()
  .catch(err => {
    console.log(err);
  });
