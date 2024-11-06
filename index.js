const inquirer = require("inquirer");
const pool = require("./config/connection");

const init = async () => {
  const mainMenu = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
    },
  ]);
  if (mainMenu.action === "View all departments") {
    viewDepartments();
  } else {
    switch (mainMenu.action) {
      case "View all roles":
        viewRoles();
        break;
      case "View all employees":
        viewEmployees();
        break;
      case "Add a department":
        addDepartment();
        break;
      case "Add a role":
        addRole();
        break;
      case "Add an employee":
        addEmployee();
        break;
      case "Update an empolyee role":
        updateEmployee();
        break;
      case "Exit":
        exitFunction();
        break;
    }
  }
};

async function viewDepartments() {
  const data = await pool.query("SELECT * FROM department");
  console.table(data.rows);
  init();
}

async function viewRoles() {
  const data = await pool.query("SELECT * FROM role");
  console.table(data.rows);
  init();
}

async function viewEmployees() {
  const data = await pool.query("SELECT * FROM employee");
  console.table(data.rows);
  init();
}

async function addDepartment() {
  const response = await inquirer.prompt([
    {
      type: "input",
      name: "departmentName",
      message: "What is the new department name?",
    },
  ]);
  await pool.query("INSERT INTO department(name) VALUES($1)", [
    response.departmentName,
  ]);
  init();
}

async function addRole() {
  try {
    // Query departments from the database
    const departmentsResult = await pool.query(
      "SELECT id, name FROM department"
    );
    // Create the choices array for list prompt
    const departmentChoices = departmentsResult.rows.map((department) => ({
      name: department.name,
      value: department.id,
    }));
    const response = await inquirer.prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "What is the title of the role?",
      },
      {
        type: "input",
        name: "roleSalary",
        message: "What is the salary for this role?",
      },

      // query list of role //
      {
        type: "list",
        name: "roleDepartment",
        message: "What department does this role belong to?",
        choices: departmentChoices,
      },
    ]);

    await pool.query(
      "INSERT INTO role(title, salary, department_id) VALUES($1, $2, $3)",
      [response.roleTitle, response.roleSalary, response.roleDepartment]
    );

    console.log(
      `${response.roleTitle} role added successfully to department ${response.roleDepartment}.`
    );
    init();
  } catch (error) {
    console.error("Error adding role:", error);
  }
}

async function addEmployee() {
  const response = await inquirer.prompt([
    {
      type: "input",
      name: "first_name",
      message: "What is the employee's first name?",
    },
    {
      type: "input",
      name: "last_name",
      message: "What is the employee's last name?",
    },
    {
      type: "input",
      name: "roleId",
      message: "What is this employee's role?",
    },
    {
      type: "list",
      name: "manager",
      message: "Does this employee have a manager?",
      choices: ["J Kwon", "Meek Moses", "Daniel Quinn", "Holly Bahn"],
    },
  ]);
  await pool.query(
    "INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [response.first_name, response.last_name, response.roleId, response.mana]
  );
  init();
}

async function updateEmployee() {
  // Query to retrieve employee data (rows) from employee table
  const employeeData = await pool.query(
    "SELECT id, first_name, last_name FROM employee"
  );
  const employees = employeeData.rows;
  // Map method to create new array of objects stored in employeeOptions
  // The new object will have first and last name and id value.
  const employeeOptions = employees.map((data) => ({
    name: `${data.first_name} ${data.last_name}`,
    value: data.id,
  }));

  //Chosen employee's ID is stored upon selection.
  const { employeeId } = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee's role do you want to update?",
      choices: employeeOptions,
    },
  ]);
  // Input of new role Id is stored in variable
  const { newRoleId } = await inquirer.prompt([
    {
      type: "input",
      name: "newRoleId",
      message: "Enter the new role ID for this employee",
    },
  ]);

  // SQL update query to change the role_id of the specified {employeeId} to {newRoleId}
  await pool.query("UPDATE employee SET role_id = $1 WHERE id = $2", [
    newRoleId,
    employeeId,
  ]);
  init();
}

const exitFunction = () => {
  console.log("Exiting application");
  process.exit();
};

init();
