import React, { useEffect, useState } from "react";
import EmpresasService from "../../services/empresas";

import { LoginForm } from "./components";

function Login() {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    const load = async () => {
      const e = await EmpresasService.getAll();
      setEmpresas(transformEmpresas(e));
    };

    load();
  }, []);

  function transformEmpresas(array) {
    return array.map((item) => ({
      value: JSON.stringify(item),
      label: item.BASE_DATOS.trim(),
    }));
  }

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
                      Sistema de Reembolsos
                    </h2>
                    <div className="fs-lg fw-300 p-5 bg-white border-faded rounded mb-g">
                      <h3 className="mb-g">Seguimiento de Reembolsos</h3>
                      <p className="text-justify">
                        ¡Bienvenido a nuestro sistema de gestión de Reembolsos!
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
                <div className="position-absolute pos-bottom pos-left pos-right p-3 text-center text-white">
                  Sistema de Reembolsos
                  <a
                    href="https://www.passa.com.mx/home.html"
                    className="text-white opacity-40 fw-500 ml-3"
                    title="passa.com.mx"
                    target="_blank"
                  >
                    passa.com.mx
                  </a>
                  <div className="float-right">v0.0.1</div>
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
