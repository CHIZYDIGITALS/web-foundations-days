# School Database Design Explanation

## 1. Table Explanations & Relationships

- **students**: Stores core information about registered students, including their primary key (`student_id`), full name, and a unique email address.
- **courses**: Holds course details such as `course_id`, `course_name`, and a unique `course_code`.
- **enrolments**: Serves as a **join table** linking `students` and `courses`. It contains foreign keys referencing both tables alongside context-specific metadata (`grade`).

### Relationship Types

- **One-to-Many**: The relationship between `students` and `enrolments` is one-to-many (a single student can have multiple enrolment records). Similarly, the relationship between `courses` and `enrolments` is one-to-many (a single course can contain multiple enrolment records).
- **Many-to-Many**: The overall relationship between `students` and `courses` is **many-to-many** (a student can enrol in multiple courses, and a course can have many enrolled students).
- **Why a Join Table is Needed**: Relational databases cannot directly implement many-to-many relationships without data duplication and integrity issues. The `enrolments` join table breaks the many-to-many relationship into two manageable one-to-many relationships while providing a structured location to store relationship attributes like grades.

---

## 2. Recommended Index

I would add an index on `enrolments(student_id)`:

```sql
CREATE INDEX idx_enrolments_student_id ON enrolments(student_id);
Reason: Foreign key columns used in JOIN conditions and WHERE clauses (such as looking up all courses for a specific student) are queried frequently. Creating an index on student_id prevents full table scans on large enrolment datasets, significantly accelerating join operations and filtering performance.

3. SQL vs. NoSQL Choice
For this school database system, I would choose SQL (Relational Database). Educational records rely on strict data integrity, structured schemas, ACID compliance, and clear relational constraints (such as preventing duplicate enrolments and enforcing foreign key relationships between students, courses, and grades). SQL databases handle complex relational joins naturally, ensuring that grade records remain accurate and consistent across the entire platform.
```
