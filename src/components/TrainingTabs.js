import { Tabs, PageHeader } from "antd";
import React, { useState} from "react";
import TrainingDataDT from "./TrainingDataDT";
import UserDataDT from "./UserDataDT";
import RoleDataDT from "./RoleDataDT";

const TrainingTabs = () => {
  const [didDataChanged, setDidDataChanged] = useState(false);

  return (
    <div class="container">
      <PageHeader
        className="site-page-header"
        title="הגדרות מתקדמות"
        style={{ backgroundColor: "#ECECEC" }}
      />
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab="נתוני אימונים" key="1">
          <TrainingDataDT
            tableLayout="auto"
            position="topCenter"
            scroll-x="0"
            setDidDataChanged={setDidDataChanged}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="נתוני תפקידים" key="2">
          <RoleDataDT
            tableLayout="auto"
            position="topCenter"
            scroll-x="0"
            setDidDataChanged={setDidDataChanged}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="נתוני משתמשים" key="3">
          <UserDataDT
            tableLayout="auto"
            position="topCenter"
            scroll-x="0"
            didDataChangedState={didDataChanged}
            setDidDataChanged={setDidDataChanged}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};
export default TrainingTabs;
