import {
  Button,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Select,
  Card,
  Space,
  Popconfirm,
} from "antd";
import React, { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const NewExercise = (props) => {

  const [endDateInvalid, setEndDateInvalid] = useState(false);
  const dataCollectionRef = collection(db, "TrainingDataDT");
  const [form] = Form.useForm();
  const { Option, OptGroup } = Select;

  // After all fields are filled, the form will be sent to custom validation
  // If it is valid- add new data to DB
  const onFinish = async (values) => {
    let isFormValid = customValidation(values);
    if (isFormValid) {
      //add row to DB!
      let newExercise = {
        name: values.name,
        courtPath: values.courtPath,
        exerciseMode: values.exerciseMode,
        startDateTime: Timestamp.fromDate(
          new Date(values.startDateTime)
        ).toDate(),
        endDateTime: Timestamp.fromDate(new Date(values.endDateTime)).toDate(),
        timeStepGepTime: parseInt(values.timeStepGepTime),
        type: values.type,
        status: values.status,
        creationTime: Timestamp.fromDate(
          new Date(values.creationTime)
        ).toDate(),
        numberOfDs: parseInt(values.numberOfDs),
        exerciseName: values.exerciseName,
        didDelete: false,
      };
      await addDoc(dataCollectionRef, newExercise);
      props.formIsDone();
      props.dataChanged();
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

  // Custom validation to fields, form will arrive to this check only after it's fully filled
  const customValidation = (row) => {
    let isValid = false;

    //check if end datetime is after start datetime
    let start = new Date(row.startDateTime);
    let end = new Date(row.endDateTime);
    if (end < start) {
      isValid = false;
      setEndDateInvalid(true);
    } else isValid = true;

    return isValid;
  };

  const formSubmitted = async () => {
    try {
      //get row content from saved edit form fields
      const row = await form.validateFields();
    } catch {}
  };

  // Return the form itself
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
        data-testid="createNewExerciseForm" 
      >
        <Input.Group>
          <Row>
            <Col span={7}>
              <Form.Item
                label="שם:"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="נתיב הפעילות:"
                name="courtPath"
                rules={[
                  {
                    required: true,
                    message: "Please input court Path!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="סוג:"
                name="type"
                rules={[
                  {
                    required: true,
                    message: "Please input type!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={7}>
              <Form.Item
                label="תאריך יצירה:"
                name="creationTime"
                rules={[
                  {
                    required: true,
                    message: "Please input creation time!",
                  },
                ]}
              >
                <DatePicker
                  style={{ margin: 0 }}
                  allowClear={false}
                  // showTime onChange={}
                  // onOk={onOkStartDT}
                  format="YYYY-MM-DD HH:mm:ss"
                  //defaultValue={moment()}
                />
                {/* <h5 style={{color:"red", visibility: nameInvalid?"visible" :  "hidden"}}> Please input some value in name field </h5>  */}
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="תאריך התחלה:"
                name="startDateTime"
                rules={[
                  {
                    required: true,
                    message: "Please input Start Date!",
                  },
                ]}
              >
                <DatePicker
                  style={{ margin: 0 }}
                  allowClear={false}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="תאריך סיום:"
                name="endDateTime"
                rules={[
                  {
                    required: true,
                    message: "Please input end date!",
                  },
                ]}
              >
                <DatePicker
                  style={{ border: endDateInvalid ? "1px solid red" : "" }}
                  allowClear={false}
                  // showTime onChange={}
                  // onOk={onOkStartDT}
                  format="YYYY-MM-DD HH:mm:ss"
                  // defaultValue={moment()}
                />
              </Form.Item>
              {endDateInvalid ? (
                <h5
                  style={{
                    color: "red",
                    visibility: endDateInvalid ? "visible" : "hidden",
                  }}
                >
                  {" "}
                  End date must be after start date!{" "}
                </h5>
              ) : (
                ""
              )}
            </Col>
          </Row>

          <Row>
            <Col span={7}>
              <Form.Item
                label="מצב פעילות:"
                name="exerciseMode"
                rules={[
                  {
                    required: true,
                    message: "Please input name!",
                  },
                ]}
              >
                <Select>
                  <Option value="התחילה">התחילה</Option>
                  <Option value="נסגרה">נסגרה</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="מרווחי זמן:"
                name="timeStepGepTime"
                rules={[
                  {
                    required: true,
                    message:
                      "Please input court Step Gep Time (integer value)!",
                  },
                ]}
              >
                <Input type="number" min="0" />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="סטטוס:"
                name="status"
                rules={[
                  {
                    required: true,
                    message: "Please input status!",
                  },
                ]}
              >
                <Select>
                  <Option value="טרם החל">טרם החל</Option>
                  <Option value="בתהליך">בתהליך</Option>
                  <Option value="הסתיים">הסתיים</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={7}>
              <Form.Item
                label="מספר DS:"
                name="numberOfDs"
                rules={[
                  {
                    required: true,
                    message: "Please input number of Ds! (integer value)",
                  },
                ]}
              >
                <Input
                  type="number"
                  min="0"
                  // onChange= {(e)=> onChangeNumOfDs(e)}
                />
              </Form.Item>
            </Col>

            <Col span={7}>
              <Form.Item
                label="שם תרגיל:"
                name="exerciseName"
                rules={[
                  {
                    required: true,
                    message: "Please input exercise name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                wrapperCol={{
                  offset: 12,
                  span: 4,
                }}
              ></Form.Item>
            </Col>
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
              <Button type="primary" 
              data-testid="closeNewExerciseFormButton"
               >סגירה</Button>
            </Popconfirm>
          </Space>
        </Input.Group>
      </Form>
    </Card>
  );
};

export default NewExercise;
