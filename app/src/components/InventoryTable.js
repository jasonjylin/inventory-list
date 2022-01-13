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
  ITEM_PERM_DELETE_MUTATION,
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
  const [deletedItems, setDeletedItems] = useState(queryDeletedItems);
  const [previous, setPrevious] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [permDeleteOpen, setPermDeleteOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteID, setDeleteID] = useState("");
  const [permDeleteID, setPermDeleteID] = useState("");
  const [input, setInput] = useState({ name: "", amount: "" });
  const [recoverOpen, setRecoverOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);

  const [createItem] = useMutation(ITEM_CREATE_MUTATION, {
    onCompleted() {
      props.refetch();
    },
  });
  const [editItem] = useMutation(ITEM_UPDATE_MUTATION, {
    onCompleted() {
      props.refetch();
    },
  });
  const [deleteItem] = useMutation(ITEM_DELETE_MUTATION, {
    onCompleted() {
      props.refetch();
    },
  });
  const [restoreItem] = useMutation(ITEM_RESTORE_MUTATION, {
    onCompleted() {
      props.refetch();
    },
  });
  const [permDelete] = useMutation(ITEM_PERM_DELETE_MUTATION, {
    onCompleted() {
      props.refetch();
    },
  });

  useEffect(() => {
    setRows(props.data.items);
    setDeletedItems(props.data.deletedItems);
  }, [props.data]);

  const onToggleEditMode = (id) => {
    setRows((rows) => {
      return rows.map((row) => {
        if (row.id === id) {
          return { ...row, isEditMode: !row.isEditMode };
        }
        return row;
      });
    });
  };

  const resetAmount = (id, amount) => {
    setRows((rows) => {
      return rows.map((row) => {
        if (row.id === id) {
          return { ...row, amount: amount };
        }
        return row;
      });
    });
  };

  const resetName = (id, name) => {
    setRows((rows) => {
      return rows.map((row) => {
        if (row.id === id) {
          return { ...row, name: name };
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
    if ((isNaN(amount_int) || amount_int < 0) && row.name === "") {
      handleErrorOpen(
        "Invalid amount and name input. Please input an integer >= 0 and a non-empty name."
      );
      resetAmount(row.id, previous[row.id].amount);
      resetName(row.id, previous[row.id].name);
      onToggleEditMode(row.id);
      return;
    }

    if (isNaN(amount_int) || amount_int < 0) {
      handleErrorOpen("Invalid amount input. Please input an integer >= 0.");
      resetAmount(row.id, previous[row.id].amount);
      resetName(row.id, previous[row.id].name);
      onToggleEditMode(row.id);
      return;
    }

    if (row.name === "") {
      handleErrorOpen("Invalid name input. Empty string not allowed.");
      resetAmount(row.id, previous[row.id].amount);
      resetName(row.id, previous[row.id].name);
      onToggleEditMode(row.id);
      return;
    }

    const input = {
      id: row.id,
      name: row.name,
      amount: amount_int,
    };

    editItem({ variables: input });
    onToggleEditMode(row.id);
  };

  const onDeleteSubmit = (id, message) => {
    deleteItem({ variables: { id: id, message: message } });
    var filtered = rows.filter((e) => {
      return e.id !== id;
    });
    setRows(filtered);
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
    if (input.name === "" || !(parseInt(input.amount) >= 0)) {
      handleErrorOpen("Invalid name or amount. Try again.");
      setInput({ name: "", amount: "" });
      setFormOpen(false);
      return;
    }
    createItem({
      variables: { name: input.name, amount: parseInt(input.amount) },
    });
    setInput({ name: "", amount: "" });
    setFormOpen(false);
  };

  const toggleRecover = () => {
    setRecoverOpen(!recoverOpen);
  };

  const handleRestore = (id) => {
    restoreItem({ variables: { id: id } });
  };

  const handleOpenPermDelete = (id) => {
    setPermDeleteID(id);
    setPermDeleteOpen(true);
  };

  const handleClosePermDelete = () => {
    setPermDeleteID("");
    setPermDeleteOpen(false);
  };

  const handlePermDelete = (id) => {
    permDelete({ variables: { id: id } });
    setPermDeleteID("");
    setPermDeleteOpen(false);
  };

  const handleErrorOpen = (message) => {
    setErrorMessage(message);
    setErrorOpen(true);
  };

  const handleErrorClose = () => {
    setErrorMessage("");
    setErrorOpen(false);
  };

  return (
    <div>
      <Dialog open={errorOpen} onClose={handleErrorClose}>
        <DialogTitle>{"Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleErrorClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
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
                <TableCell align="left">Deletion Message</TableCell>
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
                  <TableCell align="left">{row.name}</TableCell>
                  <TableCell align="left">{row.amount}</TableCell>
                  <TableCell align="left">{row.delete_message}</TableCell>
                  <TableCell align="left">
                    <Button onClick={() => handleRestore(row.id)}>
                      Restore
                    </Button>
                    <Button onClick={() => handleOpenPermDelete(row.id)}>
                      Perm Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={permDeleteOpen} onClose={handleClosePermDelete}>
        <DialogTitle>Permanent Deletion Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will delete this inventory item forever. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePermDelete(permDeleteID)}>
            Confirm
          </Button>
          <Button onClick={handleClosePermDelete}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
