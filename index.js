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
      case "View all Employees":
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
    {
      type: "input",
      name: "roleDepartment",
      message: "What department ID does this role belong to?",
    },
  ]);
  await pool.query(
    "INSERT INTO role(title, salary, department_id) VALUES($1, $2, $3)",
    [response.roleTitle, response.roleSalary, response.roleDepartment]
  );
  init();
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
      message: "What is this employee's role ID?",
    },
    {
      type: "input",
      name: "managerId",
      message: "Does this employee have a manager ID?",
    },
  ]);
  await pool.query(
    "INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [
      response.first_name,
      response.last_name,
      response.roleId,
      response.managerId,
    ]
  );
  init();
}

async function updateEmployee() {
  const employeeData = await pool.query(
    "SELECT id, first_name, last_name FROM employee"
  );
  const employees = employeeData.rows;

  const employeeOptions = employees.map((data) => ({
    name: `${data.first_name} ${data.last_name}`,
    value: data.id,
  }));

  const { employeeId } = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee's role do you want to update?",
      choices: employeeOptions,
    },
  ]);

  const { newRoleId } = await inquirer.prompt([
    {
      type: "input",
      name: "newRoleId",
      message: "Enter the new role ID for this employee",
    },
  ]);

  await pool.query("UPDATE employee SET role_id = $1 WHERE ID = $2", [
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
