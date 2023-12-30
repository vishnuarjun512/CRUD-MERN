import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetUser, setUser } from "../redux/userSlice/userSlice";
import { toast } from "react-toastify";
import {
  getDownloadURL,
  getStorage,
  list,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../Firebase.js";

const Dashboard = () => {
  const { username, userId, profilePic } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [defaultpassword, setDefaultPassword] = useState(null);

  const [click, profileClick] = useState(false);
  const [form, setForm] = useState(null);

  // For FireBase Storage
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(`api/user/profile`);
      const user = res.data.user;
      if (res.data.error) {
        toast.error(res.data.error);
      }
      dispatch(
        setUser({
          userId: user._id,
          username: user.username,
          profilePic: user.profilePic,
        })
      );
      console.log(profilePic);
      setProfileUser(user);
      setDefaultPassword(user.password);
    };
    fetchProfile();
  }, []);

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
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setForm({ ...form, profilePic: downloadURL });
          dispatch(setUser({ username, userId, profilePic: downloadURL }));
        });
        setConfirmationMessage("Image successfully uploaded!");

        setTimeout(() => {
          setConfirmationMessage("");
        }, 2000);
      }
    );
  };

  const signout = async () => {
    try {
      const res = await axios.get(`/api/user/signout`);
      if (res.data.error) {
        toast.error(res.data.error);
      }

      toast.success(res.data.message);
      setTimeout(() => {
        dispatch(resetUser());
        navigate("/");
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  };

  const updateForm = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/user/updateUser/${form._id}`, {
        ...form,
        admin: false,
      });

      if (res.status === 200) {
        dispatch(
          setUser({
            username: res.data.data.username,
            userId: res.data.newData._id,
            profilePic: res.data.newData.profilePic,
          })
        );

        toast.success(res.data.message);
      } else {
        toast.error(res.data.error);
      }
    } catch (error) {
      console.log("Update Error -> ", error);
    } finally {
      setForm(null);
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await axios.delete(`/api/user/delete/${userId}`);
      if (res.data.error) {
        toast.error(res.data.error);
      }
      toast.success(res.data.message);
      signout();
    } catch (error) {
      console.log("Error Deleting Account -> ", error);
    }
  };

  return (
    <div className="flex items-center justify-start flex-col gap-5 h-screen bg-gradient-to-t from-[#c9d6ff] to-white">
      <nav className="bg-blue-200 flex justify-between items-center p-4 w-full rounded-lg h-[4rem]">
        <h1 className="text-lg md:text-2xl font-bold cursor-pointer p-4">
          Dashboard
        </h1>
        <div className="flex items-center gap-1 md:gap-4">
          <p className="text-base md:text-xl font-semibold p-2 cursor-pointer hover:underline rounded-lg hover:bg-blue-400">
            Home
          </p>
          <p className="text-base md:text-xl font-semibold p-2 cursor-pointer hover:underline rounded-lg hover:bg-blue-400">
            About
          </p>
          <p className="text-base md:text-xl font-semibold p-2 cursor-pointer hover:underline rounded-lg hover:bg-blue-400">
            Contact
          </p>
          <div
            onClick={() => profileClick(!click)}
            className="relative inline-block text-left"
          >
            <div>
              <div className="text-xl w-12 h-12 relative group/item font-semibold cursor-pointer rounded-lg hover:bg-blue-400">
                <img
                  src={profilePic}
                  className="rounded-full group-hover:scale-105"
                  alt=""
                />
              </div>
            </div>

            <div
              className={`absolute ${
                click ? "block" : "hidden"
              } right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex="-1"
            >
              <div className="py-1" role="none">
                <a
                  href="#"
                  className="hover:bg-gray-600 hover:text-white text-gray-700 block px-4 py-2 text-sm"
                  role="menuitem"
                  tabIndex="-1"
                  id="menu-item-0"
                  onClick={() => {
                    setForm(profileUser);
                  }}
                >
                  Account settings
                </a>
                <a
                  href="#"
                  className="hover:bg-gray-600 hover:text-white text-gray-700 block px-4 py-2 text-sm"
                  role="menuitem"
                  tabIndex="-1"
                  id="menu-item-1"
                >
                  Support
                </a>
                <a
                  href="#"
                  className="hover:bg-gray-600 hover:text-white text-gray-700 block px-4 py-2 text-sm"
                  role="menuitem"
                  tabIndex="-1"
                  id="menu-item-2"
                >
                  License
                </a>
                <button
                  onClick={signout}
                  className="hover:bg-gray-600 hover:text-white text-gray-700 block w-full px-4 py-2 text-left text-sm"
                  role="menuitem"
                  tabIndex="-1"
                  id="menu-item-3"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex flex-col gap-2 flex-grow items-center justify-center">
        <img
          className="w-20 h-20 rounded-full"
          src={profilePic}
          alt="Logged In User"
        />
        <h1 className="text-3xl font-semibold">Welcome {username}</h1>
        <h2 className="text-2xl font-medium">Id : {userId}</h2>
        <button
          onClick={signout}
          className="p-3 bg-[#1b2d6a] hover:bg-[#485da4] text-white rounded-lg"
        >
          Signout
        </button>
      </div>
      {form && (
        <>
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-black opacity-40 z-5 w-[100%] h-[100%]"></div>
          <div className="p-5 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white opacity-100 z-10 w-[60%] md:w-[30%] h-[60%] flex flex-col justify-center items-center">
            <button
              onClick={() => {
                setForm(null);
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
                      e.target.value === "" ? defaultpassword : e.target.value,
                  })
                }
              />
              <div className="flex flex-col">
                <button
                  type="submit"
                  className="bg-green-500 hover:scale-105 hover:bg-green-400 mt-3 p-3 rounded-lg"
                >
                  Update
                </button>
                <div
                  onClick={deleteAccount}
                  className="bg-red-500 hover:scale-105 hover:bg-red-400 mt-3 p-3 rounded-lg"
                >
                  Delete Account
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
