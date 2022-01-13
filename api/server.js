const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/item/item.js");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema.schema,
    graphiql: true,
  })
);

app.listen(5000, () => {
  console.log("Running a GraphQL API server at http://localhost:5000/graphql");
});
