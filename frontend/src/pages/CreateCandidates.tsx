import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Checkbox,
} from "@nextui-org/react";
import { Modal, Upload } from "antd";
import { PlusIcon } from "./NextUI/PlusIcon.jsx";
import { VerticalDotsIcon } from "./NextUI/VerticalDotsIcon";
import { SearchIcon } from "./NextUI/SearchIcon.jsx";
import * as XLSX from "xlsx";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

type Candidate = {
  _id: string;
  registerNumber: string;
  dob: string;
  email: string;
  phone: string;
  profilePicture: string;
};

const reorderColumns = (columns, fromIndex, toIndex) => {
  const reordered = [...columns];
  const [movedColumn] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, movedColumn);
  return reordered;
};

export default function CreateCandidates() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isImportVisible, setImportVisible] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filterValue, setFilterValue] = useState("");
  // Retrieve stored values or default to 1 for page and 5 for rows per page
  const storedPage = localStorage.getItem("page");
  const storedRowsPerPage = localStorage.getItem("rowsPerPage");

  const [columns, setColumns] = useState([
    { id: "email", label: "Email" },
    { id: "registerNumber", label: "Register Number" },
    { id: "dob", label: "Date of Birth" },
    { id: "phone", label: "Phone" },
  ]);

  const [page, setPage] = useState<number>(storedPage ? Number(storedPage) : 1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(
    storedRowsPerPage ? Number(storedRowsPerPage) : 5
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAddVisible, setAddVisible] = useState(false);
  const [isEditVisible, setEditVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>({
    _id: "",
    registerNumber: "",
    dob: "",
    email: "",
    phone: "",
    profilePicture: "",
  });
  const [newCandidate, setNewCandidate] = useState<Candidate>({
    _id: "",
    registerNumber: "",
    dob: "",
    email: "",
    phone: "",
    profilePicture: "",
  });

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );

  console.log(selectedItems);

  const confirmDelete = (candidateId: string) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this candidate?",
      onOk: () => handleDelete(candidateId),
    });
  };

  const confirmDeleteSelected = (candidateId: string) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this candidate?",
      onOk: () => handleDeleteSelected(candidateId),
    });
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          "http://localhost:20000/api/testCandidates"
        );
        const data = await response.json();
        setCandidates(data);
        setSelectedItems(data);

        // Create an array to hold the updated candidates with actual image URLs
        const updatedCandidates = data.map((candidate: Candidate) => {
          // Check if the candidate has a profile picture
          if (candidate.profilePicture) {
            // Construct the image URL assuming the backend serves images from /uploads folder
            const profilePictureURL = `http://localhost:20000/uploads/${candidate.profilePicture}`;
            console.log(
              `Candidate ${candidate.registerNumber} Profile Picture:`,
              profilePictureURL
            );

            // Return the candidate object with the updated profilePicture URL
            return {
              ...candidate,
              profilePicture: profilePictureURL,
            };
          }

          // If no profile picture, return the candidate as is
          return candidate;
        });

        // Update the state with the modified candidates
        setCandidates(updatedCandidates);
      } catch (error) {
        console.error(
          "Error fetching candidates or their profile pictures:",
          error
        );
      }
    };

    fetchCandidates();
  }, []);

  // Handle Image Upload
  const uploadImage = async (file: File) => {
    try {
      // Form data to send the image to the backend
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(
        "http://localhost:20000/uploadProfilePicture",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.url; // Return the URL from Cloudinary
      } else {
        throw new Error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image: ", error);
      return "";
    }
  };

  const refreshCandidates = async () => {
    const response = await fetch("http://localhost:20000/api/testCandidates");
    const data = await response.json();
    setCandidates(data);
  };

  // Check if any field is filled
  const isFormValid = Object.values(newCandidate).some(
    (field) => field.trim() !== ""
  );

  const isEditFormValid = Object.values(selectedCandidate).some(
    (field) => field.trim() !== ""
  );

  const handleSave = async () => {
    try {
      let profilePictureURL = newCandidate.profilePicture;

      if (profilePictureFile) {
        profilePictureURL = await uploadImage(profilePictureFile);
      }

      const candidateToSave = {
        ...newCandidate,
        profilePicture: profilePictureURL,
      };

      const response = await fetch(
        "http://localhost:20000/api/testCandidates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(candidateToSave),
        }
      );

      if (response.ok) {
        const addedCandidate = await response.json();

        // Make sure the new candidate has a profile picture URL if applicable
        if (addedCandidate.profilePicture) {
          addedCandidate.profilePicture = `http://localhost:20000/uploads/${addedCandidate.profilePicture}`;
        }

        // Update state by adding the new candidate to the list without requiring a page refresh
        setCandidates((prevCandidates) => [...prevCandidates, addedCandidate]);
        await refreshCandidates();
        // Clear the form fields after saving
        setNewCandidate({
          _id: "",
          registerNumber: "",
          dob: "",
          email: "",
          phone: "",
          profilePicture: "",
        });
      } else {
        console.error("Error adding new candidate:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving candidate:", error);
    }

    setAddVisible(false);
    setProfilePictureFile(null);
  };

  const convertExcelDateToISO = (excelDate) => {
    // Adjust for Excel's 1900-based system and handle leap year bug
    const daysSinceBase = excelDate - 25569; // Excel's base date starts at 1900-01-01

    // Convert to JavaScript's time (milliseconds since 1970-01-01)
    const date = new Date(daysSinceBase * 86400 * 1000); // 86400 seconds in a day

    // Format the date as "DD/MM/YYYY"
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleFileUpload = async (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const abuf = e.target.result;
      const wb = XLSX.read(abuf, { type: "array" });

      // Get the first sheet data
      const ws = wb.Sheets[wb.SheetNames[0]];

      // Parse the sheet into JSON format
      let candidateData = XLSX.utils.sheet_to_json(ws);

      // Convert the dob and phone to correct formats
      // Convert the dob, phone, and convert email and registerNumber to lowercase
      candidateData = candidateData.map((row) => ({
        ...row,
        dob: row.dob ? convertExcelDateToISO(row.dob) : null, // Convert dob if it exists
        phone: row.phone ? row.phone.toString().toLowerCase() : "", // Ensure phone is a string and lowercase
        email: row.email ? row.email.toLowerCase() : "", // Convert email to lowercase
        registerNumber: row.registerNumber
          ? row.registerNumber.toUpperCase()
          : "", // Convert registerNumber to lowercase
      }));

      console.log(candidateData); // Check the parsed data

      // Validate if data contains the required columns
      const requiredColumns = ["email", "registerNumber", "dob", "phone"];
      const isValid = candidateData.every((row) =>
        requiredColumns.every(
          (col) => row[col] && row[col].toString().trim() !== ""
        )
      );

      if (isValid) {
        await importCandidatesToDB(candidateData); // Send to backend API
      } else {
        alert(
          "Invalid file format. Ensure there are 4 columns: registerNumber, dob, email, phone."
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to send the candidate data to the backend for import
  const importCandidatesToDB = async (candidateData) => {
    try {
      const response = await fetch(
        "http://localhost:20000/api/importCandidates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ candidates: candidateData }), // Send candidate data as JSON
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Show success message
      } else {
        alert("Failed to import candidates.");
      }
    } catch (error) {
      console.error("Error uploading candidates:", error);
      alert("An error occurred while uploading candidates.");
    }
  };

  const handleDelete = async (candidateId: string) => {
    try {
      const response = await fetch(
        `http://localhost:20000/api/testCandidates/${candidateId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedCandidates = candidates.filter(
          (candidate) => candidate._id !== candidateId
        );
        setCandidates(updatedCandidates); // Update the list of candidates after deletion
        console.log("Candidate deleted successfully");
      } else {
        const errorData = await response.text();
        console.error("Error deleting candidate:", errorData);
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  const handleEditSave = async () => {
    try {
      // Prepare the form data to include candidate details and profile picture
      const formData = new FormData();
      formData.append("registerNumber", selectedCandidate.registerNumber);
      formData.append("dob", selectedCandidate.dob);
      formData.append("email", selectedCandidate.email);
      formData.append("phone", selectedCandidate.phone);

      // Add profile picture to form data if a new file is uploaded
      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      const response = await fetch(
        `http://localhost:20000/api/testCandidates/${selectedCandidate._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      // Check if the response is okay
      if (response.ok) {
        const contentType = response.headers.get("Content-Type");

        if (contentType && contentType.includes("application/json")) {
          const updatedData = await response.json();

          // Check if the response contains a success message and updated candidate data
          if (updatedData.message === "Candidate updated successfully") {
            // Update the candidate in the candidates list
            const updatedCandidates = candidates.map((candidate) =>
              candidate._id === updatedData.candidate._id
                ? updatedData.candidate
                : candidate
            );

            setCandidates(updatedCandidates);
            setEditVisible(false);
            setProfilePictureFile(null);
          }
        } else {
          const responseText = await response.text();
          console.error("Unexpected response format:", responseText);
        }
      } else {
        const errorData = await response.json();
        console.error("Error updating candidate:", errorData.message);
      }
    } catch (error) {
      console.error("Error updating candidate:", error);
    }
  };

  const filteredItems = React.useMemo(() => {
    let filteredCandidates = [...candidates];
    if (filterValue) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) =>
          candidate.registerNumber
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          candidate.dob.toLowerCase().includes(filterValue.toLowerCase()) ||
          candidate.email.toLowerCase().includes(filterValue.toLowerCase()) ||
          candidate.phone.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredCandidates;
  }, [candidates, filterValue]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  // Infinite pagination: No maximum page, just render more items as necessary
  const totalItems = filteredItems.length;
  // Dynamically calculating the number of pages
  const pages = Math.ceil(totalItems / rowsPerPage) || 1;

  const openEditModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEditVisible(true);
  };

  // Save to localStorage whenever page or rowsPerPage changes
  useEffect(() => {
    localStorage.setItem("page", String(page));
    localStorage.setItem("rowsPerPage", String(rowsPerPage));
  }, [page, rowsPerPage]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  // Function to handle individual row selection
  const handleSelectRow = (registerNumber) => {
    if (selectedRows.includes(registerNumber)) {
      // Deselect if already selected
      setSelectedRows(selectedRows.filter((row) => row !== registerNumber));
    } else {
      // Add the row to the selected ones
      setSelectedRows([...selectedRows, registerNumber]);
    }
  };

  const handleReorder = (fromIndex, toIndex) => {
    const updatedColumns = reorderColumns(columns, fromIndex, toIndex);
    setColumns(updatedColumns);
  };

  // Function to handle "Select All" checkbox in the header
  const handleSelectAll = () => {
    if (areAllRowsSelected) {
      // If all rows are selected, clear selection
      setSelectedRows([]);
    } else {
      // Select all rows on the current page
      const allRegisterNumbers = items.map((item) => item.registerNumber);
      setSelectedRows(allRegisterNumbers);
    }
  };

  // Function to handle "Delete Selected" candidates
  const handleDeleteSelected = async () => {
    // Loop over selected rows and delete each candidate from the server
    for (const registerNumber of selectedRows) {
      try {
        // Find the candidate to delete
        const candidateToDelete = candidates.find(
          (candidate) => candidate.registerNumber === registerNumber
        );

        if (candidateToDelete) {
          const response = await fetch(
            `http://localhost:20000/api/testCandidates/${candidateToDelete._id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            console.log(
              `Candidate with Register Number ${registerNumber} deleted successfully`
            );
          } else {
            const errorData = await response.text();
            console.error("Error deleting candidate:", errorData);
          }
        }
      } catch (error) {
        console.error("Error deleting candidate:", error);
      }
    }

    // Filter out the deleted rows from the `candidates` state
    const remainingCandidates = candidates.filter(
      (candidate) => !selectedRows.includes(candidate.registerNumber)
    );
    setCandidates(remainingCandidates); // Update the candidates state
    setSelectedRows([]); // Clear selected rows after deletion
  };

  // Check if all rows are selected
  const areAllRowsSelected = useMemo(() => {
    return items.length > 0 && selectedRows.length === items.length;
  }, [selectedRows, items]);

  const renderCell = (candidate: Candidate, columnKey: React.Key) => {
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <VerticalDotsIcon width={undefined} height={undefined} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem onClick={() => openEditModal(candidate)}>
                  Edit
                </DropdownItem>
                <DropdownItem onClick={() => confirmDelete(candidate._id)}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      case "profilePicture":
        return (
          <img
            src={candidate.profilePicture}
            alt={"Profile"}
            width={100}
            height={100}
          />
        );
      default:
        return candidate[columnKey as keyof Candidate];
    }
  };

  return (
    <div className="overflow-y-scroll h-full">
      <div className="flex justify-between gap-4 pt-5 px-5">
        <Input
          isClearable
          placeholder="Search candidate..."
          value={filterValue}
          startContent={<SearchIcon className="text-default-300" />}
          variant="bordered"
          classNames={{
            base: "w-full",
            inputWrapper: "border-1",
          }}
          onClear={() => setFilterValue("")}
          onValueChange={setFilterValue}
          className="w-[60%]"
        />
        {/* Button to reorder columns */}
        <div className="flex mb-4">
          {columns.length > 1 && (
            <Button
              onClick={() => handleReorder(0, 4)}
              size="sm"
              className="mr-3 h-9 bg-neutral-300"
            >
              Reorder Columns
            </Button>
          )}
          <Button
            onClick={() => setImportVisible(true)}
            size="sm"
            className="mr-2 h-9 bg-neutral-300"
          >
            Import Candidates
          </Button>
          <Button
            className="bg-foreground text-background"
            endContent={<PlusIcon width={undefined} height={undefined} />}
            size="md"
            onClick={() => setAddVisible(true)}
          >
            Add New
          </Button>
        </div>
      </div>

      <Modal
        open={isImportVisible}
        onCancel={() => setImportVisible(false)}
        footer={null}
        closable={false}
      >
        <h2>Import Candidates</h2>
        <Dragger
          beforeUpload={handleFileUpload}
          multiple={false}
          accept=".xls, .xlsx, .csv"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Only .xls, .xlsx, .csv files are allowed
          </p>
        </Dragger>
      </Modal>

      <div className="flex justify-between items-center h-[50px] px-5">
        {selectedRows.length > 0 ? (
          <Button
            className="bg-foreground px-6 text-background"
            disabled={selectedRows.length === 0}
            onClick={confirmDeleteSelected}
          >
            Delete Selected Rows
          </Button>
        ) : (
          <>
            <div className="w-[300px]">
              <span className="text-default-400 text-small">
                Total {filteredItems.length} Candidates
              </span>
            </div>
          </>
        )}
        <div className="flex w-full justify-end items-center">
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent cursor-pointer outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="10000000000000000000000000000">All</option>
            </select>
          </label>
        </div>
      </div>

      <Table aria-label="Candidates Table" className="p-5">
        <TableHeader>
          <TableColumn>
            <Checkbox
              color="default"
              isSelected={areAllRowsSelected}
              onChange={handleSelectAll}
              aria-label="Select all rows"
            />
          </TableColumn>
          <TableColumn>S.No</TableColumn>

          {/* Dynamically rendering columns based on state */}
          {columns.map((col) => (
            <TableColumn key={col.id}>{col.label}</TableColumn>
          ))}
          <TableColumn>Actions</TableColumn>
        </TableHeader>

        <TableBody>
          {items.map((candidate, index) => (
            <TableRow
              key={candidate.registerNumber}
              className="hover:bg-neutral-100 transition-colors duration-100"
            >
              <TableCell>
                <Checkbox
                  color="default"
                  isSelected={selectedRows.includes(candidate.registerNumber)}
                  onChange={() => handleSelectRow(candidate.registerNumber)}
                />
              </TableCell>
              <TableCell>{index + 1}</TableCell>

              {/* Dynamically render columns based on order */}
              {columns.map((col) => (
                <TableCell key={col.id}>{candidate[col.id]}</TableCell>
              ))}

              <TableCell>{renderCell(candidate, "actions")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pages > 1 && (
        <div className="z-50 px-5 w-[calc(100vw-280px)] absolute right-0 bottom-5 flex justify-between items-center">
          <span className="text-small text-default-400">
            {selectedRows.length === items.length
              ? "All items selected"
              : `${selectedRows.length} of ${items.length} selected`}
          </span>
          <Pagination
            page={page}
            total={pages}
            onChange={(newPage) => setPage(newPage)}
            isCompact
            size="md"
            showControls={true}
            classNames={{
              cursor: "bg-black text-white font-bold",
            }}
          />
        </div>
      )}
      {/* Add New Candidate Modal */}
      <Modal open={isAddVisible} closable={false} footer={null}>
        <div className="flex flex-col justify-between gap-3">
          <h1 className="poppins2 text-[25px]">Create Candidate</h1>

          <Input
            className="h-12"
            label="Email"
            value={newCandidate.email}
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, email: e.target.value })
            }
          />
          <Input
            className="h-12"
            label="Register Number"
            value={newCandidate.registerNumber}
            onChange={(e) =>
              setNewCandidate({
                ...newCandidate,
                registerNumber: e.target.value,
              })
            }
          />
          <Input
            className="h-12"
            label="Date of Birth"
            value={newCandidate.dob}
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, dob: e.target.value })
            }
          />
          <Input
            className="h-12"
            label="Phone"
            value={newCandidate.phone}
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, phone: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={() => setAddVisible(false)}>Close</Button>
          <Button
            color="primary"
            onClick={handleSave}
            disabled={!isFormValid} // Disable if form is not filled
          >
            Save
          </Button>
        </div>
      </Modal>
      {/* Edit Candidate Modal */}
      <Modal open={isEditVisible} closable={false} footer={null}>
        {selectedCandidate && (
          <div className="flex flex-col justify-between gap-3">
            <h1 className="poppins2 text-[25px]">Edit Candidate</h1>

            <Input
              label="Email"
              value={selectedCandidate.email}
              onChange={(e) =>
                setSelectedCandidate({
                  ...selectedCandidate,
                  email: e.target.value,
                })
              }
            />
            <Input
              label="Register Number"
              value={selectedCandidate.registerNumber}
              onChange={(e) =>
                setSelectedCandidate({
                  ...selectedCandidate,
                  registerNumber: e.target.value,
                })
              }
            />
            <Input
              label="Date of Birth"
              value={selectedCandidate.dob}
              onChange={(e) =>
                setSelectedCandidate({
                  ...selectedCandidate,
                  dob: e.target.value,
                })
              }
            />
            <Input
              label="Phone"
              value={selectedCandidate.phone}
              onChange={(e) =>
                setSelectedCandidate({
                  ...selectedCandidate,
                  phone: e.target.value,
                })
              }
            />
            {/* <Input
              label="Profile Picture"
              type="file"
              onChange={(e) =>
                setProfilePictureFile(e.target.files ? e.target.files[0] : null)
              }
            /> */}

            <div className="flex justify-end mt-6 gap-3">
              <Button onClick={() => setEditVisible(false)}>Close</Button>
              <Button
                color="primary"
                onClick={handleEditSave}
                disabled={!isEditFormValid}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
