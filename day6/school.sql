-- Disable foreign key checks momentarily to drop tables if re-running
PRAGMA foreign_keys = ON;

-- 1. CREATE TABLES

-- Students Table
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- Courses Table
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL UNIQUE
);

-- Enrolments Table (Join table for Many-to-Many relationship)
CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id) -- Prevents duplicate enrolments for the same student/course
);

-- 2. INSERT SAMPLE DATA

-- Insert at least 3 Students
INSERT INTO students (first_name, last_name, email) VALUES
('Eze', 'Assumpta', 'eze.assumpta@example.com'),
('Chidi', 'Okonkwo', 'chidi.okonkwo@example.com'),
('Amina', 'Yusuf', 'amina.yusuf@example.com'),
('David', 'Smith', 'david.smith@example.com'); -- Student with no enrolments

-- Insert at least 3 Courses
INSERT INTO courses (course_name, course_code) VALUES
('Web Foundations', 'CS101'),
('Database Systems', 'CS201'),
('Cybersecurity Essentials', 'CS301');

-- Insert at least 5 Enrolments
INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'), -- Eze in Web Foundations
(1, 2, 'B'), -- Eze in Database Systems
(2, 1, 'B'), -- Chidi in Web Foundations
(2, 3, 'A'), -- Chidi in Cybersecurity
(3, 2, 'A'); -- Amina in Database Systems


-- 3. FIVE REQUIRED QUERIES

-- Query 1: All courses for one student (by student name: Eze Assumpta)
SELECT s.first_name, s.last_name, c.course_name, c.course_code, e.grade
FROM students s
JOIN enrolments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE s.first_name = 'Eze' AND s.last_name = 'Assumpta';

-- Query 2: All students on one course (by course name: Web Foundations)
SELECT c.course_name, s.first_name, s.last_name, s.email, e.grade
FROM courses c
JOIN enrolments e ON c.course_id = e.course_id
JOIN students s ON e.student_id = s.student_id
WHERE c.course_name = 'Web Foundations';

-- Query 3: The number of students per course
SELECT c.course_name, COUNT(e.student_id) AS total_students
FROM courses c
LEFT JOIN enrolments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name;

-- Query 4: Students who have no enrolments
SELECT s.student_id, s.first_name, s.last_name, s.email
FROM students s
LEFT JOIN enrolments e ON s.student_id = e.student_id
WHERE e.enrolment_id IS NULL;

-- Query 5: Update one enrolment's grade
UPDATE enrolments
SET grade = 'A+'
WHERE student_id = 1 AND course_id = 2;

-- Verify the update
SELECT s.first_name, c.course_name, e.grade
FROM enrolments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE e.student_id = 1 AND e.course_id = 2;