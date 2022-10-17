import { Button, Form, Input, Row, Col, Card, Popconfirm, Space } from "antd";
import React, { useState, useEffect } from "react";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const NewRole = (props) => {
  const [commonCommandsInvalid, setCommonCommandsInvalid] = useState(false);
  const [allCommandsInvalid, setAllCommandsInvalid] = useState(false);
  const [blockedCommandsInvalid, setBlockedCommandsInvalid] = useState(false);
  const [commonReportsInvalid, setCommonReportsInvalid] = useState(false);
  const [allReportsInvalid, setAllReportsInvalid] = useState(false);
  const [blockedReportsInvalid, setBlockedReportsInvalid] = useState(false);

  const dataCollectionRef = collection(db, "RoleDataDT");

  const [form] = Form.useForm();

  // After all fields are filled, the form will be sent to custom validation
  // If it is valid- add new data to DB
  const onFinish = async (values) => {
    let isFormValid = customValidation(values);
    if (isFormValid) {
      //add row to DB!
      let newRole = {
        type: parseInt(values.type),
        mkrcRole: parseInt(values.mkrcRole),
        commonCommands: values.commonCommands,
        allCommands: values.allCommands,
        blockedCommands: values.blockedCommands,
        commonReports: values.commonReports,
        allReports: values.allReports,
        blockedReports: values.blockedReports,
        didDelete: false,
      };
      await addDoc(dataCollectionRef, newRole);
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
    let isValid = true;
    //validate commonCommands input
    if (row.commonCommands.length == 0) {
      isValid = false;
      setCommonCommandsInvalid(true);
    } else {
      if (
        // This regex will return null if the input is not in format of (int, int , int)
        row.commonCommands.match(/^\((\d+[,]{0,1})*[\)]{0,1}$/) == null ||
        row.commonCommands == "()"
      ) {
        isValid = false;
        setCommonCommandsInvalid(true);
      } else {
        setCommonCommandsInvalid(false);
      }
    }
    //validate allCommands input
    if (row.allCommands.length == 0) {
      isValid = false;
      setAllCommandsInvalid(true);
    } else {
      if (
        row.allCommands.match(/^\((\d+[,]{0,1})*[\)]{0,1}$/) == null ||
        row.allCommands == "()"
      ) {
        isValid = false;
        setAllCommandsInvalid(true);
      } else {
        setAllCommandsInvalid(false);
      }
    }

    //validate blockedCommands input
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

    //validate commonReports input
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

    //validate allReports input
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

    //validate blockedReports input
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

  const formSubmitted = async () => {
    try {
      //get row content from saved edit form fields
      const row = await form.validateFields();
    } catch {
      console.log("Error with form submitted, NewRole component");
    }
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
        data-testid="createNewRoleForm"
      >
        <Input.Group>
          <Row>
            <Col span={7}>
              <Form.Item
                label="סוג:"
                name="type"
                rules={[
                  {
                    required: true,
                    message: "יש להזין סוג",
                  },
                ]}
              >
                <Input type="number" min="0" />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="תפקיד MKRC:"
                name="mkrcRole"
                rules={[
                  {
                    required: true,
                    message: "יש להזין תפקיד MKRC",
                  },
                ]}
              >
                <Input type="number" min="0" />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="פקודות נפוצות:"
                name="commonCommands"
                rules={[
                  {
                    required: true,
                    message: "יש להזין פקודות נפוצות",
                  },
                ]}
              >
                <Input
                  style={{
                    border: commonCommandsInvalid ? "1px solid red" : "",
                  }}
                  placeholder="(x,y,z)"
                />
              </Form.Item>
              {commonCommandsInvalid ? (
                <h5 style={{ color: "red" }}>
                  {" "}
                  פקודות נפוצות חייבות להיות בפרומט (int,int,...){" "}
                </h5>
              ) : (
                ""
              )}
            </Col>
          </Row>

          <Row>
            <Col span={7}>
              <Form.Item
                label="כל הפקודות:"
                name="allCommands"
                rules={[
                  {
                    required: true,
                    message: "יש להזין פקודות",
                  },
                ]}
              >
                <Input
                  style={{ border: allCommandsInvalid ? "1px solid red" : "" }}
                  placeholder="(x,y,z)"
                />
              </Form.Item>
              {allCommandsInvalid ? (
                <h5 style={{ color: "red" }}>
                  {" "}
                  כל הפקודות חייבות להיות בפרומט (int,int,...){" "}
                </h5>
              ) : (
                ""
              )}
            </Col>
            <Col span={7}>
              <Form.Item
                label="פקודות חסומות:"
                name="blockedCommands"
                rules={[
                  {
                    required: true,
                    message: "יש להזין פקודות חסומות",
                  },
                ]}
              >
                <Input
                  style={{
                    border: blockedCommandsInvalid ? "1px solid red" : "",
                  }}
                  placeholder="(x,y,z)"
                />
              </Form.Item>
              {blockedCommandsInvalid ? (
                <h5 style={{ color: "red" }}>
                  {" "}
                  פקודות חסומות חייבות להיות בפרומט (int,int,...){" "}
                </h5>
              ) : (
                ""
              )}
            </Col>

            <Col span={7}>
              <Form.Item
                label="דוחות נפוצים:"
                name="commonReports"
                rules={[
                  {
                    required: true,
                    message: "יש להזין דוחות",
                  },
                ]}
              >
                <Input
                  style={{
                    border: commonReportsInvalid ? "1px solid red" : "",
                  }}
                  placeholder="(x,y,z)"
                />
              </Form.Item>
              {commonReportsInvalid ? (
                <h5 style={{ color: "red" }}>
                  {" "}
                  דוחות נפוצים חייבים להיות בפרומט (int,int,...){" "}
                </h5>
              ) : (
                ""
              )}
            </Col>
          </Row>

          <Row>
            <Col span={7}>
              <Form.Item
                label="כל הדוחות:"
                name="allReports"
                rules={[
                  {
                    required: true,
                    message: "יש להזין דוחות",
                  },
                ]}
              >
                <Input
                  style={{ border: allReportsInvalid ? "1px solid red" : "" }}
                  placeholder="(x,y,z)"
                />
              </Form.Item>
              {allReportsInvalid ? (
                <h5 style={{ color: "red" }}>
                  {" "}
                  כל הדוחות חייבים להיות בפרומט (int,int,...){" "}
                </h5>
              ) : (
                ""
              )}
            </Col>
            <Col span={7}>
              <Form.Item
                label="דוחות חסומים:"
                name="blockedReports"
                rules={[
                  {
                    required: true,
                    message: "יש להזין דוחות",
                  },
                ]}
              >
                <Input
                  style={{
                    border: blockedReportsInvalid ? "1px solid red" : "",
                  }}
                  placeholder="(x,y,z)"
                />
              </Form.Item>
              {allReportsInvalid ? (
                <h5 style={{ color: "red" }}>
                  {" "}
                  דוחות חסומים חייבים להיות בפרומט (int,int,...){" "}
                </h5>
              ) : (
                ""
              )}
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
              <Button type="primary" 
              data-testid="closeNewRoleFormButton">
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
