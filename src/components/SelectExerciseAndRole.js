import { Select } from 'antd';
import React from 'react';
const { Option } = Select;

function SelectExerciseAndRole(props){

  //set array of options
  let arrayOfAllDataInColumn;
  arrayOfAllDataInColumn = props.dataForOptions.map(v => (<Option value={v.id}>{v.id}</Option>));
  const updateSelectedChioce = (selectedOption) => {
    props.updateSelectFunc(selectedOption, props.typeOfSelect)
  }

 
  // //when set default value - pass it back as choice of user (only for first time, to avoid null)
  // updateSelectedChioce(props.defaultValue);

return(
  <Select 
  allowClear={false}
    showSearch
    style={{
      //width: 200, 
    }}
    defaultValue= {props.defaultValue}
    placeholder="חפש"
    onChange={updateSelectedChioce}
    optionFilterProp="children"
    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
    filterSort={(optionA, optionB) =>
      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
    }
  >
    {arrayOfAllDataInColumn}
  </Select>
);

} 


export default SelectExerciseAndRole;

