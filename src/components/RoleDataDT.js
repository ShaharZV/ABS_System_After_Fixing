import React, { useState, useEffect } from "react";
import { Table, Popconfirm, Button, Space, Form, Input } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { CSVLink } from "react-csv";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import NewRole from "./NewRole";

//Main func, return the final DT of role data table
const RoleDataDT = (props) => {
  // Input validataion states
  const [typeInvalid, setTypeInvalid] = useState(false);
  const [mkrcRoleInvalid, setMkrcRoleInvalid] = useState(false);
  const [commonCommandsInvalid, setCommonCommandsInvalid] = useState(false);
  const [allCommandsInvalid, setAllCommandsInvalid] = useState(false);
  const [blockedCommandsInvalid, setBlockedCommandsInvalid] = useState(false);
  const [commonReportsInvalid, setCommonReportsInvalid] = useState(false);
  const [allReportsInvalid, setAllReportsInvalid] = useState(false);
  const [blockedReportsInvalid, setBlockedReportsInvalid] = useState(false);

  // States regarding to adding role form
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [didUserAddDataToDB, setDidUserAddDataToDB] = useState(false);

  // Import data from firestore DB states
  const [RoleData, setRoleData] = useState([]);
  const [BackUpData, setBackUpData] = useState([]);
  const dataCollectionRef = collection(db, "RoleDataDT");

  // Data Table's grid states
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRowKey, setEditRowKey] = useState("");
  const [sortedInfo, setSortedInfo] = useState({});
  const [form] = Form.useForm();
  const [searchColText, setSearchColText] = useState("");
  const [searchedCol, setSearchedCol] = useState("");
  const [filteredInfo, setFilteredInfo] = useState({});
  const [dataToExport, setDataToExport] = useState([]);
  const [emptySearchText, setEmptySearchText] = useState(false);

  // States that contains column filter options- will be changed when the table data changes
  const [filtersForID, setfiltersForID] = useState("");
  const [filtersForType, setfiltersForType] = useState("");
  const [filtersForMkrcRole, setfiltersForMkrcRole] = useState("");
  const [filtersForCommonCommands, setfiltersForCommonCommands] = useState("");
  const [filtersForAllCommands, setfiltersForAllCommands] = useState("");
  const [filtersForBlockedCommands, setfiltersForBlockedCommands] =
    useState("");
  const [filtersForCommonReports, setfiltersForCommonReports] = useState("");
  const [filtersForAllReports, setfiltersForAllReports] = useState("");
  const [filtersForBlockedReports, setfiltersForBlockedReports] = useState("");

  // Vars that will hold the selected values in special inputs
  let searchedText;

  // FUNCTIONS

  // This function will read data from DB into state
  const resetData = async () => {
    setLoading(true);
    // Read content from DB
    const data = await getDocs(dataCollectionRef);

    // Set contnet from DB into states.
    // We will filter the values from docs to only not deleted items.
    // Training data will be the state that contains the current view (filtered data)
    setRoleData(
      data.docs
        .map((doc) => ({ ...doc.data(), id: doc.id, key: doc.id }))
        .filter((element) => {
          if (element.didDelete) {
            return false;
          }
          return true;
        })
    );

    // Backup data is the state that will always contain the data from DB without changes
    setBackUpData(
      data.docs
        .map((doc) => ({ ...doc.data(), id: doc.id, key: doc.id }))
        .filter((element) => {
          if (element.didDelete) {
            return false;
          }
          return true;
        })
    );
    setDataToExport(null);
  };

  // On first load- read data from DB
  useEffect(() => {
    resetData();
  }, []);

  // When successfully readed data from DB into state, load the data in table's view
  useEffect(() => {
    loadData();
  }, [RoleData]);

  // If user added data to DB- load data again from DB, to get the updated data
  useEffect(() => {
    resetData();
    setDidUserAddDataToDB(false);
    props.setDidDataChanged(true);
  }, [didUserAddDataToDB]);

  // Load training data (state with updated data from DB) into table
  const loadData = () => {
    addFiltersValue();
    setGridData(RoleData);
    setLoading(false);
  };

  // This function will be called from "newRole", if user closed/submitted the form
  const letMeKnowFormIsDone = () => {
    setShowNewRoleForm(false);
  };

  // This function will be called if user successfully added new data to table,
  // If so- we will change the state and then the new data will be reset into table
  const letMeKnowUserAddedDataToDB = () => {
    setDidUserAddDataToDB(true);
  };

  // Each data column has filters(or search option that is based on filters), in this function
  // We will load filters values, based on all column content/values
  // We would like the filters to contain only distinct values, hence we will send values to
  // removeDuplicateFilters function.
  const addFiltersValue = () => {
    let arrayOfAllDataInColumn; //this var will contain array of object with all the filters options
    //set filters for id
    arrayOfAllDataInColumn = RoleData.map((v) => ({ text: v.id, value: v.id }));
    setfiltersForID(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for type
    arrayOfAllDataInColumn = RoleData.map((v) => ({
      text: v.type,
      value: v.type,
    }));
    setfiltersForType(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for mkrcRole
    arrayOfAllDataInColumn = RoleData.map((v) => ({
      text: v.mkrcRole,
      value: v.mkrcRole,
    }));
    setfiltersForMkrcRole(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for commonCommands
    arrayOfAllDataInColumn = RoleData.map((v) => ({
      text: v.commonCommands,
      value: v.commonCommands,
    }));
    setfiltersForCommonCommands(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for allCommands
    arrayOfAllDataInColumn = RoleData.map((v) => ({
      text: v.allCommands,
      value: v.allCommands,
    }));
    setfiltersForAllCommands(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for blockedCommands
    arrayOfAllDataInColumn = RoleData.map((v) => ({
      text: v.blockedCommands,
      value: v.blockedCommands,
    }));
    setfiltersForBlockedCommands(
      removeDuplicateFilters(arrayOfAllDataInColumn)
    );
    //set filters for type
    arrayOfAllDataInColumn = RoleData.map((v) => ({
      text: v.commonReports,
      value: v.commonReports,
    }));
    setfiltersForCommonReports(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for allReports
    arrayOfAllDataInColumn = RoleData.map((v) => ({
      text: v.allReports,
      value: v.allReports,
    }));
    setfiltersForAllReports(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for blockedReports
    arrayOfAllDataInColumn = RoleData.map((v) => ({
      text: v.blockedReports,
      value: v.blockedReports,
    }));
    setfiltersForBlockedReports(removeDuplicateFilters(arrayOfAllDataInColumn));
  };

  //This function removes duplicates values from filtering options array
  const removeDuplicateFilters = (arrayOfAllDataInColumn) => {
    let uniqueIds = []; //array will contain id only
    let uniqueDataInColumn = arrayOfAllDataInColumn.filter((element) => {
      if (element == null) {
        return false;
      }
      const isDuplicate = uniqueIds.includes(element.text);
      uniqueIds.push(element.text);
      if (!isDuplicate) {
        return true;
      }
      return false;
    });
    return uniqueDataInColumn;
  };

  // Handle Delete function, will be called when user chose to delete row in table
  const handleDelete = (value) => {
    deleteRole(value.id, value);
  };

  // Delete function, delete object from DB & from view
  const deleteRole = async (id, value) => {
    const trainDoc = doc(db, "RoleDataDT", id);
    // Delete doc from db (update field- didDelete -> true)
    let deleteUpdate = {
      didDelete: true,
    };
    await updateDoc(trainDoc, deleteUpdate);
    // Delete doc from view
    const filteredData = RoleData.filter((item) => item.id !== value.id);
    setRoleData(filteredData);
    setBackUpData(filteredData);
    setGridData(RoleData);
  };

  // This function return true/false: is this row currently in editing mode?
  const isEditing = (record) => {
    return record.key === editRowKey;
  };

  // If user press cancel button on editing mode- let's clear current editing row key
  const cancel = () => {
    setEditRowKey("");
  };

  // Custom validation to row (input of edit-from), after user submitted form
  const validateFieldsContent = (row) => {
    let isValid = true;
    // Check if input fields are not empty&  valid.
    if (row.type.length == 0) {
      isValid = false;
      setTypeInvalid(true);
    } else {
      if (
        row.type.toString().includes(".") ||
        row.type.toString().includes("+") ||
        row.type.toString().includes("-")
      ) {
        // Input is not an integer then
        isValid = false;
        setTypeInvalid(true);
      } else {
        setTypeInvalid(false);
      }
    }

    if (row.mkrcRole.length == 0) {
      isValid = false;
      setMkrcRoleInvalid(true);
    } else {
      if (
        row.mkrcRole.toString().includes(".") ||
        row.mkrcRole.toString().includes("+") ||
        row.mkrcRole.toString().includes("-")
      ) {
        // Input is not an integer then
        isValid = false;
        setMkrcRoleInvalid(true);
      } else {
        setMkrcRoleInvalid(false);
      }
    }

    if (row.commonCommands.length == 0) {
      isValid = false;
      setCommonCommandsInvalid(true);
    } else {
      if (
        // This regex will return string if the input is a valid (int, int, int,...)
        row.commonCommands.match(/^\((\d+[,]{0,1})*[\)]{0,1}$/) == null ||
        row.commonCommands == "()"
      ) {
        isValid = false;
        setCommonCommandsInvalid(true);
      } else {
        setCommonCommandsInvalid(false);
      }
    }

    if (row.allCommands.length == 0) {
      isValid = false;
      setAllCommandsInvalid(true);
    } else {
      if (
        // This regex will return string if the input is a valid (int, int, int,...)
        row.allCommands.match(/^\((\d+[,]{0,1})*[\)]{0,1}$/) == null ||
        row.allCommands == "()"
      ) {
        isValid = false;
        setAllCommandsInvalid(true);
      } else {
        setAllCommandsInvalid(false);
      }
    }

    if (row.blockedCommands.length == 0) {
      isValid = false;
      setBlockedCommandsInvalid(true);
    } else {
      if (
        row.blockedCommands.match(/^\((\d+[,]{0,1})*[\)]{0,1}$/) == null ||
        row.blockedCommands == "()"
      ) {
        isValid = false;
        setBlockedCommandsInvalid(true);
      } else {
        setBlockedCommandsInvalid(false);
      }
    }

    if (row.commonReports.length == 0) {
      isValid = false;
      setCommonReportsInvalid(true);
    } else {
      if (
        row.commonReports.match(/^\((\d+[,]{0,1})*[\)]{0,1}$/) == null ||
        row.commonReports == "()"
      ) {
        isValid = false;
        setCommonReportsInvalid(true);
      } else {
        setCommonReportsInvalid(false);
      }
    }

    if (row.allReports.length == 0) {
      isValid = false;
      setAllReportsInvalid(true);
    } else {
      if (
        row.allReports.match(/^\((\d+[,]{0,1})*[\)]{0,1}$/) == null ||
        row.allReports == "()"
      ) {
        isValid = false;
        setAllReportsInvalid(true);
      } else {
        setAllReportsInvalid(false);
      }
    }

    if (row.blockedReports.length == 0) {
      isValid = false;
      setBlockedReportsInvalid(true);
    } else {
      if (
        row.blockedReports.match(/^\((\d+[,]{0,1})*[\)]{0,1}$/) == null ||
        row.blockedReports == "()"
      ) {
        isValid = false;
        setBlockedReportsInvalid(true);
      } else {
        setBlockedReportsInvalid(false);
      }
    }

    return isValid;
  };

  // If user press save changes after editing- insert new data to DB and update view
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...RoleData];
      //find row in data
      const index = RoleData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        //Validate fields- if valid- save to DB
        if (validateFieldsContent(row)) {
          //Fields are valid! Create the new updated object from the fields input
          let newRole = {
            type: parseInt(row.type),
            mkrcRole: parseInt(row.mkrcRole),
            commonCommands: row.commonCommands,
            allCommands: row.allCommands,
            blockedCommands: row.blockedCommands,
            commonReports: row.commonReports,
            allReports: row.allReports,
            blockedReports: row.blockedReports,
            didDelete: false,
          };

          // Override old data in DB
          let roleDoc = doc(db, "RoleDataDT", item.id);
          await updateDoc(roleDoc, newRole);

          // Update item in view
          RoleData.splice(index, 1, { ...item, ...row });
          BackUpData.splice(index, 1, { ...item, ...row });
          setGridData(RoleData);
          setEditRowKey("");
          props.setDidDataChanged(true);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // If user clicked on edit- change this row to form by changing state
  const edit = (record) => {
    // Clean inputs
    form.setFieldsValue({
      id: "",
      type: "",
      mkrcRole: "",
      commonCommands: "",
      allCommands: "",
      blockedCommands: "",
      commonReports: "",
      allReports: "",
      blockedReports: "",
      ...record,
    });
    setEditRowKey(record.key);
  };

  // On table's data change- re-order by sort
  const handleChange = (_, filters, sorter) => {
    const { order, field } = sorter;
    setFilteredInfo(filters);
    setSortedInfo({ columnKey: field, order });
  };

  // Set up columns to be with filter/search/none icon
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 0, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleResetCol(clearFilters,selectedKeys, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    render: (text) =>
      searchedCol === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchColText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // This function handles search in a specific column
  const handleSearchCol = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchColText(selectedKeys[0]);
    setSearchedCol(dataIndex);
  };

  // Define all columns in table, their content, functions & sorting way
  const columns = [
    {
      title: "מזהה",
      dataIndex: "id",
      align: "center",
      sorter: (a, b) => a.id.localeCompare(b.id),
      sortOrder: sortedInfo.columnKey === "id" && sortedInfo.order,
      //...getColumnSearchProps("id"),
      filters: filtersForID,
      filteredValue: filteredInfo.id || null,
      onFilter: (value, record) => String(record.id).includes(value),
      filterSearch: true,
    },
    {
      title: "סוג",
      dataIndex: "type",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === "type" && sortedInfo.order,
      //...getColumnSearchProps("type"),
      filters: filtersForType,
      filteredValue: filteredInfo.type || null,
      onFilter: (value, record) => String(record.type).includes(value),
      filterSearch: true,
    },
    {
      title: "תפקיד MKRC",
      dataIndex: "mkrcRole",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.mkrcRole.localeCompare(b.mkrcRole),
      sortOrder: sortedInfo.columnKey === "mkrcRole" && sortedInfo.order,
      // ...getColumnSearchProps("mkrcRole"),
      filters: filtersForMkrcRole,
      filteredValue: filteredInfo.mkrcRole || null,
      onFilter: (value, record) => String(record.mkrcRole).includes(value),
      filterSearch: true,
    },
    {
      title: "פקודות נפוצות",
      dataIndex: "commonCommands",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.commonCommands.localeCompare(b.commonCommands),
      sortOrder: sortedInfo.columnKey === "commonCommands" && sortedInfo.order,
      ...getColumnSearchProps("commonCommands"),
      filters: filtersForCommonCommands,
      filteredValue: filteredInfo.commonCommands || null,
      onFilter: (value, record) =>
        String(record.commonCommands).includes(value),
    },
    {
      title: "כל הפקודות",
      dataIndex: "allCommands",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.allCommands.localeCompare(b.allCommands),
      sortOrder: sortedInfo.columnKey === "allCommands" && sortedInfo.order,
      ...getColumnSearchProps("allCommands"),
      filters: filtersForAllCommands,
      filteredValue: filteredInfo.allCommands || null,
      onFilter: (value, record) => String(record.allCommands).includes(value),
    },
    {
      title: "פקודות חסומות",
      dataIndex: "blockedCommands",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.blockedCommands.localeCompare(b.blockedCommands),
      sortOrder: sortedInfo.columnKey === "blockedCommands" && sortedInfo.order,
      ...getColumnSearchProps("blockedCommands"),
      filters: filtersForBlockedCommands,
      filteredValue: filteredInfo.blockedCommands || null,
      onFilter: (value, record) =>
        String(record.blockedCommands).includes(value),
    },
    {
      title: "דוחות נפוצים",
      dataIndex: "commonReports",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.commonReports.localeCompare(b.commonReports),
      sortOrder: sortedInfo.columnKey === "commonReports" && sortedInfo.order,
      ...getColumnSearchProps("commonReports"),
      filters: filtersForCommonReports,
      filteredValue: filteredInfo.commonReports || null,
      onFilter: (value, record) => String(record.commonReports).includes(value),
    },
    {
      title: "כל הדוחות",
      dataIndex: "allReports",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.allReports.localeCompare(b.allReports),
      sortOrder: sortedInfo.columnKey === "allReports" && sortedInfo.order,
      ...getColumnSearchProps("allReports"),
      filters: filtersForAllReports,
      filteredValue: filteredInfo.allReports || null,
      onFilter: (value, record) => String(record.allReports).includes(value),
    },
    {
      title: "דוחות חסומים",
      dataIndex: "blockedReports",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.blockedReports.localeCompare(b.blockedReports),
      sortOrder: sortedInfo.columnKey === "blockedReports" && sortedInfo.order,
      ...getColumnSearchProps("blockedReports"),
      filters: filtersForBlockedReports,
      filteredValue: filteredInfo.blockedReports || null,
      onFilter: (value, record) =>
        String(record.blockedReports).includes(value),
    },
    {
      title: "עריכה",
      dataIndex: "action",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return RoleData.length >= 1 ? (
          <Space>
            <Popconfirm
              title="האם אתה בטוח שברצונך למחוק?"
              onConfirm={() => handleDelete(record)}
            >
              {editable ? (
                ""
              ) : (
                <Button
                  danger
                  type="primary"
                  disabled={editable}
                  icon={<DeleteOutlined />}
                />
              )}
            </Popconfirm>
            {editable ? (
              <span>
                <Space size="medium">
                  <Popconfirm
                    title="האם אתה בטוח שברצונך לצאת?"
                    onConfirm={cancel}
                  >
                    <Button icon={<CloseOutlined />} type="primary" danger />
                  </Popconfirm>
                  <Button
                    icon={<SaveOutlined style={{ color: "white" }} />}
                    onClick={() => save(record.key)}
                    type="submit"
                    style={{
                      marginRight: 8,
                      background: "green",
                      borderColor: "green",
                    }}
                  />
                </Space>
              </span>
            ) : (
              <Button
                onClick={() => edit(record)}
                type="primary"
                icon={<EditOutlined />}
              />
            )}
          </Space>
        ) : null;
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editTable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // This function will return JSX component based on the column,
  // Each col will get different input field based on it's desired content & validation
  const checkType = (dataIndex, record, title, input) => {
    let editFieldJSX = "";
    switch (dataIndex) {
      case "type":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `Please input some value in ${title} field`,
                },
              ]}
            >
              <Input
                type="number"
                min="0"
                style={{ border: typeInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {typeInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "mkrcRole":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `Please input some value in ${title} field`,
                },
              ]}
            >
              <Input
                type="number"
                min="0"
                style={{ border: mkrcRoleInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {mkrcRoleInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "commonCommands":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `Please input some value in ${title} field`,
                },
              ]}
            >
              <Input
                style={{ border: commonCommandsInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {commonCommandsInvalid ? (
              <h5 style={{ color: "red" }}>
                {" "}
                {title} חייבות להיות בפרומט (int,int,...){" "}
              </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "allCommands":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `Please input some value in ${title} field`,
                },
              ]}
            >
              <Input
                style={{ border: allCommandsInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {allCommandsInvalid ? (
              <h5 style={{ color: "red" }}>
                {" "}
                {title} חייבות להיות בפרומט (int,int,...)
              </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "blockedCommands":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `Please input some value in ${title} field`,
                },
              ]}
            >
              <Input
                style={{
                  border: blockedCommandsInvalid ? "1px solid red" : "",
                }}
              />
            </Form.Item>
            {blockedCommandsInvalid ? (
              <h5 style={{ color: "red" }}>
                {" "}
                {title} חייבות להיות בפרומט (int,int,...)
              </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "commonReports":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `Please input some value in ${title} field`,
                },
              ]}
            >
              <Input
                style={{ border: commonReportsInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {commonReportsInvalid ? (
              <h5 style={{ color: "red" }}>
                {" "}
                {title} חייבים להיות בפרומט (int,int,...)
              </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "allReports":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `Please input some value in ${title} field`,
                },
              ]}
            >
              <Input
                style={{ border: allReportsInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {allReportsInvalid ? (
              <h5 style={{ color: "red" }}>
                {" "}
                {title} חייבים להיות בפרומט (int,int,...)
              </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "blockedReports":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `Please input some value in ${title} field`,
                },
              ]}
            >
              <Input
                style={{ border: blockedReportsInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {blockedReportsInvalid ? (
              <h5 style={{ color: "red" }}>
                {" "}
                {title} חייבים להיות בפרומט (int,int,...)
              </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
    }
    return editFieldJSX;
  };

  // If we are in edit mode- return form input as column content
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    children,
    ...restProps
  }) => {
    const input = <Input />;

    return (
      <td {...restProps}>
        {editing ? checkType(dataIndex, record, title, input) : children}
      </td>
    );
  };

  // This function will reset the table content, seaching & filtering
  const reset = () => {
    setSortedInfo({});
    setFilteredInfo({});
    setEmptySearchText(true);
    resetData();
  };

  // This function will be called when user clicked on "add new"
  // Based on it's change user will see the form for adding new data
  const newDataHandle = () => {
    setShowNewRoleForm(true);
  };

  // When user search text in global search, store this text
  const handleInputChange = (e) => {
    if (emptySearchText) {
      setEmptySearchText(false);
    }
    searchedText = e.target.value;
  };

  // This function handles reset of search in a specific column
  const handleResetCol = (clearFilters, selectedKeys, confirm, dataIndex) => {
    clearFilters();
    setSearchColText("");
    handleSearchCol("", confirm, dataIndex);
  };

  // Look for the text user searched in global search, and filter only rows that contains this input
  const globalSearch = () => {
    if (searchedText) {
      setRoleData(
        BackUpData.filter((value) => {
          return (
            //check if each searched data is in row in each column
            value.id
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.type
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.mkrcRole
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.commonCommands
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.allCommands
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.blockedCommands
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.commonReports
              .toString()
              .includes(searchedText.toLowerCase()) ||
            value.allReports
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.blockedReports
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase())
          );
        })
      );
    } else {
      // Search input is empty, return all data
      setRoleData(BackUpData);
    }
    setGridData(RoleData);
  };

  // Return the main table's JSX
  return (
    <div>
      <div>
        {showNewRoleForm ? (
          <NewRole
            formIsDone={letMeKnowFormIsDone}
            dataChanged={letMeKnowUserAddedDataToDB}
          />
        ) : (
          ""
        )}{" "}
      </div>
      <Space style={{ scrollMarginBottom: 16 }}>
        <Input
          placeholder="חפש תפקיד"
          onChange={handleInputChange}
          type="text"
          allowClear
          style={{
            border: "none",
            borderBottom: "1px solid ",
            marginRight: "20px",
          }}
          value={emptySearchText ? "" : searchedText}
          suffix={
            <Button
              onClick={globalSearch}
              data-testid="globalSearchInputButton" 
              type="text"
              icon={<SearchOutlined />}
            />
          }
        />
        <Button
          onClick={reset}
          icon={<ReloadOutlined />}
          data-testid="reloadDataButton" 
          type="text"
          style={{ marginRight: "20px" }}
        />
        {!showNewRoleForm ? (
          <Button
            onClick={newDataHandle}
            size="large"
            data-testid="createNewObjectInDBButton" 
            style={{ position: "absolute", left: 0, top: 0, color: "#1890ff" }}
            type="text"
          >
            צור תפקיד חדש
          </Button>
        ) : (
          ""
        )}
      </Space>
      <Form form={form} component={false}>
        <Table
          columns={mergedColumns}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          style={{ marginTop: "10px" }}
          // scroll={{
          //     x: 3300,
          //     y:6000                 }}
          dataSource={RoleData && RoleData.length ? RoleData : BackUpData}
          loading={loading}
          onChange={handleChange}
          size="small"
          tableLayout="fixed"
        />
      </Form>
      <Button
        icon={<ExportOutlined />}
        type="text"
        size="large"
        style={{ marginRight: "20px" }}
      >
        <CSVLink
          data={
            //TrainingData && TrainingData.length ? TrainingData : BackUpData
            dataToExport && dataToExport.length
              ? dataToExport
              : RoleData && RoleData.length
              ? RoleData
              : BackUpData
          }
          style={{ color: "black" }}
        >
          יצא טבלה
        </CSVLink>
      </Button>
    </div>
  );
};

export default RoleDataDT;
