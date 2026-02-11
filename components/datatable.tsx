"use client"
 
const users = [
  { id: 1, name: "sai", email: "sai@gmail.com", role: "Admin", dept: "IT", location: "India", status: "Active" },
  { id: 2, name: "Mayan", email: "mayan@gmail.com", role: "User", dept: "HR", location: "USA", status: "Inactive" },
  { id: 3, name: "Teja", email: "teja@gmail.com", role: "Manager", dept: "Finance", location: "UK", status: "Active" },
  { id: 4, name: "Ravi", email: "ravi@gmail.com", role: "User", dept: "IT", location: "India", status: "Active" },
  { id: 5, name: "Suresh", email: "suresh@gmail.com", role: "Admin", dept: "Ops", location: "Canada", status: "Inactive" },
  { id: 6, name: "Anjali", email: "anjali@gmail.com", role: "User", dept: "HR", location: "India", status: "Active" },
  { id: 7, name: "Kiran", email: "kiran@gmail.com", role: "Manager", dept: "Sales", location: "Germany", status: "Active" },
  { id: 8, name: "Pooja", email: "pooja@gmail.com", role: "User", dept: "Finance", location: "India", status: "Inactive" },
  { id: 9, name: "Arjun", email: "arjun@gmail.com", role: "Admin", dept: "IT", location: "USA", status: "Active" },
  { id: 10, name: "Sneha", email: "sneha@gmail.com", role: "User", dept: "Marketing", location: "India", status: "Active" },
]
 
export default function TablePage() {
  return (
    <div className=" bg-gray-100 flex justify-center p-10">
      {/* CARD */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-7xl p-6">
 
 
        {/* TABLE WRAPPER */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead className="bg-gray-100 text-left text-sm">
              <tr>
                <th className="sticky left-0 z-20 bg-gray-100 px-4 py-3 w-20">
                  S.No
                </th>
                <th className="sticky left-20 z-20 bg-gray-100 px-4 py-3 w-48">
                  Name
                </th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
 
            <tbody className="text-sm">
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50"
                >
                  {/* S.No (Sticky) */}
                  <td className="sticky left-0 bg-white z-10 px-4 py-3 font-medium">
                    {index + 1}
                  </td>
 
                  {/* Name (Sticky) */}
                  <td className="sticky left-20 bg-white z-10 px-4 py-3 font-semibold">
                    {user.name}
                  </td>
 
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.dept}</td>
                  <td className="px-4 py-3">{user.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 
      </div>
    </div>
  )
}