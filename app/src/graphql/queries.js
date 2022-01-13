import { gql } from "@apollo/client";

export const ITEMS_QUERY = gql`
  query GetItems {
    items {
      id
      name
      amount
    }
  }
`;

export const DELETED_ITEMS_QUERY = gql`
  query GetDeletedItems {
    deletedItems {
      id
      name
      amount
    }
  }
`;

export const COMBINED_QUERY = gql`
  query getItems {
    items {
      id
      name
      amount
    }
    deletedItems {
      id
      name
      amount
    }
  }
`;
