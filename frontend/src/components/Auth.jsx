import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import {
  getDownloadURL,
  getStorage,
  list,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../Firebase.js";
import { setUser } from "../redux/userSlice/userSlice.js";
import axios from "axios";
import { useDispatch } from "react-redux";

const Auth = () => {
  const dispatch = useDispatch();
  const [login, setLogin] = useState(true);
  const [check, setCheck] = useState(false);
  console.log(check);
  const initialForm = {
    username: "",
    email: "",
    password: "",
    checkPassword: "",
    profilePic: `https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg`,
    mobile: "",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //For FireBase Storage
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
        if (file) {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
            setForm({ ...form, profilePic: downloadURL })
          );
          setConfirmationMessage("Image successfully uploaded!");
        } else {
          setForm({ ...form, profilePic: form.profilePic });
        }

        // Clear the confirmation message after 2 seconds
        setTimeout(() => {
          setConfirmationMessage("");
        }, 2000);
      }
    );
  };

  const formValidate = () => {
    if (
      !login &&
      (form.username == "" ||
        form.password == "" ||
        form.email == "" ||
        form.checkPassword == "")
    ) {
      if (form.username == "") {
        toast.error("Username is empty");
      } else if (form.email == "") {
        toast.error("Email is empty");
      } else if (form.password == "") {
        toast.error("Password is empty");
      } else if (form.checkPassword == "") {
        toast.error("Username is empty");
      }
      return false;
    }

    if (login && form.username === "") {
      toast.error("Username Empty");
      return false;
    }

    if (login && form.password === "") {
      toast.error("Password Empty");
      return false;
    }

    if (!login && form.password !== form.checkPassword) {
      toast.error("Password not matched");
      return false;
    }

    if (!login && form.password.length < 8) {
      toast.error("Password should have atleast 8 characters");
      return false;
    }

    if (form.username.length < 4) {
      toast.error("Atleast 4 characters for Username");
      return false;
    }
    setForm({ ...form, username: form.username.trim() });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    if (formValidate()) {
      // If the file is null, use the profilePic from the form directly
      try {
        const res = await axios.post(
          `/api/${check && !login ? "admin" : "user"}/${
            login ? "login" : "register"
          }`,
          form
        );
        if (res.data.error) {
          toast.error(res.data.message);
        }

        setLoading(false);
        if (res.status == 200) {
          toast.success(login ? "Login Success" : "Register Success");
          if (login) {
            setForm(initialForm);
            const user = res.data.user;
            dispatch(
              setUser({
                userId: user._id,
                username: user.username,
                profilePic: user.profilePic,
              })
            );
          } else {
          }

          setTimeout(() => {
            navigate(
              login ? (res.data.user.isAdmin ? "/admin" : "/dashboard") : "/"
            );
          }, 1000);
        }
        console.log(res);
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      } finally {
        setLogin(true);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-gradient-to-t from-[#c9d6ff] to-white h-screen w-full flex flex-row justify-center items-center relative`}
    >
      <div
        className={`bg-white ${
          login ? "flex" : "hidden md:flex"
        } flex-col items-center justify-center gap-8 h-[60%] md:h-[75%] w-[75%] md:w-[35%] rounded-[30px] md:rounded-r-[0px]`}
      >
        <div
          className={`${
            login ? "translate-x-0" : "md:translate-x-[50%] opacity-0"
          } transition-all duration-700 ease-in-out flex flex-col justify-center items-center w-full`}
        >
          <h1 className="text-3xl font-bold uppercase w-[70%] text-center">
            Sign In
          </h1>

          <hr className="" />
          <form
            onSubmit={handleSubmit}
            className="mt-5 w-[70%] flex flex-col items-center justify-center gap-3 p-3 "
          >
            <input
              type="text"
              className="bg-gray-200 p-4 rounded-lg outline-none w-full focus:scale-[1.1] transition-all duration-300 ease-in-out"
              placeholder="Email/Username"
              onChange={(e) => {
                setForm({
                  ...form,
                  username: e.target.value,
                  email: e.target.value,
                });
              }}
              value={form.username || form.email}
            />
            <input
              value={form.password}
              type="password"
              className="bg-gray-200 p-4 rounded-lg outline-none w-full focus:scale-[1.1] transition-all duration-300 ease-in-out"
              placeholder="Password"
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
              }}
            />
            <button className="bg-[#512da8] text-white font-semibold uppercase hover:scale-105 p-3 rounded-2xl cursor-pointer">
              <span className={`${loading ? "opacity-50" : ""}`}>
                {loading ? "Logging in ... " : "Login"}
              </span>
            </button>
          </form>

          <p className="block md:hidden text-sm md:text-xl font-semibold mt-5">
            New User?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => {
                setLogin(!login);
              }}
            >
              Register here
            </span>
          </p>

          <p className="text-blue-300 font-semibold cursor-pointer">
            Forgot your password?
          </p>
        </div>
      </div>
      <div
        className={`bg-white to-[#c9d6ff] ${
          login ? "hidden md:flex" : "flex"
        } flex-col items-center justify-center gap-2 h-[78%] md:h-[75%] w-[75%] md:w-[35%]  rounded-[30px] md:rounded-l-[0px]`}
      >
        <div
          className={`${
            login ? "md:translate-x-[-50%] opacity-0" : "translate-x-[0%]"
          } transition-all duration-700 ease-in-out flex flex-col justify-center items-center w-full`}
        >
          <h1 className="text-3xl font-bold uppercase">Sign Up</h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center gap-3 p-3 w-[70%]"
          >
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
                src={form.profilePic}
                alt="Profile"
                className="rounded-full h-20 w-20 object-cover cursor-pointer self-center mt-2"
              />
              <p className="text-[15px] font-semibold cursor-pointer">
                Upload Image
              </p>
              <p className="text-sm self-center">
                {fileUploadError ? (
                  <span className="text-red-700">
                    Error Image upload (image must be less than 2 mb)
                  </span>
                ) : filePerc > 0 && filePerc < 100 ? (
                  <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
                ) : confirmationMessage ? (
                  <span className="text-green-700">{confirmationMessage}</span>
                ) : (
                  ""
                )}
              </p>
            </div>
            <input
              value={form.username}
              type="text"
              className="bg-gray-200 p-4 rounded-lg outline-none w-full focus:scale-[1.1] transition-all duration-300 ease-in-out"
              placeholder="Username"
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
              }}
            />
            <input
              value={form.email}
              type="email"
              className="  bg-gray-200 p-4 rounded-lg outline-none w-full focus:scale-[1.1] transition-all duration-300 ease-in-out"
              placeholder="Email"
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
              }}
            />
            <input
              value={form.mobile}
              type="text"
              className="bg-gray-200 p-4 rounded-lg outline-none w-full focus:scale-[1.1] transition-all duration-300 ease-in-out"
              placeholder="Mobile"
              onChange={(e) => {
                setForm({ ...form, mobile: e.target.value });
              }}
            />
            <input
              value={form.password}
              type="password"
              className="  bg-gray-200 p-4 rounded-lg outline-none w-full focus:scale-[1.1] transition-all duration-300 ease-in-out"
              placeholder="Password"
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
              }}
            />
            <input
              value={form.checkPassword}
              type="password"
              className="  bg-gray-200 p-4 rounded-lg outline-none w-full focus:scale-[1.1] transition-all duration-300 ease-in-out"
              placeholder="Confirm Password"
              onChange={(e) => {
                setForm({ ...form, checkPassword: e.target.value });
              }}
            />
            <div className="flex items-center gap-2 justify-center">
              <label htmlFor="admin">Admin</label>
              <input
                name="admin"
                id="admin"
                type="checkbox"
                onChange={(e) => {
                  setCheck(e.target.checked);
                }}
              />
            </div>
            <button className="bg-[#512da8] text-white font-semibold uppercase hover:scale-105 p-3 rounded-2xl cursor-pointer">
              <span className={`${loading ? "opacity-50" : ""}`}>
                {loading ? "Signing Up ... " : "Register"}
              </span>
            </button>
          </form>

          <p className="block md:hidden text-sm md:text-xl font-semibold mt-3">
            Already a User?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => {
                setLogin(!login);
              }}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
      <div
        className={` hidden md:flex absolute z-10 flex-col gap-8 items-center justify-center h-[50%] md:h-[75%] w-[60%] md:w-[35%] duration-[1s] transition-all ease-in-out ${
          login
            ? "translate-x-[50%] bg-[#5c6bc0] rounded-l-[40%]"
            : "translate-x-[-50%] bg-[#512da8] rounded-r-[40%]"
        } `}
      >
        <h1 className="text-2xl lg:text-4xl text-white font-bold">
          {login ? "Hello Friend" : "Welcome back!"}
        </h1>
        <p className="px-[70px] text-base text-white text-center">
          {login
            ? "Register with your Personal details to use all of the site features"
            : "Enter your personal details to use all of the site features"}
        </p>
        <button
          onClick={() => {
            setLogin(!login);
            setForm(initialForm);
          }}
          className={`bg-transparent h-14 w-[120px] hover:bg-white text-white uppercase border-white hover:text-black border-2 p-3 rounded-2xl transition-all duration-200 ease-in-out`}
        >
          {login ? "Register" : "Login"}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Auth;
