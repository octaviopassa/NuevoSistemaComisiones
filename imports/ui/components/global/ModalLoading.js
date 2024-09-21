import React from "react";
import { Modal, ModalHeader, ModalBody, Spinner } from "reactstrap";

export const ModalLoading = ({ isOpen, toggle, title, text }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader className="bg-primary" toggle={toggle}>{title}</ModalHeader>
      <ModalBody className="text-center">
        <Spinner color="primary" className="mb-5 mt-3">{""}</Spinner>

        {text && <div className="mt-3 text-primary">{text}</div>}
      </ModalBody>
    </Modal>
  );
};
