import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";

export const ModalButton = ({
  text = "",
  icon,
  color = "",
  buttonClasses = "",
  ModalComponent,
  ...props
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggle = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <Button className={`p-0 ${buttonClasses}`} color={color} onClick={toggle}>
        {text}
        {icon && (
          <FontAwesomeIcon cursor={"pointer"} className="ml-1" icon={icon} />
        )}
      </Button>

      {isModalOpen && (
        <ModalComponent isModalOpen={isModalOpen} toggle={toggle} {...props} />
      )}
    </>
  );
};
