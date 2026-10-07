let storedUsers = [];

const loadUsersBtn = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusMsg = document.getElementById("status");
const usersList = document.getElementById("users-list");

function renderUsers(users) {
  usersList.innerHTML = "";

  if (users.length === 0) {
    statusMsg.textContent = "No users match your filter.";
    return;
  }

  statusMsg.textContent = `Showing ${users.length} user(s).`;

  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = `${user.name} | Email: ${user.email} | City: ${user.address.city} | Company: ${user.company.name}`;
    usersList.appendChild(li);
  });
}

async function loadUsers() {
  loadUsersBtn.disabled = true;
  statusMsg.textContent = "Loading users...";
  usersList.innerHTML = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    storedUsers = data;
    renderUsers(storedUsers);
  } catch (error) {
    statusMsg.textContent = "Failed to load users. Please try again.";
  } finally {
    loadUsersBtn.disabled = false;
  }
}

loadUsersBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = storedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm),
  );
  renderUsers(filtered);
});
