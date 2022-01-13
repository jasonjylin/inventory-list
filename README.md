# Inventory List Shopify Challenge
Built for Shopify Backend Developer Intern Challenge - Summer 2022

# Setup
To run the app locally, follow these steps:
1. Clone the repo
2. Run `npm run all`
3. Access app on `localhost:3000`, or GraphiQL on `localhost:5000/graphql`

or:

1. Clone the repo
2. From the root of the app, run `npm run setup`
3. Run `npm start`, and both the api and app should be started
4. Access app on `localhost:3000`, or GraphiQL on `localhost:5000/graphql`

or:

1. Clone the repo
2. `cd` to app and api and do `npm install` in both
3. `npm start` in both app and api
4. Access app on `localhost:3000`, or GraphiQL on `localhost:5000/graphql`

# GraphiQL
GraphiQL is available on localhost:5000/graphql. Documentation is available for every query and mutation in the documentation explorer on the right.

# Description
![image](https://user-images.githubusercontent.com/53064105/149262939-c9181f2c-0165-4c14-b3fe-3ca5ae2b0ae8.png)
Simple CRUD app for inventory items with a name and an amount that also has soft/hard deletion available (with restore).

# Features
- Adding new inventory items
- Editing existing inventory items
- Deleting inventory items (soft delete)
- Permanently deleting inventory items (hard delete)
- Table for restoring inventory items
- GraphQL api with GraphiQL
