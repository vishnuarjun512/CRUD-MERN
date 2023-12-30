import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDownloadURL,
  getStorage,
  list,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../Firebase.js";
import { toast, ToastContainer } from "react-toastify";

const Admin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [users, setUsers] = useState([]);
  const initialForm = { username: "", email: "", password: "" };
  const [form, setForm] = useState(initialForm);
  const [selectedUser, setSelectedUser] = useState(null);
  const [check, setCheck] = useState(null);

  // For FireBase Storage
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setForm({ ...form, profilePic: downloadURL })
        );
        setConfirmationMessage("Image successfully uploaded!");

        // Clear the confirmation message after 2 seconds
        setTimeout(() => {
          setConfirmationMessage("");
        }, 2000);
      }
    );
  };

  useEffect(() => {
    async function fetchUser() {
      const res = await axios.get("/api/user/getUser");
      setUsername(res.data.username);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      const res = await axios.get("/api/admin/getUsers");
      setUsers(
        res.data.data.filter((user) => {
          return user.isAdmin == false;
        })
      );
      // setUsers(res.data.data); Just to change the admin password
    }
    fetchUsers();
  }, [username]);

  const signout = async () => {
    try {
      const res = await axios.get(`/api/user/signout`);
      if (res.data.error) {
        toast.error(res.data.error);
        console.log(res.data.error);
      }
      toast.success(res.data.message);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async () => {
    if (check) {
      console.log(check);
      const res = await axios.delete(`/api/admin/deleteUser/${check._id}`);
      console.log(res.data);
      toast.success(res.data.message);
      setUsers(users.filter((user) => user._id !== check._id));
      setCheck(null);
    }
  };

  const updateForm = async (e) => {
    e.preventDefault();
    const res = await axios.post(
      `/api/admin/updateUser/${selectedUser._id}`,
      form
    );
    if (res.status === 200) {
      console.log(res.data);
      toast.success(res.data.message);
    } else {
      toast.error(res.data.error);
    }
    setUsers(
      users.map((user) =>
        user._id === res.data.data._id ? res.data.data : user
      )
    );

    setSelectedUser(null);
  };

  return (
    <div className="bg-[#7193ea] h-screen w-full relative">
      <ToastContainer />
      <div className="bg-white shadow-lg shadow-gray-500 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] h-[70%] w-[70%] p-3 overflow-auto">
        <button
          onClick={signout}
          className="bg-red-600 p-3 rounded-lg hover:bg-red-400 absolute top-3 right-3 "
        >
          Signout
        </button>
        <h1 className="w-full text-3xl text-center font-semibold">
          Welcome {username}
        </h1>

        <div className="mt-16">
          <table
            style={{
              width: "80%",
              borderCollapse: "collapse",
              textAlign: "center",
              margin: "auto",
            }}
          >
            <thead>
              <tr style={{ border: "3px solid #ddd" }}>
                <th style={{ border: "3px solid #ddd", padding: "8px" }}>ID</th>
                <th style={{ border: "3px solid #ddd", padding: "8px" }}>
                  Avatar
                </th>
                <th style={{ border: "3px solid #ddd", padding: "8px" }}>
                  Name
                </th>
                <th style={{ border: "3px solid #ddd", padding: "8px" }}>
                  Email
                </th>
                <th
                  colSpan={2}
                  style={{
                    border: "3px solid #ddd",
                    padding: "8px",
                  }}
                >
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} style={{ border: "3px solid #ddd" }}>
                  <td style={{ border: "3px solid #ddd", padding: "8px" }}>
                    {index + 1}
                  </td>
                  <td
                    className="flex justify-center items-center"
                    style={{ border: "3px solid #ddd", padding: "8px" }}
                  >
                    <img
                      src={user.profilePic}
                      alt="User Profile Image"
                      className="w-10 h-10 rounded-full object-cover self-center"
                    />
                  </td>
                  <td style={{ border: "3px solid #ddd", padding: "8px" }}>
                    {user.username}
                  </td>
                  <td style={{ border: "3px solid #ddd", padding: "8px" }}>
                    {user.email}
                  </td>
                  <td style={{ border: "3px solid #ddd", padding: "3px" }}>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setForm(user);
                      }}
                      className="bg-green-500 hover:scale-105 p-2 rounded-lg cursor-pointer"
                    >
                      Update
                    </button>
                  </td>
                  <td style={{ border: "3px solid #ddd", padding: "3px" }}>
                    <div
                      className={`flex justify-center gap-1 items-center w-[60px] mx-auto`}
                    >
                      <button
                        onClick={() => {
                          setCheck(user);
                          console.log(check);
                        }}
                        className={`${
                          !check || check.email !== user.email ? "" : "hidden"
                        } bg-red-500 hover:scale-105 p-2 rounded-lg cursor-pointer`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => deleteUser()}
                        className={`${
                          check && check.email === user.email ? "" : "hidden"
                        } bg-red-500 hover:scale-105 p-2 rounded-lg cursor-pointer`}
                      >
                        &#x2713;
                      </button>
                      <button
                        onClick={() => setCheck(null)}
                        className={`${
                          check && check.email === user.email ? "" : "hidden"
                        } bg-red-500 hover:scale-105 p-2 rounded-lg cursor-pointer`}
                      >
                        &#x2717;
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedUser && (
        <>
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-black opacity-40 z-5 w-[100%] h-[100%]"></div>
          <div className="p-5 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white opacity-100 z-10 w-[60%] md:w-[30%] h-[60%] flex flex-col justify-center items-center">
            <button
              onClick={() => {
                setSelectedUser(null);
              }}
              className="bg-red-600 p-3 rounded-lg hover:bg-red-300 absolute right-3 top-3"
            >
              Close
            </button>
            <form
              onSubmit={(e) => updateForm(e)}
              className="flex flex-col items-center justify-center p-3 rounded-lg h-[80%] w-[80%]"
            >
              <h1 className="text-2xl font-bold my-2 uppercase text-gray-400">
                Update User Info
              </h1>
              <input
                type="file"
                ref={fileRef}
                id="images"
                accept="image/*"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div
                className="flex flex-col"
                onClick={() => fileRef.current.click()}
              >
                <img
                  src={
                    form?.profilePic ||
                    `https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg`
                  }
                  alt="Profile"
                  className="rounded-full h-20 w-20 object-cover cursor-pointer self-center mt-2"
                />
                <p className="text-[15px] font-semibold cursor-pointer">
                  Upload Image
                </p>
                <p className="text-sm self-center whitespace-nowrap">
                  {fileUploadError ? (
                    <span className="text-red-700">
                      Error: Image must be less than 2 mb
                    </span>
                  ) : filePerc > 0 && filePerc < 100 ? (
                    <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
                  ) : confirmationMessage ? (
                    <span className="text-green-700">
                      {confirmationMessage}
                    </span>
                  ) : (
                    ""
                  )}
                </p>
              </div>
              <input
                className="bg-gray-500 m-1 rounded-lg p-3 outline-none w-full"
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <input
                className="bg-gray-500 m-1 rounded-lg p-3 outline-none w-full"
                type="password"
                placeholder="New Password"
                onChange={(e) =>
                  setForm({
                    ...form,
                    password:
                      e.target.value === ""
                        ? selectedUser.password
                        : e.target.value,
                  })
                }
              />
              <button className="bg-green-500 mt-3 p-3 rounded-lg">
                Update
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
