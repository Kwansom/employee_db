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
      case "Update an employee role":
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
  // const data = await pool.query("SELECT * FROM role");
  const data =
    await pool.query(`SELECT role.id, role.title, role.salary, department.name AS department_name
  FROM role
  LEFT JOIN department ON role.department_id = department.id`);

  console.table(data.rows);
  init();
}

async function viewEmployees() {
  // const data = await pool.query("SELECT * FROM employee");
  const data = await pool.query(`SELECT 
        employee.first_name AS "First Name",
        employee.last_name AS "Last Name",
        role.title AS "Role",
        role.salary AS "Salary",
        department.name AS "Department",
        manager.first_name || ' ' || manager.last_name AS "Manager"
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      LEFT JOIN employee manager ON employee.manager_id = manager.id
    `);
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
  try {
    const employeeResults = await pool.query(
      "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee"
    );
    const employeeChoices = employeeResults.rows.map((employee) => ({
      name: employee.name,
      value: employee.id,
    }));

    const rolesResult = await pool.query("SELECT id, title FROM role");
    const roleChoices = rolesResult.rows.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    employeeChoices.unshift({
      name: "None",
      value: null,
    });

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
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices,
      },
      {
        type: "list",
        name: "manager",
        message: "Does this employee have a manager?",
        choices: employeeChoices,
      },
    ]);

    await pool.query(
      "INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
      [
        response.first_name,
        response.last_name,
        response.roleId,
        response.manager,
      ]
    );
    console.log(
      `${response.first_name} ${response.last_name} added successfully.`
    );
    init();
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}

async function updateEmployee() {
  try {
    const employeeResults = await pool.query(
      "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee"
    );

    // console.log("Employee Results:", employeeResults.rows);

    const employeeChoices = employeeResults.rows.map((employee) => ({
      name: employee.name,
      value: employee.id,
    }));

    // console.log("Employee Choices:", employeeChoices);

    const rolesResult = await pool.query("SELECT id, title FROM role");
    const roleChoices = rolesResult.rows.map((role) => ({
      name: role.title,
      value: role.id,
    }));
    //Chosen employee's ID is stored upon selection.
    const { employeeId } = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to update?",
        choices: employeeChoices,
      },
    ]);
    // Input of new role Id is stored in variable
    const { newRoleId } = await inquirer.prompt([
      {
        type: "list",
        name: "newRoleId",
        message: "Select the employee's new role.",
        choices: roleChoices,
      },
    ]);

    // SQL update query to change the role_id of the specified {employeeId} to {newRoleId}
    await pool.query("UPDATE employee SET role_id = $1 WHERE id = $2", [
      newRoleId,
      employeeId,
    ]);
    console.log("Employee role updated successfully");

    init();
  } catch (error) {
    console.error("Error updating employee:", error);
  }
}

const exitFunction = () => {
  console.log("Exiting application");
  process.exit();
};

init();
