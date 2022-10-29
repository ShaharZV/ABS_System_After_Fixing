import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Select,
  Card,
  Popconfirm,
  Space,
} from "antd";
import React, { useState } from "react";
import { db } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";
import SelectExerciseAndRole from "./SelectExerciseAndRole";

const NewRole = (props) => {
  const [exerciseInputEmpty, setExerciseInputEmpty] = useState(false);
  const [exerciseIdInvalid, setExerciseIdInvalid] = useState(false);
  const [roleIdInvalid, setRoleIdInvalid] = useState(false);
  const [roleInputEmpty, setRoleInputEmpty] = useState(false);

  const dataCollectionRef = collection(db, "UserDataDT");

  const [form] = Form.useForm();
  const { Option, OptGroup } = Select;

  // These states are here to solve a problem that while editing mode,
  // If user isn't typing again role/exercise id, it consider as null.
  // Because of that i'm saving it's choice and assigning them
  const [lastRoleIdInput, setLastRoleIdInput] = useState("");
  const [lastExerciseIdInput, setLastExerciseIdInput] = useState("");

  // Vars that will hold the selected values in special inputs
  let selectedExercise;
  let selectedRole;

  // After all fields are filled, the form will be sent to custom validation
  // If it is valid- add new data to DB
  const onFinish = async (values) => {
    try {
      if (selectedExercise == null) {
        values["exerciseId"] = lastExerciseIdInput;
        setExerciseInputEmpty(true);
      } else {
        values["exerciseId"] = selectedExercise;
        setLastExerciseIdInput(selectedExercise);
        setExerciseInputEmpty(false);
      }

      if (selectedRole == null) {
        values["roleId"] = lastRoleIdInput;
        setRoleInputEmpty(true);
      } else {
        values["roleId"] = selectedRole;
        setLastRoleIdInput(selectedRole);
        setRoleInputEmpty(false);
      }

      // After all fields are filled, the form will be sent to custom validation
      // If it is valid- add new data to DB
      let isFormValid = customValidation(values);
      if (isFormValid) {
        //add row to DB!
        let newUser = {
          userId: values.userId,
          exerciseId: values.exerciseId,
          roleId: values.roleId,
          userName: values.userName,
          password: values.password,
          canDebrief: values.canDebrief.toLowerCase() == "כן" ? true : false,
          dsPublishName: values.dsPublishName,
          didDelete: false,
        };

        await addDoc(dataCollectionRef, newUser);
        props.formIsDone();
        props.dataChanged();
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // If not all fields filled correctly, log it
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // This functions will close the by using function from props
  const closeForm = () => {
    props.formIsDone();
  };

  //check if end datetime is after start datetime
  const checkIfRoleExerciseAlreadyExists = (row) => {
    let combExistsObjInArray = props.userData.find(
      (item) =>
        item.userId == row.userId &&
        item.exerciseId == row.exerciseId &&
        item.roleId == row.roleId
    );
    if (combExistsObjInArray) {
      //The combination exists! can't add it again
      return true;
    }
    return false;
  };
  //check if form is valid- custom checks
  const customValidation = (row) => {
    let isValid = true;
    //validate roleId input
    if (row.roleId == null || row.roleId.length == 0) {
      isValid = false;
      setRoleIdInvalid(true);
    } else {
      setRoleIdInvalid(false);
    }

    //validate exerciseId input
    if (row.exerciseId == null || row.exerciseId.length == 0) {
      isValid = false;
      setExerciseIdInvalid(true);
    } else {
      setExerciseIdInvalid(false);
    }

    // If the form is valid- check if the user is not already assigned to same role in this exercise
    // If he is- form isn't valid
    if (isValid) {
      if (checkIfRoleExerciseAlreadyExists(row)) {
        isValid = false;
        setRoleIdInvalid(true);
      } else {
        setRoleIdInvalid(false);
      }
    }
    return isValid;
  };

  const formSubmitted = async () => {
    try {
      const row = await form.validateFields();
    } catch {
      console.log("Error with form submitted, NewUser component");
    }
  };

  const setSelectedExerciseAndRoleValues = (id, type) => {
    if (type == "exercise") {
      selectedExercise = id;
    } else {
      selectedRole = id;
    }
  };

  return (
    <Card>
      <Form
        form={form}
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 20,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        data-testid="createNewUserForm"
      >
        <Input.Group>
          <Row>
            <Col span={7}>
              <Form.Item
                label="ת.ז. משתמש:"
                name="userId"
                rules={[
                  {
                    required: true,
                    message: "יש להזין ת.ז.",
                  },
                ]}
              >
                <Input type="number" min="0" />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="מזהה תרגיל:"
                name="exerciseId"
                rules={[
                  {
                    message: "יש להזין מזהה תרגיל",
                  },
                ]}
              >
                <SelectExerciseAndRole
                  typeOfSelect="exercise"
                  dataForOptions={props.exerciseData}
                  updateSelectFunc={setSelectedExerciseAndRoleValues}
                  defaultValue={lastExerciseIdInput}
                />
              </Form.Item>
              {exerciseIdInvalid ? (
                <h5 style={{ color: "red" }}>
                  {exerciseInputEmpty
                    ? "נא להזין מזהה תרגיל"
                    : "למשתמש זה הוזן תפקיד זה בתרגיל זה בעבר, לא ניתן להזין שנית"}{" "}
                </h5>
              ) : (
                ""
              )}
            </Col>
            <Col span={7}>
              <Form.Item
                label="מזהה תפקיד:"
                name="roleId"
                rules={[
                  {
                    message: "יש להזין מזהה תפקיד",
                  },
                ]}
              >
                <SelectExerciseAndRole
                  typeOfSelect="role"
                  dataForOptions={props.roleData}
                  updateSelectFunc={setSelectedExerciseAndRoleValues}
                  defaultValue={lastRoleIdInput}
                />
              </Form.Item>
              {roleIdInvalid ? (
                <h5 style={{ color: "red" }}>
                  {roleInputEmpty
                    ? "נא להזין מזהה תפקיד"
                    : "למשתמש זה הוזן תפקיד זה בתרגיל זה בעבר, לא ניתן להזין שנית"}{" "}
                </h5>
              ) : (
                ""
              )}
            </Col>
          </Row>
          <Row>
            <Col span={7}>
              <Form.Item
                label="שם משתמש:"
                name="userName"
                rules={[
                  {
                    required: true,
                    message: "יש להזין שם משתמש",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="סיסמא:"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "יש להזין סיסמא",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={7}>
              <Form.Item
                label="יכול לתדרך:"
                name="canDebrief"
                rules={[
                  {
                    required: true,
                    message: "יש להזין האם יכול לתדרך",
                  },
                ]}
              >
                <Select allowClear={false}>
                  <Option value="כן">כן</Option>
                  <Option value="לא">לא</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={7}>
              <Form.Item
                label="שם הוצאת DS:"
                name="dsPublishName"
                rules={[
                  {
                    required: true,
                    message: "יש להזין שם הוצאת DS",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Form.Item
              wrapperCol={{
                offset: 12,
                span: 4,
              }}
            ></Form.Item>
          </Row>
          <Space style={{ float: "left" }}>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => formSubmitted()}
            >
              שמירה
            </Button>
            <Popconfirm
              title="שים לב, הנתונים יימחקו"
              onConfirm={() => closeForm()}
            >
              <Button type="primary" data-testid="closeNewUserFormButton">
                סגירה
              </Button>
            </Popconfirm>
          </Space>
        </Input.Group>
      </Form>
    </Card>
  );
};

export default NewRole;
