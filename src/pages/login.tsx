import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FiLock, FiPackage, FiTruck } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { LogoMark } from "../components/logo";
import { STORE } from "../config";
import { auth } from "../firebase";
import { getUser, useLoginMutation } from "../redux/api/userAPI";
import { userExist, userNotExist } from "../redux/reducer/userReducer";
import { RootState } from "../redux/store";
import { MessageResponse } from "../types/api-types";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const today = new Date().toISOString().slice(0, 10);

const Login = () => {
  useDocumentTitle("Sign in");
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.userReducer);
  const [login] = useLoginMutation();

  const [busy, setBusy] = useState(false);
  // Set when Google sign-in worked but this person has no account with us yet
  const [newUser, setNewUser] = useState<FirebaseUser | null>(null);
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  // Back to where the customer was going (e.g. checkout), or home
  const from = (location.state as { from?: string } | null)?.from || "/";
  if (user) return <Navigate to={from} replace />;

  const fail = async (message: string) => {
    toast.error(message);
    // Never leave someone signed in to Firebase without an account here
    await signOut(auth).catch(() => {});
    dispatch(userNotExist());
    setNewUser(null);
  };

  const continueWithGoogle = async () => {
    setBusy(true);
    try {
      const { user: fbUser } = await signInWithPopup(auth, new GoogleAuthProvider());
      try {
        // Returning customer: one click and done
        const data = await getUser(fbUser.uid);
        dispatch(userExist(data.user));
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) setNewUser(fbUser);
        else await fail("Could not sign you in. Please try again.");
      }
    } catch (err) {
      // Closing the Google popup is not an error worth shouting about
      const code = (err as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request")
        toast.error("Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const createAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUser) return;
    setBusy(true);
    const res = await login({
      name: newUser.displayName || "",
      email: newUser.email || "",
      photo: newUser.photoURL || "",
      gender,
      role: "user",
      dob,
      _id: newUser.uid,
    });

    if ("data" in res) {
      try {
        const data = await getUser(newUser.uid);
        dispatch(userExist(data.user));
        toast.success(`Welcome to ${STORE.name}!`);
      } catch {
        await fail("Account created, but we couldn't sign you in. Please try again.");
      }
    } else {
      const message = ((res.error as FetchBaseQueryError).data as MessageResponse)?.message;
      await fail(message || "Could not create your account.");
    }
    setBusy(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <aside className="auth-aside">
          <LogoMark />
          <h2>{STORE.name}</h2>
          <p>{STORE.tagline}</p>
          <ul>
            <li><FiTruck /> Free delivery on orders over ₹1,000</li>
            <li><FiPackage /> Track every order in one place</li>
            <li><FiLock /> Secure payments by Stripe</li>
          </ul>
        </aside>

        <div className="auth-main">
          {newUser ? (
            <form onSubmit={createAccount} className="auth-form">
              <h1>Almost there, {newUser.displayName?.split(" ")[0] || "friend"}</h1>
              <p className="text-muted">Tell us a little about you to finish creating your account.</p>

              <div className="field">
                <label htmlFor="gender">Gender</label>
                <select id="gender" className="input" required value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="dob">Date of birth</label>
                <input id="dob" type="date" className="input" required max={today}
                  value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>

              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
                {busy ? "Creating account…" : "Create account"}
              </button>
              <button type="button" className="btn btn-ghost btn-block" onClick={() => fail("Sign-up cancelled")}>
                Cancel
              </button>
            </form>
          ) : (
            <div className="auth-form">
              <h1>Welcome</h1>
              <p className="text-muted">Sign in or create an account to check out and track your orders.</p>
              <button className="btn btn-outline btn-lg btn-block google-btn" onClick={continueWithGoogle} disabled={busy}>
                <FcGoogle /> {busy ? "Signing in…" : "Continue with Google"}
              </button>
              <small className="text-muted">
                We only use your Google name, email and photo for your {STORE.name} account.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
