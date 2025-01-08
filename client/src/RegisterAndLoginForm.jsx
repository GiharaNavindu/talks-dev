// import axios from "axios";
// import { useContext, useState } from "react";
// import ParticleBackground from "./ParticleBackground.jsx";
// import { UserContext } from "./UserContext.jsx";

// export default function RegisterAndLoginForm() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
//   const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

//   async function handleSubmit(ev) {
//     ev.preventDefault();
//     const url = isLoginOrRegister === "register" ? "register" : "login";
//     const { data } = await axios.post(url, { username, password });
//     setLoggedInUsername(username);
//     setId(data.id);
//   }

//   return (
//     <div className="bg-blue-50 h-screen flex items-center relative overflow-hidden">
//       <ParticleBackground />
//       <form
//         className="w-64 mx-auto mb-12 bg-white p-8 rounded-lg shadow-lg z-10 transform transition-all duration-300 hover:scale-105"
//         onSubmit={handleSubmit}
//       >
//         <h2 className="text-2xl font-bold text-center mb-6 text-blue-500">
//           {isLoginOrRegister === "register" ? "Register" : "Login"}
//         </h2>
//         <input
//           value={username}
//           onChange={(ev) => setUsername(ev.target.value)}
//           type="text"
//           placeholder="Username"
//           className="block w-full rounded-sm p-2 mb-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//         />
//         <input
//           value={password}
//           onChange={(ev) => setPassword(ev.target.value)}
//           type="password"
//           placeholder="Password"
//           className="block w-full rounded-sm p-2 mb-6 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//         />
//         <button
//           type="submit"
//           className="bg-blue-500 text-white block w-full rounded-sm p-2 hover:bg-blue-600 transition-all"
//         >
//           {isLoginOrRegister === "register" ? "Register" : "Login"}
//         </button>
//         <div className="text-center mt-4 text-sm text-gray-600">
//           {isLoginOrRegister === "register" ? (
//             <div>
//               Already a member?
//               <button
//                 className="ml-1 text-blue-500 hover:text-blue-600 transition-all"
//                 onClick={() => setIsLoginOrRegister("login")}
//               >
//                 Login here
//               </button>
//             </div>
//           ) : (
//             <div>
//               Don't have an account?
//               <button
//                 className="ml-1 text-blue-500 hover:text-blue-600 transition-all"
//                 onClick={() => setIsLoginOrRegister("register")}
//               >
//                 Register
//               </button>
//             </div>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }

import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    const { data } = await axios.post(url, { username, password });
    setLoggedInUsername(username);
    setId(data.id);
  }
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?
              <button
                className="ml-1"
                onClick={() => setIsLoginOrRegister("login")}
              >
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div>
              Dont have an account?
              <button
                className="ml-1"
                onClick={() => setIsLoginOrRegister("register")}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
