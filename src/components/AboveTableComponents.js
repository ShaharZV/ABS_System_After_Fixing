import { Button, Space, Input } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import NewRole from "./NewRole";
import NewUser from "./NewUser";
import NewExercise from "./NewExercise";

const AboveTableComponents = (props) => {
  //Decide what form to open based on typeOfNewObject retrive from props
  let newObjectForm;
  let inputPlaceHolderText;
  let creatNewObjectTextOnButton;

  switch (props.typeOfNewObject) {
    case "role":
      inputPlaceHolderText = "חפש תפקיד";
      creatNewObjectTextOnButton = "צור תפקיד חדש";
      newObjectForm = (
        <NewRole
          formIsDone={props.letMeKnowFormIsDone}
          dataChanged={props.letMeKnowUserAddedDataToDB}
        />
      );
      break;

    case "user":
      inputPlaceHolderText = "חפש משתמש";
      creatNewObjectTextOnButton = "צור משתמש חדש";
      newObjectForm = (
        <NewUser
          formIsDone={props.letMeKnowFormIsDone}
          dataChanged={props.letMeKnowUserAddedDataToDB}
          exerciseData={props.dataForExerciseOptions}
          roleData={props.dataForRoleOptions}
          userData={props.BackUpData}
        />
      );
      break;

    case "training":
      inputPlaceHolderText = "חפש אימון";
      creatNewObjectTextOnButton = "צור אימון חדש";
      newObjectForm = (
        <NewExercise
          formIsDone={props.letMeKnowFormIsDone}
          dataChanged={props.letMeKnowUserAddedDataToDB}
        />
      );
      break;
  }
  return (
    <div>
      <div>{props.showNewObjectForm ? newObjectForm : ""} </div>
      <Space style={{ scrollMarginBottom: 16 }}>
        <Input
          placeholder={inputPlaceHolderText}
          onChange={props.handleInputChange}
          type="text"
          allowClear
          style={{
            border: "none",
            borderBottom: "1px solid ",
            marginRight: "20px",
          }}
          value={props.emptySearchText ? "" : props.searchedText}
          suffix={
            <Button
              onClick={props.globalSearch}
              data-testid="globalSearchInputButton"
              type="text"
              icon={<SearchOutlined />}
            />
          }
        />
        <Button
          onClick={props.reset}
          icon={<ReloadOutlined />}
          data-testid="reloadDataButton"
          type="text"
          style={{ marginRight: "20px" }}
        />
        {!props.showNewObjectForm ? (
          <Button
            onClick={props.newDataHandle}
            size="large"
            data-testid="createNewObjectInDBButton"
            style={{ position: "absolute", left: 0, top: 0, color: "#1890ff" }}
            type="text"
          >
            {creatNewObjectTextOnButton}
          </Button>
        ) : (
          ""
        )}
      </Space>
    </div>
  );
};

export default AboveTableComponents;
