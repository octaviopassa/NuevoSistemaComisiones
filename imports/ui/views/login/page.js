import React, { useEffect, useState } from "react";
import toastr from "toastr";
import { EmpresasService } from "../../services";
import { LoginForm } from "./components";
import { useUserLoggedStore } from "../../store";

function Login() {
  const [empresas, setEmpresas] = useState([]);
  const { isLogged } = useUserLoggedStore();

  useEffect(() => {
    EmpresasService.getAll()
      .then((response) => {
        setEmpresas(response);
      })
      .catch((error) => {
        console.log(error);
        toastr.error(error.reason);
      });
  }, []);

  // if (isLogged) {
  //   window.location.href = "/gastos";
  // }

  return (
    <div>
      <div className="page-wrapper auth">
        <div className="page-inner bg-brand-gradient">
          <div className="page-content-wrapper bg-transparent m-0">
            <div className="flex-1 backMain">
              <div className="container py-4 py-lg-5 my-lg-5 px-4 px-sm-0">
                <div className="row">
                  <div className="col col-md-6 col-lg-7 hidden-sm-down">
                    <img src="/img/logo.png" width={300} />
                    <h2 className="fs-xxl fw-500 mt-4 text-white">
                      Sistema de Comisiones
                    </h2>
                    <div className="fs-lg fw-300 p-5 bg-white border-faded rounded mb-g">
                      <h3 className="mb-g">Seguimiento de Comisiones</h3>
                      <p className="text-justify">
                        ¡Bienvenido a nuestro sistema de gestión de Comisiones!
                      </p>
                      <p className="text-justify"></p>
                      <p className="text-justify"></p>
                      <p className="text-justify"></p>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6 col-lg-5 col-xl-4 ml-auto">
                    <h2 className="fs-xxl fw-500 mt-4 text-white">
                      Iniciar Sesión
                    </h2>

                    <LoginForm empresas={empresas} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
