import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Input, Modal, Form, message } from "antd";
import axios from "axios";

const CreateCandidates = () => {
  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editCandidateId, setEditCandidateId] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Fetch candidates
  // const fetchCandidates = async () => {
  //   try {

  //   } catch (error) {
  //     return message.error("Error fetching candidates.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const response = await axios.get(
      "https://taskup-backend.vercel.app/api/testCandidates"
    );
    setCandidatesList(response.data);
    setPagination({
      ...pagination,
      total: response.data.length,
    });
    setLoading(false);
  }, [pagination]);

  // Handle table change for pagination and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
    // Sorting functionality can be applied here if needed
  };

  // Delete candidate
  const handleDelete = async (candidateId) => {
    try {
      await axios.delete(
        `https://taskup-backend.vercel.app/api/testCandidates/${candidateId}`
      );
      message.success("Candidate deleted successfully!");
      await fetchCandidates();
    } catch (error) {
      message.error("Error deleting candidate.");
    }
  };

  // Edit candidate
  const handleEdit = (candidate) => {
    form.setFieldsValue(candidate);
    setEditCandidateId(candidate._id);
    setIsModalVisible(true);
  };

  // Update candidate
  const handleUpdateCandidate = async () => {
    try {
      await axios.put(
        `https://taskup-backend.vercel.app/api/testCandidates/${editCandidateId}`,
        form.getFieldsValue()
      );
      message.success("Candidate updated successfully!");
      fetchCandidates();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Error updating candidate.");
    }
  };

  // Add new candidate
  const handleAddCandidate = async () => {
    try {
      await axios.post(
        "https://taskup-backend.vercel.app/api/testCandidates",
        form.getFieldsValue()
      );
      message.success("Candidate added successfully!");
      fetchCandidates();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Error adding candidate.");
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const columns = [
    {
      title: "Register Number",
      dataIndex: "registerNumber",
      key: "registerNumber",
      sorter: (a, b) => a.registerNumber.localeCompare(b.registerNumber),
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      key: "dob",
      sorter: (a, b) => new Date(a.dob) - new Date(b.dob),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add New Candidate
        </Button>
        <Input.Search
          placeholder="Search candidates"
          style={{ width: 300, marginLeft: 16 }}
          onSearch={(value) => {
            const filteredData = candidatesList.filter((candidate) =>
              candidate.email.toLowerCase().includes(value.toLowerCase())
            );
            setCandidatesList(filteredData);
          }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={candidatesList}
        loading={loading}
        rowKey="_id"
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editCandidateId ? "Edit Candidate" : "Add Candidate"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={editCandidateId ? handleUpdateCandidate : handleAddCandidate}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="registerNumber"
            label="Register Number"
            rules={[
              { required: true, message: "Please input the register number!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dob"
            label="Date of Birth"
            rules={[
              { required: true, message: "Please input the date of birth!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input the email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please input the phone number!" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateCandidates;
