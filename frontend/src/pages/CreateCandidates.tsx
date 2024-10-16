import React, { useEffect, useState } from "react";
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
} from "@nextui-org/react";
import { Modal } from "antd";
import { PlusIcon } from "./NextUI/PlusIcon";
import { VerticalDotsIcon } from "./NextUI/VerticalDotsIcon";

type Candidate = {
  _id: string;
  registerNumber: string;
  dob: string;
  email: string;
  phone: string;
  profilePicture: string;
};

export default function CreateCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
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

  const confirmDelete = (candidateId: string) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this candidate?",
      onOk: () => handleDelete(candidateId),
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
        setCandidates([...candidates, addedCandidate]);
      } else {
        console.error("Error adding new candidate:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving candidate:", error);
    }

    setAddVisible(false);
    setEditVisible(false);
    setProfilePictureFile(null);
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
        (candidate) => candidate.registerNumber
      );
    }
    return filteredCandidates;
  }, [candidates, filterValue]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const pages = Math.ceil(candidates.length / rowsPerPage);

  const openEditModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEditVisible(true);
  };

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
            alt={`${candidate.name} Profile`}
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
      <div className="flex flex-col gap-4 p-5">
        <Input
          isClearable
          placeholder="Search by register number..."
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={setFilterValue}
        />
        <Button
          className="bg-foreground text-background"
          endContent={<PlusIcon />}
          size="sm"
          onClick={() => setAddVisible(true)}
        >
          Add New
        </Button>
      </div>

      <Table
        aria-label="Candidates Table"
        css={{ height: "auto", width: "100%" }}
      >
        <TableHeader>
          <TableColumn>Profile</TableColumn>
          <TableColumn>Register Number</TableColumn>
          <TableColumn>Date of Birth</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Phone</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((candidate) => (
            <TableRow key={candidate.registerNumber}>
              <TableCell>
                <img
                  src={candidate.profilePicture}
                  alt={`${candidate.name} Profile`}
                  width={100}
                  height={100}
                />
              </TableCell>

              <TableCell>{candidate.registerNumber}</TableCell>
              <TableCell>{candidate.dob}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.phone}</TableCell>
              <TableCell>{renderCell(candidate, "actions")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="absolute z-50 right-10 bottom-5 py-3 px-3 bg-black shadow-md rounded-2xl flex justify-between items-center">
        <Pagination page={page} total={pages} onChange={setPage} />
      </div>

      {/* Add New Candidate Modal */}
      <Modal open={isAddVisible} onClose={() => setAddVisible(false)}>
        <Input
          label="Register Number"
          value={newCandidate.registerNumber}
          onChange={(e) =>
            setNewCandidate({ ...newCandidate, registerNumber: e.target.value })
          }
        />
        <Input
          label="Date of Birth"
          value={newCandidate.dob}
          onChange={(e) =>
            setNewCandidate({ ...newCandidate, dob: e.target.value })
          }
        />
        <Input
          label="Email"
          value={newCandidate.email}
          onChange={(e) =>
            setNewCandidate({ ...newCandidate, email: e.target.value })
          }
        />
        <Input
          label="Phone"
          value={newCandidate.phone}
          onChange={(e) =>
            setNewCandidate({ ...newCandidate, phone: e.target.value })
          }
        />
        <Input
          label="Profile Picture"
          type="file"
          onChange={(e) =>
            setProfilePictureFile(e.target.files ? e.target.files[0] : null)
          }
        />

        <Button onClick={handleSave}>Save</Button>
      </Modal>

      {/* Edit Candidate Modal */}
      <Modal open={isEditVisible} onClose={() => setEditVisible(false)}>
        {selectedCandidate && (
          <>
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
              label="Phone"
              value={selectedCandidate.phone}
              onChange={(e) =>
                setSelectedCandidate({
                  ...selectedCandidate,
                  phone: e.target.value,
                })
              }
            />
            <Input
              label="Profile Picture"
              type="file"
              onChange={(e) =>
                setProfilePictureFile(e.target.files ? e.target.files[0] : null)
              }
            />

            <Button onClick={handleEditSave}>Save</Button>
          </>
        )}
      </Modal>
    </div>
  );
}
