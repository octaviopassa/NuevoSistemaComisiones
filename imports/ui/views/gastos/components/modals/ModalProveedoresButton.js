import React, { useState } from "react";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ModalProveedores } from "./ModalProveedores";

export const ModalProveedoresButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggle = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <FontAwesomeIcon
        cursor={"pointer"}
        className="ml-1"
        icon={faGear}
        onClick={toggle}
      />

      {isModalOpen && (
        <ModalProveedores isModalOpen={isModalOpen} toggle={toggle} />
      )}
    </>
  );
};
