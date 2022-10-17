import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoleDataDT from "./RoleDataDT";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

const dummyFunctionForTests = () => {
  //do nothing
};

// Wait till content is loaded
function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

describe("Role Data Table Tests", () => {
  // Check if "חפש תרגיל" input is on screen
  test("renders search input ", () => {
    // Arrange
    render(<RoleDataDT setDidDataChanged={dummyFunctionForTests} />);

    // Assert
    const desiredElement = screen.getByPlaceholderText("חפש תפקיד");
    expect(desiredElement).toBeInTheDocument();
  });

  // Check if magnifying glass (search) button is on the screen
  test("renders magnifying glass (search) button", () => {
    // Arrange
    render(<RoleDataDT setDidDataChanged={dummyFunctionForTests} />);

    // Assert
    const desiredElement = screen.getByTestId("globalSearchInputButton");
    expect(desiredElement).toBeInTheDocument();
  });

  // Check if reset button is on the screen
  test("renders reset data button", () => {
    // Arrange
    render(<RoleDataDT setDidDataChanged={dummyFunctionForTests} />);

    // Assert
    const desiredElement = screen.getByTestId("reloadDataButton");
    expect(desiredElement).toBeInTheDocument();
  });

  // Check if reset 'create new ' button is on the screen
  test('renders "Create New Object In DB" button', () => {
    // Arrange
    render(<RoleDataDT setDidDataChanged={dummyFunctionForTests} />);

    // Assert
    const desiredElement = screen.getByTestId("createNewObjectInDBButton");
    expect(desiredElement).toBeInTheDocument();
  });

  // Check if form of creating new object is opened after clicked on 'create new '
  test("renders new object form if clicked on add new button", () => {
    // Arrange
    render(<RoleDataDT setDidDataChanged={dummyFunctionForTests} />);

    // Act- click on 'add new' button
    const buttonElement = screen.getByText("צור תפקיד חדש");
    userEvent.click(buttonElement);

    // Assert - check if form of adding new object is open now
    const desiredElement = screen.getByTestId("createNewRoleForm");
    expect(desiredElement).toBeInTheDocument();
  });

  // Check if form of creating new object is closed after clicking on 'close' and then
  // confirm closing in poconfirm
  test("renders new object form if clicked on add new button", () => {
    // Arrange
    render(<RoleDataDT setDidDataChanged={dummyFunctionForTests} />);

    // Act- click on 'add new' button -> then add new form will be opened
    const buttonElement = screen.getByText("צור תפקיד חדש");
    userEvent.click(buttonElement);

    // get close button & close the add new form
    const closeButton = screen.getByTestId("closeNewRoleFormButton");
    userEvent.click(closeButton);

    // Then we expect the poconfirm to pop up
    // Then confirm closing
    const confirmClosingElement = screen.getByText("OK");
    userEvent.click(confirmClosingElement);

    // Check if form of adding new object is closed now
    const desiredElement = screen.queryByTestId("createNewRoleForm");
    expect(desiredElement).toBeNull();
  });

});
