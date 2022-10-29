import {
    CloseOutlined,
    SaveOutlined,
  } from "@ant-design/icons";
import { Popconfirm, Button, Space} from "antd";

const EditingRowCancelSaveButtons = (props) => {
    return (
        <span>
        <Space>
          <Popconfirm
            title="האם אתה בטוח שברצונך לבטל עריכה?"
            onConfirm={props.cancel}
          >
            <Button icon={<CloseOutlined />} type="primary" danger />
          </Popconfirm>
          <Button
            icon={<SaveOutlined style={{ color: "white" }} />}
            onClick={() => props.save(props.record.key)}
            type="submit"
            style={{
              marginRight: "8px",
              background: "green",
              borderColor: "green",
            }}
          />
        </Space>
      </span>
    );
}

export default EditingRowCancelSaveButtons;
