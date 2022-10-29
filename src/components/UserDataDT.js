//Imports
import React, { useState, useEffect } from "react";
import { Table, Button, Space, Form, Input, Select } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { CSVLink } from "react-csv";
import { db } from "../firebase-config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import SelectExerciseAndRole from "./SelectExerciseAndRole";
import ButtonsInEditColumn from "./ButtonsInEditColumn";
import ExportTableButton from "./ExportTableButton";
import AboveTableComponents from "./AboveTableComponents";

// Main func, return the final DT of user's data table
const UserDataDT = (props) => {
  // Input validataion states
  const [exerciseIdInvalid, setExerciseIdInvalid] = useState(false);
  const [roleIdInvalid, setRoleIdInvalid] = useState(false);
  const [userNameInvalid, setUserNameInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [canDebriefInvalid, setCanDebriefInvalid] = useState(false);
  const [dsPublishNameInvalid, setDsPublishNameInvalid] = useState(false);

  // Data Table's grid states
  const [dataForExerciseOptions, setDataForExerciseOptions] = useState([]);
  const [dataForRoleOptions, setDataForRoleOptions] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRowKey, setEditRowKey] = useState("");
  const [emptySearchText, setEmptySearchText] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});
  const [form] = Form.useForm();
  const [searchColText, setSearchColText] = useState("");
  const [searchedCol, setSearchedCol] = useState("");
  const [filteredInfo, setFilteredInfo] = useState({});
  const { Option, OptGroup } = Select;
  let [filteredData] = useState();
  const [dataToExport, setDataToExport] = useState([]);

  // Import data from firestore DB states
  const [UserData, setUserData] = useState([]);
  const [BackUpData, setBackUpData] = useState([]);
  const dataCollectionRef = collection(db, "UserDataDT");
  const exerciseDataCollectionRef = collection(db, "TrainingDataDT");
  const roleDataCollectionRef = collection(db, "RoleDataDT");

  // States that contains column filter options- will be changed when the table data changes
  const [filtersForUserId, setfiltersForUserId] = useState("");
  const [filtersForExerciseId, setfiltersForExerciseId] = useState("");
  const [filtersForRoleID, setfiltersForRoleID] = useState("");
  const [filtersForUserName, setfiltersForUserName] = useState("");
  const [filtersForPassword, setfiltersForPassword] = useState("");
  const [filtersForCanDebrief, setfiltersForCanDebrief] = useState("");
  const [filtersForDsPublishName, setfiltersForDsPublishName] = useState("");

  // States regarding to adding exercise form
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [didUserAddDataToDB, setDidUserAddDataToDB] = useState(false);

  // Vars that will hold the selected values in special inputs
  let selectedExercise;
  let selectedRole;
  let searchedText;

  // FUNCTIONS

  // This function will read data from DB into state
  const resetData = async () => {
    try {
      setLoading(true);
      // Read content from DB
      const data = await getDocs(dataCollectionRef);
      // Set contnet from DB into states.
      // We will filter the values from docs to only not deleted items.
      // user data will be the state that contains the current view (filtered data)
      setUserData(
        data.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
            key: doc.id,
            canDebrief:
              doc.data().canDebrief.toString() == "true" ? "כן" : "לא",
          }))
          .filter((element) => {
            if (element.didDelete) {
              return false;
            }
            return true;
          })
      );

      setBackUpData(
        data.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
            key: doc.id,
            canDebrief: doc.data().canDebrief.toString(),
          }))
          .filter((element) => {
            if (element.didDelete) {
              return false;
            }
            return true;
          })
      );
    } catch (error) {
      console.log("error", error);
    }

    // Get data for <Select> of exercise ID
    const dataForSelectExercise = await getDocs(exerciseDataCollectionRef);
    setDataForExerciseOptions(
      dataForSelectExercise.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          key: doc.id,
        }))
        .filter((element) => {
          if (element.didDelete) {
            return false;
          }
          return true;
        })
    );
    // Get data for <Select> of role ID
    const dataForSelectRole = await getDocs(roleDataCollectionRef);
    setDataForRoleOptions(
      dataForSelectRole.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          key: doc.id,
        }))
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

  // If user changed the data in different tab- reload the data in this tab too
  useEffect(() => {
    // if need to reset data because of a change in DB in different table (didDataChanged == true)
    if (props.didDataChangedState) {
      resetData();
      props.setDidDataChanged(false);
    }
  }, [props.didDataChangedState]);

  // When successfully readed data from DB into state, load the data in table's view
  useEffect(() => {
    loadData();
  }, [UserData]);

  // If user added data to DB- load data again from DB, to get the updated data
  useEffect(() => {
    resetData();
    setDidUserAddDataToDB(false);
  }, [didUserAddDataToDB]);

  //load user data into table
  const loadData = () => {
    addFiltersValue();
    setGridData(UserData);
    setLoading(false);
  };

  // This function will be called from "newUser", if user closed/submitted the form
  const letMeKnowFormIsDone = () => {
    setShowNewUserForm(false);
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
    //set filters for user id
    arrayOfAllDataInColumn = UserData.map((v) => ({
      text: v.userId,
      value: v.userId,
    }));
    setfiltersForUserId(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for exerciseId
    arrayOfAllDataInColumn = UserData.map((v) => ({
      text: v.exerciseId,
      value: v.exerciseId,
    }));
    setfiltersForExerciseId(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for roleId
    arrayOfAllDataInColumn = UserData.map((v) => ({
      text: v.roleId,
      value: v.roleId,
    }));
    setfiltersForRoleID(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for userName
    arrayOfAllDataInColumn = UserData.map((v) => ({
      text: v.userName,
      value: v.userName,
    }));
    setfiltersForUserName(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for password
    arrayOfAllDataInColumn = UserData.map((v) => ({
      text: v.password,
      value: v.password,
    }));
    setfiltersForPassword(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for canDebrief
    arrayOfAllDataInColumn = UserData.map((v) => ({
      text: v.canDebrief.toString(),
      value: v.canDebrief.toString(),
    }));
    setfiltersForCanDebrief(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for dsPublishName
    arrayOfAllDataInColumn = UserData.map((v) => ({
      text: v.dsPublishName,
      value: v.dsPublishName,
    }));
    setfiltersForDsPublishName(removeDuplicateFilters(arrayOfAllDataInColumn));
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
    deleteUser(value.id, value);
  };

  // Delete function, delete object from DB & from view
  const deleteUser = async (id, value) => {
    try {
      const userDoc = doc(db, "UserDataDT", id);
      // Delete doc from db (update field- didDelete -> true)
      let deleteUpdate = {
        didDelete: true,
      };
      await updateDoc(userDoc, deleteUpdate);
      // Delete doc from view
      const filteredData = UserData.filter((item) => item.id !== value.id);
      setUserData(filteredData);
      setBackUpData(filteredData);
      setGridData(UserData);
    } catch (error) {
      console.log("error", error);
    }
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
    try {
      let isValid = true;
      //Check if input fields are not empty&  valid.
      if (row.exerciseId.length == 0) {
        isValid = false;
        setExerciseIdInvalid(true);
      } else {
        setExerciseIdInvalid(false);
      }

      if (row.roleId.length == 0) {
        isValid = false;
        setRoleIdInvalid(true);
      } else {
        if (checkIfRoleExerciseAlreadyExists(row)) {
          isValid = false;
          setRoleIdInvalid(true);
        } else {
          setRoleIdInvalid(false);
        }
      }
      if (row.userName.length == 0) {
        isValid = false;
        setUserNameInvalid(true);
      } else {
        setUserNameInvalid(false);
      }

      if (row.password.length == 0) {
        isValid = false;
        setPasswordInvalid(true);
      } else {
        setPasswordInvalid(false);
      }

      if (row.canDebrief.length == 0) {
        isValid = false;
        setCanDebriefInvalid(true);
      } else {
        setCanDebriefInvalid(false);
      }

      if (row.dsPublishName.length == 0) {
        isValid = false;
        setDsPublishNameInvalid(true);
      } else {
        setDsPublishNameInvalid(false);
      }
      return isValid;
    } catch (error) {
      console.log("error", error);
    }
  };

  // If user press save changes after editing- insert new data to DB and update view
  const save = async (key) => {
    try {
      //get row content from saved edit form fields
      const row = await form.validateFields();
      const newData = [...UserData];

      const index = UserData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        row["id"] = item.id;
        if (selectedRole == null) {
          row["roleId"] = item.roleId;
        } else {
          row["roleId"] = selectedRole;
        }
        if (selectedExercise == null) {
          row["exerciseId"] = item.exerciseId;
        } else {
          row["exerciseId"] = selectedExercise;
        }
        row["userId"] = item.userId;

        selectedRole = "";
        selectedExercise = "";
        if (validateFieldsContent(row)) {
          //create the new updated object from the fields input
          let newUser = {
            userId: item.userId,
            exerciseId: row.exerciseId,
            roleId: row.roleId,
            userName: row.userName,
            password: row.password,
            canDebrief: row.canDebrief.toLowerCase() == "כן" ? true : false,
            dsPublishName: row.dsPublishName,
            didDelete: false,
          };

          //override old data in DB
          let userDoc = doc(db, "UserDataDT", item.id);
          await updateDoc(userDoc, newUser);

          //update item in view
          UserData.splice(index, 1, { ...item, ...row });
          BackUpData.splice(index, 1, { ...item, ...row });
          setGridData(UserData);
          setEditRowKey("");
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // If user clicked on edit- change this row to form by changing state
  const edit = (record) => {
    form.setFieldsValue({
      // Clean inputs
      userId: "",
      exerciseId: "",
      roleId: "",
      userName: "",
      password: "",
      canDebrief: "",
      dsPublishName: "",
      ...record,
    });
    setEditRowKey(record.key);
  };

  // On table's data change- re-order by sort
  const handleChange = (_, filters, sorter, extra) => {
    setDataToExport(extra.currentDataSource);
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
            onClick={() =>
              handleResetCol(clearFilters, selectedKeys, confirm, dataIndex)
            }
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

  // This function handles reset of search in a specific column
  const handleResetCol = (clearFilters, selectedKeys, confirm, dataIndex) => {
    clearFilters();
    setSearchColText("");
    handleSearchCol("", confirm, dataIndex);
  };

  // This function checks if this user is already set to this exercise in this role- if so -> return true
  const checkIfRoleExerciseAlreadyExists = (row) => {
    let combExistsObjInArray = BackUpData.find(
      (item) =>
        item.userId == row.userId &&
        item.exerciseId == row.exerciseId &&
        item.roleId == row.roleId &&
        item.id != row.id
    );
    if (combExistsObjInArray) {
      //The combination exists! can't add it again
      return true;
    }
    return false;
  };

  // This function is called from the SelectRole& Exercise component,
  // And set chosen option in this component
  const setSelectedExerciseAndRole = (id, type) => {
    if (type == "exercise") {
      selectedExercise = id;
    } else {
      selectedRole = id;
    }
  };

  // Define all columns in table, their content, functions & sorting way
  const columns = [
    {
      title: "ת.ז. משתמש",
      dataIndex: "userId",
      align: "center",
      sorter: (a, b) => a.userId - b.userId,
      sortOrder: sortedInfo.columnKey === "userId" && sortedInfo.order,
      //...getColumnSearchProps("userId"),
      filters: filtersForUserId,
      filteredValue: filteredInfo.userId || null,
      onFilter: (value, record) => String(record.userId).includes(value),
      filterSearch: true,
    },
    {
      title: "מזהה תרגיל",
      dataIndex: "exerciseId",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.exerciseId.localeCompare(b.exerciseId),
      sortOrder: sortedInfo.columnKey === "exerciseId" && sortedInfo.order,
      //...getColumnSearchProps("exerciseId"),
      filters: filtersForExerciseId,
      filteredValue: filteredInfo.exerciseId || null,
      onFilter: (value, record) => String(record.exerciseId).includes(value),
      filterSearch: true,
    },
    {
      title: "מזהה תפקיד",
      dataIndex: "roleId",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.roleId.localeCompare(b.roleId),
      sortOrder: sortedInfo.columnKey === "roleId" && sortedInfo.order,
      // ...getColumnSearchProps("roleId"),
      filters: filtersForRoleID,
      filteredValue: filteredInfo.roleId || null,
      onFilter: (value, record) => String(record.roleId).includes(value),
      filterSearch: true,
    },
    {
      title: "שם משתמש",
      dataIndex: "userName",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.userName.localeCompare(b.userName),
      sortOrder: sortedInfo.columnKey === "userName" && sortedInfo.order,
      // ...getColumnSearchProps("userName"),
      filters: filtersForUserName,
      filteredValue: filteredInfo.userName || null,
      onFilter: (value, record) => String(record.userName).includes(value),
      filterSearch: true,
    },
    {
      title: "סיסמא",
      dataIndex: "password",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.password.localeCompare(b.password),
      sortOrder: sortedInfo.columnKey === "password" && sortedInfo.order,
      ...getColumnSearchProps("password"),
      filters: filtersForPassword,
      filteredValue: filteredInfo.password || null,
      onFilter: (value, record) => String(record.password).includes(value),
      filterSearch: true,
    },
    {
      title: "יכול לתדרך?",
      dataIndex: "canDebrief",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.canDebrief.localeCompare(b.canDebrief),
      sortOrder: sortedInfo.columnKey === "canDebrief" && sortedInfo.order,
      // ...getColumnSearchProps("canDebrief"),
      filters: filtersForCanDebrief,
      filteredValue: filteredInfo.canDebrief || null,
      onFilter: (value, record) => String(record.canDebrief).includes(value),
    },
    {
      title: "שם הוצאת DS",
      dataIndex: "dsPublishName",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.dsPublishName.localeCompare(b.dsPublishName),
      sortOrder: sortedInfo.columnKey === "dsPublishName" && sortedInfo.order,
      // ...getColumnSearchProps("dsPublishName"),
      filters: filtersForDsPublishName,
      filteredValue: filteredInfo.dsPublishName || null,
      onFilter: (value, record) => String(record.dsPublishName).includes(value),
      filterSearch: true,
    },
    {
      title: "עריכה",
      dataIndex: "action",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return UserData.length >= 1 ? (
          <ButtonsInEditColumn
            handleDelete={handleDelete}
            record={record}
            editable={editable}
            edit={edit}
            save={save}
            cancel={cancel}
          />
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
  const checkType = (dataIndex, record, title, input) => {
    let editFieldJSX = "";
    switch (dataIndex) {
      case "exerciseId":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `יש להזין ערך בשדה ${title}`,
                },
              ]}
            >
              <SelectExerciseAndRole
                dataForOptions={dataForExerciseOptions}
                typeOfSelect="exercise"
                defaultValue={record.exerciseId}
                updateSelectFunc={setSelectedExerciseAndRole}
              />
            </Form.Item>
            {exerciseIdInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "roleId":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `יש להזין ערך בשדה ${title}`,
                },
              ]}
            >
              <SelectExerciseAndRole
                dataForOptions={dataForRoleOptions}
                typeOfSelect="role"
                defaultValue={record.roleId}
                updateSelectFunc={setSelectedExerciseAndRole}
              />
            </Form.Item>
            {roleIdInvalid ? (
              <h5 style={{ color: "red" }}>
                {" "}
                למשתמש זה הוזן תפקיד זה בתרגיל זה בעבר, לא ניתן להזין שנית. הערך
                המוזן חזר להיות הערך המקורי.{" "}
              </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "userName":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `יש להזין ערך בשדה ${title}`,
                },
              ]}
            >
              <Input
                style={{
                  margin: 0,
                  border: userNameInvalid ? "1px solid red" : "",
                }}
              />
            </Form.Item>
            {userNameInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "password":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `יש להזין ערך בשדה ${title}`,
                },
              ]}
            >
              <Input
                style={{
                  margin: 0,
                  border: passwordInvalid ? "1px solid red" : "",
                }}
              />
            </Form.Item>
            {passwordInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "canDebrief":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `יש להזין ערך בשדה ${title}`,
                },
              ]}
            >
              <Select
                style={{
                  width: 200,
                }}
              >
                <Option value="כן">כן</Option>
                <Option value="לא">לא</Option>
              </Select>
            </Form.Item>
            {canDebriefInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "dsPublishName":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              rules={[
                {
                  type: "text",
                  required: true,
                  message: `יש להזין ערך בשדה ${title}`,
                },
              ]}
            >
              <Input
                style={{ border: dsPublishNameInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {dsPublishNameInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
    }
    return editFieldJSX;
  };

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
    setShowNewUserForm(true);
  };

  // When user search text in global search, store this text
  const handleInputChange = (e) => {
    if (emptySearchText) {
      setEmptySearchText(false);
    }
    searchedText = e.target.value;
  };

  // Look for the text user searched in global search, and filter only rows that contains this input
  const globalSearch = () => {
    if (searchedText) {
      setUserData(
        BackUpData.filter((value) => {
          return (
            //check if each searched data is in row in each column
            value.userId
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.exerciseId
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.roleId
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.userName
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.password
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.canDebrief
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase())
          );
        })
      );
    } else {
      // Search input is empty, return all data
      setUserData(BackUpData);
    }
    setGridData(UserData);
  };

  // Return the main table's JSX
  return (
    <div>
      <AboveTableComponents
        typeOfNewObject="user"
        letMeKnowFormIsDone={letMeKnowFormIsDone}
        letMeKnowUserAddedDataToDB={letMeKnowUserAddedDataToDB}
        dataForExerciseOptions={dataForExerciseOptions}
        dataForRoleOptions={dataForRoleOptions}
        BackUpData={BackUpData}
        handleInputChange={handleInputChange}
        emptySearchText={emptySearchText}
        searchedText={searchedText}
        globalSearch={globalSearch}
        reset={reset}
        showNewObjectForm={showNewUserForm}
        newDataHandle={newDataHandle}
      />
      <Form form={form} component={false}>
        <Table
          columns={mergedColumns}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          style={{ marginTop: "10px" }}
          //  scroll={{
          //     x: 3300,
          //     y:2000                 }}
          dataSource={
            filteredData && filteredData.length ? filteredData : UserData
          }
          loading={loading}
          onChange={handleChange}
          size="small"
          tableLayout="fixed"
        />
      </Form>
      <ExportTableButton
        dataToExport={dataToExport}
        DataOfDT={UserData}
        BackUpData={BackUpData}
      />
    </div>
  );
};

export default UserDataDT;
