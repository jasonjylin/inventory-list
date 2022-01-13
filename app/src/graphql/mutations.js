import { gql } from "@apollo/client";

export const ITEM_CREATE_MUTATION = gql`
  mutation CreateItem($name: String!, $amount: Int!) {
    createItem(name: $name, amount: $amount) {
      id
      name
      amount
    }
  }
`;

export const ITEM_UPDATE_MUTATION = gql`
  mutation UpdateItem($id: ID!, $name: String!, $amount: Int!) {
    updateItem(id: $id, name: $name, amount: $amount)
  }
`;

export const ITEM_DELETE_MUTATION = gql`
  mutation DeleteItem($id: ID!, $message: String!) {
    deleteItem(id: $id, message: $message)
  }
`;

export const ITEM_RESTORE_MUTATION = gql`
  mutation RestoreItem($id: ID!) {
    restoreItem(id: $id)
  }
`;
