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
import {
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "../firebaseConfig.ts";

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

  // Fetch data from the MongoDB API (excluding profile pictures)
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          "https://taskup-backend.vercel.app/api/testCandidates"
        );
        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };

    fetchCandidates();
  }, []);

  // Handle Image Upload
  const uploadImage = async (file: File) => {
    try {
      const storageRef = ref(storage, `profile_pictures/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Image uploaded and available at:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image: ", error);
      return "";
    }
  };

  const handleSave = async () => {
    try {
      if (isAddVisible) {
        let profilePictureURL = newCandidate.profilePicture;

        if (profilePictureFile) {
          profilePictureURL = await uploadImage(profilePictureFile);
        }

        const candidateToSave = {
          ...newCandidate,
          profilePicture: profilePictureURL,
        };

        const response = await fetch(
          "https://taskup-backend.vercel.app/api/testCandidates", // Adjust the endpoint if necessary
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
          setCandidates([...candidates, addedCandidate]); // Update the local state with the newly added candidate
        } else {
          console.error("Error adding new candidate:", response.statusText);
        }
      } else if (isEditVisible && selectedCandidate) {
        // Upload profile picture to Firebase if a file is selected
        let profilePictureURL = selectedCandidate.profilePicture;
        if (selectedCandidate.profilePicture instanceof File) {
          profilePictureURL = await uploadImage(
            selectedCandidate.profilePicture
          );
        }

        const updatedCandidate = {
          ...selectedCandidate,
          profilePicture: profilePictureURL,
        };

        const response = await fetch(
          `https://taskup-backend.vercel.app/api/testCandidates/${selectedCandidate.registerNumber}`, // Assuming registerNumber is the unique ID
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedCandidate),
          }
        );
        if (response.ok) {
          const candidate = await response.json();
          setCandidates((prev) =>
            prev.map((c) =>
              c.registerNumber === candidate.registerNumber ? candidate : c
            )
          );
        } else {
          console.error("Error updating candidate:", response.statusText);
        }
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
          <ProfilePictureCell profilePictureRef={candidate.profilePicture} />
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
                <ProfilePictureCell
                  profilePictureRef={candidate.profilePicture}
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

type ProfilePictureCellProps = {
  profilePictureRef: string;
};

const ProfilePictureCell: React.FC<ProfilePictureCellProps> = ({
  profilePictureRef,
}) => {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");

  // Fetch profile picture from Firebase storage based on storage reference
  const fetchProfilePictureUrl = async (profilePictureRef: string) => {
    try {
      const storageRef = ref(storage, profilePictureRef);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      return "fallback-image-url";
    }
  };

  // Change the function call in the ProfilePictureCell component:
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (profilePictureRef && !profilePictureRef.startsWith("http")) {
        // Check for both http and https
        const url = await fetchProfilePictureUrl(profilePictureRef); // Fetch URL from Firebase storage
        setProfilePictureUrl(url);
      } else {
        setProfilePictureUrl(profilePictureRef); // If it's a valid URL, set it directly
      }
    };

    fetchProfilePicture();
  }, [profilePictureRef]);

  console.log("Profile picture ref:", profilePictureRef);

  return (
    <img
      src={profilePictureUrl || "fallback-image-url"}
      alt="Profile"
      style={{
        width: "50px",
        height: "50px",
        objectFit: "cover",
        borderRadius: "50%",
      }}
    />
  );
};
