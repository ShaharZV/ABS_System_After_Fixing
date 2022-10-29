import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Popconfirm, Button, Space } from "antd";
import EditingRowCancelSaveButtons from "./EditingRowCancelSaveButtons";

const ButtonsInEditColumn = (props) => {
  let poconfirmMessage;
  switch (props.typeOfNewObject) {
    case "role":
      poconfirmMessage = "האם אתה בטוח שברצונך למחוק תפקיד זה? שים לב, יימחקו גם כלל המשתמשים בעלי תפקיד זה";
      break;


    case "training":
      poconfirmMessage = "האם אתה בטוח שברצונך למחוק תרגיל זה? שים לב, יימחקו גם כלל המשתמשים בתרגיל זה";
      break;
    
    default:
      poconfirmMessage = "האם אתה בטוח שברצונך למחוק משתמש זה?";
      break;
  }
  return (
    <Space>
      <Popconfirm
        placement="right"
        title= {poconfirmMessage}
        onConfirm={() => props.handleDelete(props.record)}
        okText="מחק"
        cancelText="בטל"
      >
        {props.editable ? (
          ""
        ) : (
          <Button
            danger
            type="primary"
            disabled={props.editable}
            icon={<DeleteOutlined />}
          />
        )}
      </Popconfirm>
      {props.editable ? (
        <EditingRowCancelSaveButtons
          cancel={props.cancel}
          save={props.save}
          record={props.record}
        />
      ) : (
        <Button
          onClick={() => props.edit(props.record)}
          type="primary"
          icon={<EditOutlined />}
          data-testid="editRowButton"
          style={{
            marginRight: "8px",
          }}
        />
      )}
    </Space>
  );
};

export default ButtonsInEditColumn;
