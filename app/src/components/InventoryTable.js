import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { useMutation } from "@apollo/client";

import {
  ITEM_CREATE_MUTATION,
  ITEM_UPDATE_MUTATION,
  ITEM_DELETE_MUTATION,
  ITEM_RESTORE_MUTATION,
} from "../graphql/mutations";

import { useEffect, useState } from "react";

const CustomTableCell = ({ row, name, onChange }) => {
  const { isEditMode } = row;
  return (
    <TableCell align="left">
      {isEditMode ? (
        <Input
          value={row[name]}
          name={name}
          onChange={(e) => onChange(e, row)}
        />
      ) : (
        row[name]
      )}
    </TableCell>
  );
};

export default function InventoryTable(props) {
  const queryRows = props.data?.items ? props.data.items : [];
  const queryDeletedItems = props.data?.deletedItems
    ? props.data.deletedItems
    : [];
  const [rows, setRows] = useState(queryRows);
  const [deletedItems, setdeletedItems] = useState(queryDeletedItems);
  const [previous, setPrevious] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteID, setDeleteID] = useState("");
  const [input, setInput] = useState({ name: "", amount: "" });
  const [recoverOpen, setRecoverOpen] = useState(false);

  const [createItem] = useMutation(ITEM_CREATE_MUTATION);
  const [editItem] = useMutation(ITEM_UPDATE_MUTATION);
  const [deleteItem] = useMutation(ITEM_DELETE_MUTATION);
  const [restoreItem] = useMutation(ITEM_RESTORE_MUTATION);

  useEffect(() => {
    setRows(props.data.items);
    setdeletedItems(props.data.deletedItems);
  }, [props.data]);

  const onToggleEditMode = (id) => {
    setRows((state) => {
      return rows.map((row) => {
        if (row.id === id) {
          return { ...row, isEditMode: !row.isEditMode };
        }
        return row;
      });
    });
  };

  const onChange = (e, row) => {
    if (!previous[row.id]) {
      setPrevious((state) => ({ ...state, [row.id]: row }));
    }
    const value = e.target.value;
    const name = e.target.name;
    const { id } = row;
    const newRows = rows.map((row) => {
      if (row.id === id) {
        return { ...row, [name]: value };
      }
      return row;
    });
    setRows(newRows);
  };

  const onEditSubmit = (row) => {
    const amount_int = parseInt(row.amount);
    if (isNaN(amount_int)) {
      alert("Invalid amount integer.");
      onToggleEditMode(row.id);
      props.refetch();
      return;
    }

    const input = {
      id: row.id,
      name: row.name,
      amount: amount_int,
    };

    editItem({ variables: input });
    onToggleEditMode(row.id);
    props.refetch();
  };

  const onDeleteSubmit = (id, message) => {
    deleteItem({ variables: { id: id, message: message } });
    var filtered = rows.filter((e) => {
      return e.id !== id;
    });
    setRows(filtered);
    props.refetch();
  };

  const handleFormOpen = () => {
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleDeleteOpen = (id) => {
    setDeleteID(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteID(null);
    setDeleteOpen(false);
  };

  const handleDeleteMessage = (e) => {
    setDeleteMessage(e.target.value);
  };

  const handleDelete = () => {
    onDeleteSubmit(deleteID, deleteMessage);
    setDeleteID("");
    setDeleteMessage("");
    setDeleteOpen(false);
  };

  const handleInput = (e) => {
    const name = e.target.id;
    const newValue = e.target.value;
    setInput({ ...input, [name]: newValue });
  };

  const handleFormSubmit = () => {
    createItem({
      variables: { name: input.name, amount: parseInt(input.amount) },
    });
    setInput({ name: "", amount: "" });
    setFormOpen(false);
    props.refetch();
  };

  const toggleRecover = () => {
    setRecoverOpen(!recoverOpen);
  };

  const handleRestore = (id) => {
    restoreItem({ variables: { id: id } });
    props.refetch();
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="left">Inventory Item</TableCell>
              <TableCell align="left">Amount</TableCell>
              <TableCell align="left">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <CustomTableCell
                  {...{ row, name: "name", onChange }}
                ></CustomTableCell>
                <CustomTableCell
                  {...{ row, name: "amount", onChange }}
                ></CustomTableCell>
                <TableCell align="left">
                  {row.isEditMode ? (
                    <>
                      <Button onClick={() => onEditSubmit(row)}>Done</Button>
                    </>
                  ) : (
                    <div>
                      <Button onClick={() => onToggleEditMode(row.id)}>
                        Edit
                      </Button>
                      <Button onClick={() => handleDeleteOpen(row.id)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div
          style={{ width: "100%", textAlign: "center", marginBottom: "5px" }}
        >
          <Button variant="contained" onClick={handleFormOpen}>
            Add Inventory Item
          </Button>
          <Dialog open={formOpen} onClose={handleFormClose}>
            <DialogTitle>New Inventory Item</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Item Name"
                type="text"
                variant="standard"
                onChange={handleInput}
              />
              <TextField
                autoFocus
                margin="dense"
                id="amount"
                label="Amount"
                type="number"
                variant="standard"
                onChange={handleInput}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleFormClose}>Cancel</Button>
              <Button onClick={handleFormSubmit}>Submit</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={deleteOpen} onClose={handleDeleteClose}>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Optional delete message, leave empty for no message.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="delete"
                label="Delete Message"
                type="text"
                variant="standard"
                onChange={handleDeleteMessage}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDelete}>Delete</Button>
            </DialogActions>
          </Dialog>
        </div>
      </TableContainer>
      <Button
        style={{ width: "100%", textAlign: "center", marginBottom: "5px" }}
        onClick={toggleRecover}
      >
        {recoverOpen ? "Close" : "Restore Deleted Items"}
      </Button>
      {recoverOpen && (
        <TableContainer
          style={{ width: "75%", margin: "auto" }}
          component={Paper}
        >
          <Table sx={{ minWidth: "500px" }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell align="left">Inventory Item</TableCell>
                <TableCell align="left">Amount</TableCell>
                <TableCell align="left">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deletedItems.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <CustomTableCell
                    {...{ row, name: "name", onChange }}
                  ></CustomTableCell>
                  <CustomTableCell
                    {...{ row, name: "amount", onChange }}
                  ></CustomTableCell>
                  <TableCell align="left">
                    <Button onClick={() => handleRestore(row.id)}>
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
