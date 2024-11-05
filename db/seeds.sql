INSERT INTO department (name) VALUES
('Sales'),
('Exhibitions'),
('Operations'),
('Facilities');

INSERT INTO role (title, salary, department_id) VALUES
('Sales Associate', 10000, 1),
('Preparator', 15000, 2),
('Technician', 12000, 3),
('Coordinator', 11000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('J', 'Kwon', 1, 3),
('Meek', 'Moses', 2, 2),
('Daniel', 'Quinn', 3, 1),
('Holly', 'Bahn', 4, 2); 