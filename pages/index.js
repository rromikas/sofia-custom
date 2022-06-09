import { useState } from "react";
import Login from "../components/Login";
import Importer from "../components/Importer";

export default function Index() {
  const [user, setUser] = useState();

  console.log({ user });

  return user ? (
    <Importer user={user}></Importer>
  ) : (
    <Login setUser={setUser}></Login>
  );
}
