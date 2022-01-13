const graphql = require("graphql");
const db = require("../../database.js");

const ItemType = new graphql.GraphQLObjectType({
  name: "Item",
  fields: {
    id: { type: graphql.GraphQLID },
    name: { type: graphql.GraphQLString },
    amount: { type: graphql.GraphQLInt },
  },
});

const DeletedItemType = new graphql.GraphQLObjectType({
  name: "DeletedItem",
  fields: {
    id: { type: graphql.GraphQLID },
    name: { type: graphql.GraphQLString },
    amount: { type: graphql.GraphQLInt },
    delete_message: { type: graphql.GraphQLString },
  },
});

var queryType = new graphql.GraphQLObjectType({
  name: "Query",
  fields: {
    items: {
      type: new graphql.GraphQLList(ItemType),
      resolve: (root, args, context, info) => {
        return new Promise((resolve, reject) => {
          db.all(
            "SELECT * FROM items WHERE deleted = 0;",
            function (err, rows) {
              if (err) {
                reject([]);
              }
              resolve(rows);
            }
          );
        });
      },
    },
    item: {
      type: ItemType,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID),
        },
      },
      resolve: (root, { id }, context, info) => {
        return new Promise((resolve, reject) => {
          db.all(
            "SELECT * FROM items WHERE id = ? AND deleted = 0;",
            id,
            function (err, rows) {
              if (err) {
                reject(null);
              }
              resolve(rows[0]);
            }
          );
        });
      },
    },
    deletedItems: {
      type: new graphql.GraphQLList(DeletedItemType),
      resolve: (root, args, context, info) => {
        return new Promise((resolve, reject) => {
          db.all(
            "SELECT * FROM items WHERE deleted = 1;",
            function (err, rows) {
              if (err) {
                reject([]);
              }
              resolve(rows);
            }
          );
        });
      },
    },
  },
});

var mutationType = new graphql.GraphQLObjectType({
  name: "Mutation",
  fields: {
    createItem: {
      type: ItemType,
      args: {
        name: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        },
        amount: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
        },
      },
      resolve: (root, { name, amount }) => {
        return new Promise((resolve, reject) => {
          if (name === "" || !(parseInt(amount) >= 0)) {
            reject(new Error("Invalid input."));
          }
          db.run(
            "INSERT INTO items (name, amount) VALUES (?,?);",
            [name, amount],
            (err) => {
              if (err) {
                reject(null);
              }
              db.get("SELECT last_insert_rowid() as id", (err, row) => {
                resolve({
                  id: row["id"],
                  name: name,
                  amount: amount,
                });
              });
            }
          );
        });
      },
    },
    updateItem: {
      type: graphql.GraphQLString,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID),
        },
        name: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        },
        amount: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
        },
      },
      resolve: (root, { id, name, amount }) => {
        if (name === "" || !(parseInt(amount) >= 0)) {
          reject(new Error("Invalid input."));
        }
        return new Promise((resolve, reject) => {
          db.run(
            "UPDATE items SET name = ?, amount = ? WHERE id = ?;",
            [name, amount, id],
            (err) => {
              if (err) {
                reject(err);
              }
              resolve(`Post #${id} updated`);
            }
          );
        });
      },
    },
    deleteItem: {
      type: graphql.GraphQLString,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID),
        },
        message: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        },
      },
      resolve: (root, { id, message }) => {
        return new Promise((resolve, reject) => {
          if (message === "") {
            db.run("UPDATE items SET deleted = 1 WHERE id = ?;", id, (err) => {
              if (err) {
                reject(err);
              }
              resolve(`Post #${id} deleted`);
            });
          } else {
            db.run(
              "UPDATE items SET deleted = 1, delete_message = ? WHERE id = ?;",
              [message, id],
              (err) => {
                if (err) {
                  reject(err);
                }
                resolve(`Post #${id} deleted`);
              }
            );
          }
        });
      },
    },
    restoreItem: {
      type: graphql.GraphQLString,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID),
        },
      },
      resolve: (root, { id }) => {
        return new Promise((resolve, reject) => {
          db.run(
            "UPDATE items SET deleted = 0, delete_message = NULL WHERE id = ?;",
            id,
            (err) => {
              if (err) {
                reject(err);
              }
              resolve(`Post #${id} restored`);
            }
          );
        });
      },
    },
    permDelete: {
      type: graphql.GraphQLString,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID),
        },
      },
      resolve: (root, { id }) => {
        return new Promise((resolve, reject) => {
          db.run("DELETE FROM items WHERE id = ?;", id, (err) => {
            if (err) {
              reject(err);
            }
            resolve(`Post #${id} permanently deleted`);
          });
        });
      },
    },
  },
});

const schema = new graphql.GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

module.exports = {
  schema,
};
