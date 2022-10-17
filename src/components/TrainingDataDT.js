//Imports
import React, { useState, useEffect } from "react";
import {
  Table,
  Popconfirm,
  Button,
  Space,
  Form,
  Input,
  DatePicker,
  Select,
  Badge,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  ReloadOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { CSVLink } from "react-csv";
import moment from "moment";
import "../CSS/TrainingDataDT.css";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import NewExercise from "./NewExercise";

// Main func, return the final DT of exercise data table
const TrainingDataDT = (props) => {
  // Input validataion states
  const [nameInvalid, setNameInvalid] = useState(false);
  const [courtPathInvalid, setCourtPathInvalid] = useState(false);
  const [startDateInvalid, setStartDateInvalid] = useState(false);
  const [endDateInvalid, setEndDateInvalid] = useState(false);
  const [timeStepGepInvalid, setTimeStepGepInvalid] = useState(false);
  const [typeInvalid, setTypeInvalid] = useState(false);
  const [statusInvalid, setStatusInvalid] = useState(false);
  const [creationTimeInvalid, setCreationTimeInvalid] = useState(false);
  const [numberOfDsTimeInvalid, setNumberOfDsInvalid] = useState(false);
  const [exerciseNameInvalid, setExerciseNameInvalid] = useState(false);

  // Data Table's grid states
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRowKey, setEditRowKey] = useState("");
  const [sortedInfo, setSortedInfo] = useState({});
  const [form] = Form.useForm();
  const [emptySearchText, setEmptySearchText] = useState(false);
  const [searchColText, setSearchColText] = useState("");
  const [searchedCol, setSearchedCol] = useState("");
  const [filteredInfo, setFilteredInfo] = useState({});
  const [dataToExport, setDataToExport] = useState([]);

  // States regarding to adding exercise form
  const { Option, OptGroup } = Select;
  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
  const [didUserAddDataToDB, setDidUserAddDataToDB] = useState(false);

  // Import data from firestore DB states
  const [TrainingData, setTrainingData] = useState([]);
  const [BackUpData, setBackUpData] = useState([]);
  const dataCollectionRef = collection(db, "TrainingDataDT");

  // States that contains column filter options- will be changed when the table data changes
  const [filtersForID, setfiltersForID] = useState("");
  const [filtersForName, setfiltersForName] = useState("");
  const [filtersForCourtPath, setfiltersForCourtPath] = useState("");
  const [filtersForExerciseMode, setfiltersForExerciseMode] = useState("");
  const [filtersForStartDateTime, setfiltersForStartDateTime] = useState("");
  const [filtersForEndDateTime, setfiltersForEndDateTime] = useState("");
  const [filtersForTimeStepGepTime, setfiltersForTimeStepGepTime] =
    useState("");
  const [filtersForType, setfiltersForType] = useState("");
  const [filtersForStatus, setfiltersForStatus] = useState("");
  const [filtersForCreationTime, setfiltersForCreationTime] = useState("");
  const [filtersForNumberOfDs, setfiltersForNumberOfDs] = useState("");
  const [filtersForExerciseName, setfiltersForExerciseName] = useState("");

  // Vars that will hold the selected values in special inputs
  let startDateTime;
  let endDateTime;
  let creationTime;
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
    setTrainingData(
      data.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          key: doc.id,
          startDateTime: doc.data().startDateTime.toDate().toString(),
          endDateTime: doc.data().endDateTime.toDate().toString(),
          creationTime: doc.data().creationTime.toDate().toString(),
        }))
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
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          key: doc.id,
          startDateTime: doc.data().startDateTime.toDate().toString(),
          endDateTime: doc.data().endDateTime.toDate().toString(),
          creationTime: doc.data().creationTime.toDate().toString(),
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

  // When successfully readed data from DB into state, load the data in table's view
  useEffect(() => {
    loadData();
  }, [TrainingData]);

  // If user added data to DB- load data again from DB, to get the updated data
  useEffect(() => {
    resetData();
    setDidUserAddDataToDB(false);
    props.setDidDataChanged(true);
  }, [didUserAddDataToDB]);

  // Load training data (state with updated data from DB) into table
  const loadData = () => {
    addFiltersValue();
    setGridData(TrainingData);
    setLoading(false);
  };

  // This var contains the options for Status column
  const iconForStatusRow = {
    טרם: <Badge placement="start" color="gray" />,
    בתהליך: <Badge placement="start" color="yellow" />,
    הסתיים: <Badge placement="start" color="green" />,
  };

  // This function will be called from "newExercise", if user closed/submitted the form
  const letMeKnowFormIsDone = () => {
    setShowNewExerciseForm(false);
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
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.id,
      value: v.id,
    }));
    setfiltersForID(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for name
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.name,
      value: v.name,
    }));
    setfiltersForName(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for courtPath
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.courtPath,
      value: v.courtPath,
    }));
    setfiltersForCourtPath(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for exerciseMode
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.exerciseMode,
      value: v.exerciseMode,
    }));
    setfiltersForExerciseMode(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for timeStepGepTime
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.timeStepGepTime,
      value: v.timeStepGepTime,
    }));
    setfiltersForTimeStepGepTime(
      removeDuplicateFilters(arrayOfAllDataInColumn)
    );
    //set filters for type
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.type,
      value: v.type,
    }));
    setfiltersForType(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for type
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.status,
      value: v.status,
    }));
    setfiltersForStatus(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for numberOfDs
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.numberOfDs,
      value: v.numberOfDs,
    }));
    setfiltersForNumberOfDs(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for exerciseName
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: v.exerciseName,
      value: v.exerciseName,
    }));
    setfiltersForExerciseName(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for startDateTime
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: new Date(v.startDateTime).toLocaleDateString(),
      value: new Date(v.startDateTime).toLocaleDateString(),
    }));
    setfiltersForStartDateTime(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for endDateTime
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: new Date(v.endDateTime).toLocaleDateString(),
      value: new Date(v.endDateTime).toLocaleDateString(),
    }));
    setfiltersForEndDateTime(removeDuplicateFilters(arrayOfAllDataInColumn));
    //set filters for creationTime
    arrayOfAllDataInColumn = TrainingData.map((v) => ({
      text: new Date(v.creationTime).toLocaleDateString(),
      value: new Date(v.creationTime).toLocaleDateString(),
    }));
    setfiltersForCreationTime(removeDuplicateFilters(arrayOfAllDataInColumn));
  };

  // This function removes duplicates values from filtering options array
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
    deleteTraining(value.id, value);
  };

  // Delete function, delete object from DB & from view
  const deleteTraining = async (id, value) => {
    const exerciseDoc = doc(db, "TrainingDataDT", id);
    // Delete doc from db (update field- didDelete -> true)
    let deleteUpdate = {
      didDelete: true,
    };
    await updateDoc(exerciseDoc, deleteUpdate);
    // Delete doc from view
    const filteredData = TrainingData.filter((item) => item.id !== value.id);
    setTrainingData(filteredData);
    setBackUpData(filteredData);
    setGridData(TrainingData);
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
    //Check if input fields are not empty&  valid.
    if (row.startDateTime.length == 0) {
      isValid = false;
      setStartDateInvalid(true);
    } else {
      setStartDateInvalid(false);
    }

    if (row.endDateTime.length == 0) {
      isValid = false;
      setEndDateInvalid(true);
    } else {
      setEndDateInvalid(false);
    }

    if (row.creationTime.length == 0) {
      isValid = false;
      setCreationTimeInvalid(true);
    } else {
      setCreationTimeInvalid(false);
    }
    //check if end datetime is after start datetime
    let start = new Date(row.startDateTime);
    let end = new Date(row.endDateTime);

    if (end < start) {
      isValid = false;
      setEndDateInvalid(true);
    }

    if (row.name.length == 0) {
      isValid = false;
      setNameInvalid(true);
    } else {
      setNameInvalid(false);
    }

    if (row.courtPath.length == 0) {
      isValid = false;
      setCourtPathInvalid(true);
    } else {
      setCourtPathInvalid(false);
    }

    if (row.timeStepGepTime.length == 0) {
      isValid = false;
      setTimeStepGepInvalid(true);
    } else {
      if (
        row.timeStepGepTime.toString().includes(".") ||
        row.timeStepGepTime.toString().includes("+") ||
        row.timeStepGepTime.toString().includes("-")
      ) {
        //input is not an integer then
        isValid = false;
        setTimeStepGepInvalid(true);
      } else {
        setTimeStepGepInvalid(false);
      }
    }

    if (row.type.length == 0) {
      isValid = false;
      setTypeInvalid(true);
    } else {
      setTypeInvalid(false);
    }

    if (row.status.length == 0) {
      isValid = false;
      setStatusInvalid(true);
    } else {
      setStatusInvalid(false);
    }

    if (row.numberOfDs.length == 0) {
      isValid = false;
      setNumberOfDsInvalid(true);
    } else {
      if (
        // Check if it's Int
        row.numberOfDs.toString().includes(".") ||
        row.numberOfDs.toString().includes("+") ||
        row.numberOfDs.toString().includes("-")
      ) {
        // Input is not an integer then
        isValid = false;
        setNumberOfDsInvalid(true);
      } else {
        setNumberOfDsInvalid(false);
      }
    }

    if (row.exerciseName.length == 0) {
      isValid = false;
      setExerciseNameInvalid(true);
    } else {
      setExerciseNameInvalid(false);
    }

    return isValid;
  };

  // If user press save changes after editing- insert new data to DB and update view
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...TrainingData];
      const index = TrainingData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        // Set value from date picker
        if (startDateTime) {
          row["startDateTime"] = startDateTime.toString();
        } else {
          row["startDateTime"] = item.startDateTime.toString();
        }
        if (endDateTime) {
          row["endDateTime"] = endDateTime.toString();
        } else {
          row["endDateTime"] = item.endDateTime.toString();
        }
        if (creationTime) {
          row["creationTime"] = creationTime.toString();
        } else {
          row["creationTime"] = item.creationTime.toString();
        }
        // Send user's input to validation check
        if (validateFieldsContent(row)) {
          //Fields are valid! Create the new updated object from the fields input
          let newTraining = {
            name: row.name,
            courtPath: row.courtPath,
            exerciseMode: row.exerciseMode,
            startDateTime: Timestamp.fromDate(new Date(row.startDateTime)),
            endDateTime: Timestamp.fromDate(new Date(row.endDateTime)),
            timeStepGepTime: parseInt(row.timeStepGepTime),
            type: row.type,
            status: row.status,
            creationTime: Timestamp.fromDate(new Date(row.creationTime)),
            numberOfDs: parseInt(row.numberOfDs),
            exerciseName: row.exerciseName,
            didDelete: false,
          };

          // Override old data in DB
          let exerciseDoc = doc(db, "TrainingDataDT", item.id);
          await updateDoc(exerciseDoc, newTraining);

          // Update item in view
          TrainingData.splice(index, 1, { ...item, ...row });
          BackUpData.splice(index, 1, { ...item, ...row });
          setGridData(TrainingData);
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
    startDateTime = "";
    endDateTime = "";
    creationTime = "";
    form.setFieldsValue({
      id: "",
      name: "",
      courtPath: "",
      exerciseMode: "",
      startDateTime: "",
      endDateTime: "",
      creationTime: "",
      timeStepGepTime: "",
      type: "",
      status: "",
      creationTime: "",
      numberOfDs: "",
      exerciseName: "",
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
            onClick={() => handleResetCol(clearFilters, selectedKeys, confirm, dataIndex)}
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
      title: "שם",
      dataIndex: "name",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
      ...getColumnSearchProps("name"),
      filters: filtersForName,
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => String(record.name).includes(value),
      filterSearch: true,
    },
    {
      title: "נתיב הפעילות",
      dataIndex: "courtPath",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.courtPath.localeCompare(b.courtPath),
      sortOrder: sortedInfo.columnKey === "courtPath" && sortedInfo.order,
      // ...getColumnSearchProps("courtPath"),
      filters: filtersForCourtPath,
      filteredValue: filteredInfo.courtPath || null,
      onFilter: (value, record) => String(record.courtPath).includes(value),
      filterSearch: true,
    },
    {
      title: "מצב פעילות",
      dataIndex: "exerciseMode",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.exerciseMode.localeCompare(b.exerciseMode),
      sortOrder: sortedInfo.columnKey === "exerciseMode" && sortedInfo.order,
      // ...getColumnSearchProps("exerciseMode"),
      filters: filtersForExerciseMode,
      filteredValue: filteredInfo.exerciseMode || null,
      onFilter: (value, record) => String(record.exerciseMode).includes(value),
    },
    {
      title: "תאריך התחלה",
      dataIndex: "startDateTime",
      align: "center",
      editTable: true,
      sorter: (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime),
      sortOrder: sortedInfo.columnKey === "startDateTime" && sortedInfo.order,
      ...getColumnSearchProps("startDateTime"),
      filters: filtersForStartDateTime,
      filteredValue: filteredInfo.startDateTime || null,
      onFilter: (value, record) =>
        new Date(record.startDateTime).toLocaleString().includes(value),
      render: (_, record) => new Date(record.startDateTime).toLocaleString(),
      filterSearch: true,
    },
    {
      title: "תאריך סיום",
      dataIndex: "endDateTime",
      align: "center",
      editTable: true,
      sorter: (a, b) => new Date(a.endDateTime) - new Date(b.endDateTime),
      sortOrder: sortedInfo.columnKey === "endDateTime" && sortedInfo.order,
      ...getColumnSearchProps("endDateTime"),
      filters: filtersForEndDateTime,
      filteredValue: filteredInfo.endDateTime || null,
      onFilter: (value, record) =>
        new Date(record.endDateTime).toLocaleString().includes(value),
      render: (_, record) => new Date(record.endDateTime).toLocaleString(),
      filterSearch: true,
    },
    {
      title: "מרווחי זמן",
      dataIndex: "timeStepGepTime",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.timeStepGepTime - b.timeStepGepTime,
      sortOrder: sortedInfo.columnKey === "timeStepGepTime" && sortedInfo.order,
      // ...getColumnSearchProps("timeStepGepTime"),
      filters: filtersForTimeStepGepTime,
      filteredValue: filteredInfo.timeStepGepTime || null,
      onFilter: (value, record) =>
        String(record.timeStepGepTime).includes(value),
      filterSearch: true,
    },
    {
      title: "סוג",
      dataIndex: "type",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === "type" && sortedInfo.order,
      // ...getColumnSearchProps("type"),
      filters: filtersForType,
      filteredValue: filteredInfo.type || null,
      onFilter: (value, record) => String(record.type).includes(value),
      filterSearch: true,
    },
    {
      title: "סטטוס",
      dataIndex: "status",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: sortedInfo.columnKey === "status" && sortedInfo.order,
      //...getColumnSearchProps("status"),
      filters: filtersForStatus,
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => String(record.status).includes(value),
      render: (_, record) =>
        record.status == "בתהליך" ? (
          <div>בתהליך {iconForStatusRow["בתהליך"]}</div>
        ) : record.status == "טרם החל" ? (
          <div> טרם החל {iconForStatusRow["טרם"]}</div>
        ) : (
          <div>הסתיים {iconForStatusRow["הסתיים"]}</div>
        ),
    },
    {
      title: "תאריך יצירה",
      dataIndex: "creationTime",
      align: "center",
      editTable: true,
      sorter: (a, b) => new Date(a.creationTime) - new Date(b.creationTime),
      sortOrder: sortedInfo.columnKey === "creationTime" && sortedInfo.order,
      ...getColumnSearchProps("creationTime"),
      filters: filtersForCreationTime,
      filteredValue: filteredInfo.creationTime || null,
      onFilter: (value, record) =>
        new Date(record.creationTime).toLocaleString().includes(value),
      render: (_, record) => new Date(record.creationTime).toLocaleString(),
      filterSearch: true,
    },
    {
      title: "מספר DS",
      dataIndex: "numberOfDs",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.numberOfDs - b.numberOfDs,
      sortOrder: sortedInfo.columnKey === "numberOfDs" && sortedInfo.order,
      // ...getColumnSearchProps("numberOfDs"),
      filters: filtersForNumberOfDs,
      filteredValue: filteredInfo.numberOfDs || null,
      onFilter: (value, record) => String(record.numberOfDs).includes(value),
      filterSearch: true,
    },
    {
      title: "שם תרגיל",
      dataIndex: "exerciseName",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.exerciseName.localeCompare(b.exerciseName),
      sortOrder: sortedInfo.columnKey === "exerciseName" && sortedInfo.order,
      // ...getColumnSearchProps("exerciseName"),
      filters: filtersForExerciseName,
      filteredValue: filteredInfo.exerciseName || null,
      onFilter: (value, record) => String(record.exerciseName).includes(value),
      filterSearch: true,
    },

    {
      title: "עריכה",
      dataIndex: "action",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return TrainingData.length >= 1 ? (
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
                text="bb"
                icon={<EditOutlined />}
                data-testid="editRowButton" 
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

  // If user change date/time- save input in var, this will help
  // To easily validate it
  const onChangeStartDT = (value, dateString) => {
    startDateTime = value;
  };
  const onChangeEndDT = (value, dateString) => {
    endDateTime = value;
  };
  const onChangeCreationDT = (value, dateString) => {
    creationTime = value;
  };

  // This function will return JSX component based on the column,
  // Each col will get different input field based on it's desired content & validation
  const checkType = (dataIndex, record, title, input) => {
    let editFieldJSX = "";
    switch (dataIndex) {
      case "name":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0, border: nameInvalid ? "1px solid red" : "" }}
              rules={[
                {
                  type: "text",
                  required: true,
                },
              ]}
            >
              {input}
            </Form.Item>
            {nameInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "courtPath":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{
                margin: 0,
                border: courtPathInvalid ? "1px solid red" : "",
              }}
              rules={[
                {
                  type: "text",
                  required: true,
                },
              ]}
            >
              {input}
            </Form.Item>
            {courtPathInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "exerciseMode":
        editFieldJSX = (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                type: "text",
                required: true,
              },
            ]}
          >
            <Select>
              <Option value="התחילה">התחילה</Option>
              <Option value="נסגרה">נסגרה</Option>
            </Select>
          </Form.Item>
        );
        break;
      case "startDateTime":
        editFieldJSX = (
          <div>
            <DatePicker
              name={dataIndex}
              style={{
                margin: 0,
                border: startDateInvalid ? "1px solid red" : "",
              }}
              allowClear={false}
              showTime
              onChange={onChangeStartDT}
              format="YYYY-MM-DD HH:mm:ss"
              defaultValue={moment(record.startDateTime)}
            />
            {startDateInvalid ? (
              <h5 style={{ color: "red" }}> יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "endDateTime":
        editFieldJSX = (
          <div>
            <DatePicker
              name={dataIndex}
              style={{ border: endDateInvalid ? "1px solid red" : "" }}
              allowClear={false}
              showTime
              onChange={onChangeEndDT}
              format="YYYY-MM-DD HH:mm:ss"
              defaultValue={moment(record.endDateTime)}
            /> 
            {endDateInvalid ? (
              <h5 style={{ color: "red" }}>
                {title} חייב להיות אחרי תאריך התחלה{" "}
              </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "timeStepGepTime":
        editFieldJSX = (
          <div>
            <Form.Item
              data-testid="timeStepGepTimeInputWhileEditing" 
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  type: "text",
                  required: true,
                },
              ]}
            >
              <Input
                type="number"
                min="0"
                style={{ border: timeStepGepInvalid ? "1px solid red" : "" }}
              />
            </Form.Item>
            {timeStepGepInvalid ? (
              <h5 style={{ color: "red" }}>{title} חייב להיות מספר שלם </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "type":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0, border: typeInvalid ? "1px solid red" : "" }}
              rules={[
                {
                  type: "text",
                  required: true,
                },
              ]}
            >
              {input}
            </Form.Item>
            {typeInvalid ? (
              <h5 style={{ color: "red" }}>יש להזין ערך בשדה {title} </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "status":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{
                margin: 0,
                border: statusInvalid ? "1px solid red" : "",
              }}
              rules={[
                {
                  type: "text",
                  required: true,
                },
              ]}
            >
              <Select>
                <Option value="טרם החל">טרם החל</Option>
                <Option value="בתהליך">בתהליך</Option>
                <Option value="הסתיים">הסתיים</Option>
              </Select>
            </Form.Item>
            {statusInvalid ? (
              <h5 style={{ color: "red" }}>{title} יש להזין ערך בשדה </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "creationTime":
        editFieldJSX = (
          <div>
            <DatePicker
              name={dataIndex}
              showTime
              onChange={onChangeCreationDT}
              style={{
                margin: 0,
                border: creationTimeInvalid ? "1px solid red" : "",
              }}
              allowClear={false}
              format="YYYY-MM-DD HH:mm:ss"
              defaultValue={moment(record.creationTime)}
            />
            {creationTimeInvalid ? (
              <h5 style={{ color: "red" }}>{title} יש להזין ערך בשדה </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "numberOfDs":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{
                margin: 0,
                border: numberOfDsTimeInvalid ? "1px solid red" : "",
              }}
              rules={[
                {
                  type: "text",
                  required: true,
                },
              ]}
            >
              <Input type="number" min="0" />
            </Form.Item>
            {numberOfDsTimeInvalid ? (
              <h5 style={{ color: "red" }}>{title} חייב להיות מספר שלם </h5>
            ) : (
              ""
            )}
          </div>
        );
        break;
      case "exerciseName":
        editFieldJSX = (
          <div>
            <Form.Item
              name={dataIndex}
              style={{
                margin: 0,
                border: exerciseNameInvalid ? "1px solid red" : "",
              }}
              rules={[
                {
                  type: "text",
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            {exerciseNameInvalid ? (
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
    setShowNewExerciseForm(true);
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
      setTrainingData(
        BackUpData.filter((value) => {
          return (
            //check if each searched data is in row in each column
            value.id
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.name
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.courtPath
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.exerciseMode
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.startDateTime
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.endDateTime
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.timeStepGepTime
              .toString()
              .includes(searchedText.toLowerCase()) ||
            value.type
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.status
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.creationTime
              .toString()
              .toLowerCase()
              .includes(searchedText.toLowerCase()) ||
            value.numberOfDs.toString().includes(searchedText.toLowerCase()) ||
            value.exerciseName
              .toLowerCase()
              .includes(searchedText.toLowerCase())
          );
        })
      );
    } else {
      // Search input is empty, return all data
      setTrainingData(BackUpData);
    }
    setGridData(TrainingData);
  };

  // Return the main table's JSX
  return (
    <div>
      <div>
        {showNewExerciseForm ? (
          <NewExercise
            formIsDone={letMeKnowFormIsDone}
            dataChanged={letMeKnowUserAddedDataToDB}
          />
        ) : (
          ""
        )}{" "}
      </div>
      <Space style={{ scrollMarginBottom: 16 }}>
        <Input
          placeholder="חפש תרגיל"
          onChange={handleInputChange}
          type="text"
          style={{
            border: "none",
            borderBottom: "1px solid ",
            marginRight: "20px",
          }}
          allowClear
          value={emptySearchText ? "" : searchedText}
          suffix={
            <Button
              data-testid="globalSearchInputButton" 
              onClick={globalSearch}
              type="text"
              icon={<SearchOutlined />}
            />
          }
        />
        <Button
          onClick={reset}
          data-testid="reloadDataButton" 
          icon={<ReloadOutlined />}
          type="text"
          style={{ marginRight: "20px" }}
        />
        {!showNewExerciseForm ? (
          <Button
            onClick={newDataHandle}
            data-testid="createNewObjectInDBButton" 
            size="large"
            style={{ position: "absolute", left: 0, top: 0, color: "#1890ff" }}
            type="text"
          >
            צור תרגיל חדש
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
          //scroll={{
          //     x: 3300,
          //    y:"auto"                }}
          dataSource={
            TrainingData && TrainingData.length ? TrainingData : BackUpData
          }
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
              : TrainingData && TrainingData.length
              ? TrainingData
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

export default TrainingDataDT;
