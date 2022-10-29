import { Button } from "antd";
import {
  ExportOutlined,
} from "@ant-design/icons";
import { CSVLink } from "react-csv";


const ExportTableButton = (props) => {
    return (
        <Button
        icon={<ExportOutlined />}
        type="text"
        size="large"
        style={{ marginRight: "20px" }}
      >
        <CSVLink
          data={
            //TrainingData && TrainingData.length ? TrainingData : BackUpData
            props.dataToExport && props.dataToExport.length
              ? props.dataToExport
              : props.DataOfDT && props.DataOfDT.length
              ? props.DataOfDT
              : props.BackUpData
          }
          style={{ color: "black" }}
        >
          יצא טבלה
        </CSVLink>
      </Button>
    );
}

export default ExportTableButton;
