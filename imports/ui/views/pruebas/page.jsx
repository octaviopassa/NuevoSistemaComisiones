import React from "react";
import useUserLoggedStore from "../../store/userLogged";
import useUserLenguageStore from "../../store/userLenguage";
import useUserModulesStore from "../../store/userModules";
import useUserRolStore from "../../store/userRol";
import useUserSession from "../../store/userSession";
// import { Meteor } from 'meteor/meteor';

export default function Pruebas() {
  const {isLogged, setUserLogged} = useUserLoggedStore()
  const {setUserLenguage} = useUserLenguageStore()
  const {setAllowedModules, allowedModules} = useUserModulesStore()
  const {setUserRol} = useUserRolStore()
  const {setUserSession, resetUserSession} = useUserSession()

  return (
    <div>
      page
      <button
        onClick={async() => {
          console.log(allowedModules)
        }}
      >
        Imprimir
      </button>
    </div>
  );
}
