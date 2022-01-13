import "./App.css";
import InventoryTable from "./components/InventoryTable";
import { useQuery } from "@apollo/client";
import { COMBINED_QUERY } from "./graphql/queries";

const ItemsQuery = () => {
  const { loading, error, data, refetch } = useQuery(COMBINED_QUERY);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  return <InventoryTable data={data} refetch={refetch} />;
};

function App() {
  return <ItemsQuery></ItemsQuery>;
}

export default App;
