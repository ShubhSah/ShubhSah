import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTrash, FaEdit } from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch users
  const fetchUsers = () => {
    fetch("https://shubhsah-production.up.railway.app")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ➕ Add User
  const handleAddUser = async () => {
    if (!name || !email) {
      alert("Fill all fields ❌");
      return;
    }

    await fetch("http://localhost:5000/add-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    setName("");
    setEmail("");
    fetchUsers();
  };

  // ✏️ Update User
  const handleUpdate = async () => {
    await fetch(`http://localhost:5000/update-user/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    setEditId(null);
    setName("");
    setEmail("");
    fetchUsers();
  };

  // ❌ Delete User
  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/delete-user/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
  };

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // 🔍 Filter users
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">

      {/* 🟦 Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-5">
        <h2 className="text-xl font-bold mb-5">Placement Tracker</h2>

        <p className="mb-3 flex items-center gap-2">
          <FaUser /> Dashboard
        </p>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded mt-5"
        >
          Logout
        </button>
      </div>

      {/* 🟩 Main Content */}
      <div className="flex-1 p-5 bg-gray-100">

        {/* 🔥 Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-5">

          <div className="bg-white p-4 rounded shadow">
            <h3>Total Users</h3>
            <p className="text-xl font-bold">{users.length}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3>Active</h3>
            <p className="text-xl font-bold text-green-500">
              {users.length}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3>Placed</h3>
            <p className="text-xl font-bold text-blue-500">
              {Math.floor(users.length / 2)}
            </p>
          </div>

        </div>

        {/* ➕ FORM + SEARCH */}
        <div className="bg-white p-4 rounded shadow mb-5">

          <h3 className="text-lg font-semibold mb-2">
            {editId ? "Edit User" : "Add User"}
          </h3>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Search user..."
            className="border p-2 mb-3 w-full"
            onChange={(e) => setSearch(e.target.value)}
          />

          {editId ? (
            <button
              onClick={handleUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          ) : (
            <button
              onClick={handleAddUser}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          )}
        </div>

        {/* 📊 TABLE */}
        <div className="bg-white p-4 rounded shadow">

          <h3 className="text-xl font-bold mb-3">Users List</h3>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center">No users found</p>
          ) : (
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="text-center hover:bg-gray-100 transition"
                  >
                    <td className="p-2 border">{user.name}</td>
                    <td className="p-2 border">{user.email}</td>

                    <td className="p-2 border">
                      <button
                        onClick={() => {
                          setEditId(user.id);
                          setName(user.name);
                          setEmail(user.email);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 mr-2 rounded flex items-center gap-1 justify-center"
                      >
                        <FaEdit /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1 justify-center"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;