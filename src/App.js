import logo from "./logo.svg";
import TrainingTabs from "./components/TrainingTabs"


import { Menu } from "antd";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";

import React, { useState, useEffect } from "react";

const App = () => {
  const [screen, setScreen] = useState("homeScreen");
  let screenData;

  if (screen == "homeScreen") {
    screenData = (
      <img src={require('./ABS_logo.png')} style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      }}  />
  );
  }

  if (screen == "advanceSettings") {
    screenData = (
      <div>
        <TrainingTabs />
      </div>
    );
  }

  return (
    <div>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["homeScreen"]}>
        <Menu.Item
          key="homeScreen"
          icon={<HomeOutlined />}
          onClick={() => setScreen("homeScreen")}
        ></Menu.Item>
        <Menu.Item
          key="Settings"
          icon={<SettingOutlined />}
          onClick={() => setScreen("advanceSettings")}
        ></Menu.Item>
      </Menu>
      {screenData}
    </div>
  );
};

export default App;
