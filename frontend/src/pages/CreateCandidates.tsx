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
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [newCandidate, setNewCandidate] = useState<Candidate>({
    registerNumber: "",
    dob: "",
    email: "",
    phone: "",
    profilePicture: "",
  });

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );

  // Fetch data from the API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          "https://taskup-backend.vercel.app/api/testCandidates"
        );
        const data = await response.json();
        setCandidates(data);

        // Create an array to hold the updated candidates with actual image URLs
        const updatedCandidates = data.map((candidate: Candidate) => {
          // Check if the candidate has a profile picture
          if (candidate.profilePicture) {
            // Construct the image URL assuming the backend serves images from /uploads folder
            const profilePictureURL = `https://taskup-backend.vercel.app/uploads/${candidate.profilePicture}`;
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
        "https://taskup-backend.vercel.app/uploadProfilePicture",
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
        "https://taskup-backend.vercel.app/api/testCandidates",
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

  const filteredItems = React.useMemo(() => {
    let filteredCandidates = [...candidates];
    if (filterValue) {
      filteredCandidates = filteredCandidates.filter((candidate) =>
        candidate.registerNumber
          .toLowerCase()
          .includes(filterValue.toLowerCase())
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
                  <VerticalDotsIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem onClick={() => openEditModal(candidate)}>
                  Edit
                </DropdownItem>
                <DropdownItem>Delete</DropdownItem>
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
    <div>
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

      <div className="py-2 px- flex justify-between items-center">
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

            <Button onClick={handleSave}>Save</Button>
          </>
        )}
      </Modal>
    </div>
  );
}
